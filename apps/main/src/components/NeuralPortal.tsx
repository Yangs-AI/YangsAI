import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import NetworkLayer from "./NetworkLayer";
import PrimaryNode from "./PrimaryNode";
import { homeFeaturedLinks } from "../data/homeFeaturedLinks";
import { HOME_NEWS_HOME_LIMIT, homeNewsItems } from "../data/homeNewsItems";
import { coreNode, portalNodes, type PortalNodeId } from "../data/portalNodes";

type NodePositionMap = Record<PortalNodeId, { x: number; y: number }>;
type Point = { x: number; y: number };
type CorePosition = { x: number; y: number };
type NewsTextSegment = { text: string; isPaperTitle: boolean };

const NODE_DRAG_THRESHOLD_PX = 5;

function splitNewsRichText(text: string): NewsTextSegment[] {
  const segments: NewsTextSegment[] = [];
  const pattern = /\[\[(.+?)\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isPaperTitle: false });
    }
    segments.push({ text: match[1], isPaperTitle: true });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isPaperTitle: false });
  }

  return segments.length > 0 ? segments : [{ text, isPaperTitle: false }];
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function cubicAt(t: number, p0: number, p1: number, p2: number, p3: number) {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function sampleCubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, steps = 8) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return {
      x: cubicAt(t, p0.x, p1.x, p2.x, p3.x),
      y: cubicAt(t, p0.y, p1.y, p2.y, p3.y),
    };
  });
}

function buildStrandSamplePoints(nodePositions: NodePositionMap, core: CorePosition) {
  const points: Point[] = [];

  portalNodes.forEach((node, nodeIndex) => {
    const pos = nodePositions[node.id];
    const dx = pos.x - core.x;
    const dy = pos.y - core.y;
    const len = Math.max(0.001, Math.hypot(dx, dy));
    const nx = -dy / len;
    const ny = dx / len;

    const strandCount = Math.max(1, node.subItems.length);
    const baseOffsets = Array.from({ length: strandCount }, (_, i) => {
      const mid = (strandCount - 1) / 2;
      return (i - mid) * 1.7;
    });

    Array.from({ length: strandCount }).forEach((_, strandIndex) => {
      const side = strandIndex % 2 === 0 ? 1 : -1;
      const wave = (nodeIndex + 1) * (strandIndex + 1) * 0.9;
      const base = baseOffsets[strandIndex] * side;
      const drift = Math.sin(wave) * 3.8;
      const offset = base + drift;

      const c1x = core.x * 0.67 + pos.x * 0.33 + nx * (8 + offset);
      const c1y = core.y * 0.67 + pos.y * 0.33 + ny * (8 + offset);
      const c2x = core.x * 0.33 + pos.x * 0.67 - nx * (6 - offset * 0.5);
      const c2y = core.y * 0.33 + pos.y * 0.67 - ny * (6 - offset * 0.5);

      points.push(
        ...sampleCubicBezier(core, { x: c1x, y: c1y }, { x: c2x, y: c2y }, { x: pos.x, y: pos.y }, 8),
      );
    });
  });

  return points;
}

const DESKTOP_FIXED_LAYOUT: NodePositionMap = {
  research: { x: 35.498, y: 20.9284 },
  resources: { x: 90.1171, y: 52.313 },
  community: { x: 13.6436, y: 41.8864 },
  team: { x: 76.6481, y: 75.8675 },
  founder: { x: 32.193, y: 71.1542 },
};

function getDefaultLayout(isMobile: boolean): NodePositionMap {
  if (!isMobile) {
    return DESKTOP_FIXED_LAYOUT;
  }

  return portalNodes.reduce((acc, node) => {
    acc[node.id] = { ...node.positionMobile };
    return acc;
  }, {} as NodePositionMap);
}

function getLayoutStorageKey(isMobile: boolean) {
  return isMobile ? "yangsai-neuron-layout-mobile-v1" : "yangsai-neuron-layout-desktop-v1";
}

function getCoreStorageKey(isMobile: boolean) {
  return isMobile ? "yangsai-core-layout-mobile-v1" : "yangsai-core-layout-desktop-v1";
}

function getDefaultCorePosition(isMobile: boolean): CorePosition {
  return { x: 50, y: isMobile ? 42 : 50 };
}

function isPositionMap(value: unknown): value is NodePositionMap {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return ["research", "resources", "community", "team", "founder"].every((id) => {
    const pos = record[id] as Record<string, unknown> | undefined;
    return (
      pos &&
      typeof pos.x === "number" &&
      typeof pos.y === "number" &&
      Number.isFinite(pos.x) &&
      Number.isFinite(pos.y)
    );
  });
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function isValidPlacement(
  candidate: { x: number; y: number },
  placed: Array<{ x: number; y: number }>,
  core: { x: number; y: number },
  minNodeGap: number,
  minCoreGap: number,
) {
  if (distance(candidate, core) < minCoreGap) {
    return false;
  }
  return placed.every((pos) => distance(candidate, pos) >= minNodeGap);
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}

export default function NeuralPortal() {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile(1200);
  const [lowPerformanceMode, setLowPerformanceMode] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<PortalNodeId | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<PortalNodeId | null>(null);
  const [hoveredSubitem, setHoveredSubitem] = useState<{ nodeId: PortalNodeId; index: number } | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement | null>(null);
  const networkViewportRef = useRef<HTMLDivElement | null>(null);
  const [containerAspectRatio, setContainerAspectRatio] = useState(1);
  const [layoutHydrated, setLayoutHydrated] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [panelOpen, setPanelOpen] = useState({ news: false, featured: false, info: true });
  const [activeNewsId, setActiveNewsId] = useState<string | null>(null);
  const dragStateRef = useRef<{
    nodeId: PortalNodeId;
    offsetX: number;
    offsetY: number;
    startClientX: number;
    startClientY: number;
    moved: boolean;
  } | null>(null);
  const coreDragStateRef = useRef<{
    offsetX: number;
    offsetY: number;
    startClientX: number;
    startClientY: number;
    moved: boolean;
  } | null>(null);

  const [nodePositions, setNodePositions] = useState<NodePositionMap>(() => getDefaultLayout(isMobile));
  const [corePosition, setCorePosition] = useState<CorePosition>(() => getDefaultCorePosition(isMobile));

  useEffect(() => {
    const syncTheme = () => {
      setIsLightTheme(document.documentElement.dataset.theme === "light");
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewport = networkViewportRef.current;
    if (!viewport) {
      return;
    }

    const updateAspect = () => {
      const rect = viewport.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerAspectRatio(rect.width / rect.height);
      }
    };

    updateAspect();
    const observer = new ResizeObserver(updateAspect);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nav = window.navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = Boolean(nav.connection?.saveData);
    const lowCpu = (nav.hardwareConcurrency ?? 8) <= 4;
    const lowMemory = (nav.deviceMemory ?? 8) <= 4;

    setLowPerformanceMode(prefersReduced || saveData || lowCpu || lowMemory);
  }, []);

  useEffect(() => {
    setLayoutHydrated(false);
    const storageKey = getLayoutStorageKey(isMobile);
    const coreStorageKey = getCoreStorageKey(isMobile);
    const fallback = getDefaultLayout(isMobile);
    const fallbackCore = getDefaultCorePosition(isMobile);
    let nextPositions = fallback;
    let nextCore = fallbackCore;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (isPositionMap(parsed)) {
          nextPositions = parsed;
        }
      }

      const coreRaw = window.localStorage.getItem(coreStorageKey);
      if (coreRaw) {
        const parsedCore = JSON.parse(coreRaw) as unknown;
        if (
          parsedCore &&
          typeof parsedCore === "object" &&
          typeof (parsedCore as Record<string, unknown>).x === "number" &&
          typeof (parsedCore as Record<string, unknown>).y === "number"
        ) {
          nextCore = {
            x: (parsedCore as Record<string, number>).x,
            y: (parsedCore as Record<string, number>).y,
          };
        }
      }
    } catch {}

    setNodePositions(nextPositions);
    setCorePosition(nextCore);
    setLayoutHydrated(true);
  }, [isMobile]);

  useEffect(() => {
    if (!layoutHydrated) {
      return;
    }
    const storageKey = getLayoutStorageKey(isMobile);
    const coreStorageKey = getCoreStorageKey(isMobile);
    window.localStorage.setItem(storageKey, JSON.stringify(nodePositions));
    window.localStorage.setItem(coreStorageKey, JSON.stringify(corePosition));
  }, [nodePositions, corePosition, isMobile, layoutHydrated]);

  useEffect(() => {
    if (isMobile) {
      setHoveredNodeId(null);
      setHoveredSubitem(null);
    }
  }, [isMobile]);

  useEffect(() => {
    setPanelOpen(isMobile ? { news: false, featured: false, info: true } : { news: true, featured: true, info: true });
  }, [isMobile]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveNewsId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const insideNeuron = target.closest("[data-neuron-root]");
      const insideCore = target.closest("[data-core-node]");
      const insidePanel = target.closest("[data-info-panel]");
      if (!insideNeuron && !insideCore && !insidePanel) {
        setActiveNodeId(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      const drag = dragStateRef.current;
      const container = sectionRef.current;
      if (!drag || !container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const dragDistance = Math.hypot(event.clientX - drag.startClientX, event.clientY - drag.startClientY);
      if (dragDistance < NODE_DRAG_THRESHOLD_PX) {
        return;
      }

      const nextX = event.clientX - rect.left - drag.offsetX;
      const nextY = event.clientY - rect.top - drag.offsetY;
      const nextXPct = (nextX / rect.width) * 100;
      const nextYPct = (nextY / rect.height) * 100;
      const clampedX = Math.max(8, Math.min(92, nextXPct));
      const clampedY = Math.max(10, Math.min(88, nextYPct));
      const candidate = { x: clampedX, y: clampedY };
      const core = corePosition;
      const minNodeGap = isMobile ? 22 : 18;
      const minCoreGap = isMobile ? 24 : 20;

      setNodePositions((prev) => {
        const others = (Object.entries(prev) as Array<[PortalNodeId, { x: number; y: number }]>).filter(
          ([id]) => id !== drag.nodeId,
        );
        const placed = others.map(([, pos]) => pos);

        if (!isValidPlacement(candidate, placed, core, minNodeGap, minCoreGap)) {
          return prev;
        }

        dragStateRef.current = { ...drag, moved: true };
        return {
          ...prev,
          [drag.nodeId]: candidate,
        };
      });
    };

    const handleUp = () => {
      if (dragStateRef.current) {
        window.setTimeout(() => {
          dragStateRef.current = null;
        }, 0);
      }
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [corePosition, isMobile]);

  useEffect(() => {
    const handleCoreMove = (event: PointerEvent) => {
      const drag = coreDragStateRef.current;
      const container = sectionRef.current;
      if (!drag || !container) {
        return;
      }

      const dragDistance = Math.hypot(event.clientX - drag.startClientX, event.clientY - drag.startClientY);
      if (dragDistance < NODE_DRAG_THRESHOLD_PX) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const nextX = event.clientX - rect.left - drag.offsetX;
      const nextY = event.clientY - rect.top - drag.offsetY;
      const nextXPct = (nextX / rect.width) * 100;
      const nextYPct = (nextY / rect.height) * 100;
      setCorePosition({
        x: Math.max(20, Math.min(80, nextXPct)),
        y: Math.max(20, Math.min(80, nextYPct)),
      });
      coreDragStateRef.current = { ...drag, moved: true };
    };

    const handleCoreUp = () => {
      if (coreDragStateRef.current) {
        window.setTimeout(() => {
          coreDragStateRef.current = null;
        }, 0);
      }
    };

    window.addEventListener("pointermove", handleCoreMove);
    window.addEventListener("pointerup", handleCoreUp);
    return () => {
      window.removeEventListener("pointermove", handleCoreMove);
      window.removeEventListener("pointerup", handleCoreUp);
    };
  }, []);

  const handleNodePointerDown = (nodeId: PortalNodeId, event: ReactPointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    const container = sectionRef.current;
    const pos = nodePositions[nodeId];
    if (!container || !pos) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const nodeX = (pos.x / 100) * rect.width;
    const nodeY = (pos.y / 100) * rect.height;

    dragStateRef.current = {
      nodeId,
      offsetX: event.clientX - rect.left - nodeX,
      offsetY: event.clientY - rect.top - nodeY,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    };
  };

  const handleNodeClick = (nodeId: PortalNodeId) => {
    if (dragStateRef.current?.nodeId === nodeId && dragStateRef.current.moved) {
      return;
    }

    const targetNode = portalNodes.find((node) => node.id === nodeId);
    if (targetNode && targetNode.subItems.length === 0 && targetNode.links.length === 0) {
      const fallback = targetNode.fallbackLink;
      if (!fallback?.href || fallback.draft) {
        window.dispatchEvent(new CustomEvent("show-maintenance-notice"));
        return;
      }

      if (fallback.external) {
        window.open(fallback.href, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = fallback.href;
      }
      return;
    }

    setActiveNodeId((prev) => (prev === nodeId ? null : nodeId));
  };

  const handleCorePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    const container = sectionRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const coreX = (corePosition.x / 100) * rect.width;
    const coreY = (corePosition.y / 100) * rect.height;
    coreDragStateRef.current = {
      offsetX: event.clientX - rect.left - coreX,
      offsetY: event.clientY - rect.top - coreY,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    };
  };

  const hoveredNode = useMemo(
    () => portalNodes.find((node) => node.id === hoveredNodeId) ?? null,
    [hoveredNodeId],
  );

  const activeNode = useMemo(
    () => portalNodes.find((node) => node.id === activeNodeId) ?? null,
    [activeNodeId],
  );

  const infoNode = hoveredNode ?? activeNode;

  const sortedNewsItems = useMemo(
    () => [...homeNewsItems].sort((a, b) => new Date(b.publishedOn).getTime() - new Date(a.publishedOn).getTime()),
    [],
  );

  const latestNewsItems = useMemo(
    () => sortedNewsItems.slice(0, Math.max(1, HOME_NEWS_HOME_LIMIT)),
    [sortedNewsItems],
  );

  const activeNewsItem = useMemo(
    () => sortedNewsItems.find((item) => item.id === activeNewsId) ?? null,
    [sortedNewsItems, activeNewsId],
  );

  const activeNewsIndex = useMemo(
    () => sortedNewsItems.findIndex((item) => item.id === activeNewsId),
    [sortedNewsItems, activeNewsId],
  );

  const previousNewsItem = activeNewsIndex >= 0 ? sortedNewsItems[activeNewsIndex - 1] ?? null : null;
  const nextNewsItem = activeNewsIndex >= 0 ? sortedNewsItems[activeNewsIndex + 1] ?? null : null;

  const renderNewsRichText = (text: string, keyPrefix: string) => (
    <>
      {splitNewsRichText(text).map((segment, index) =>
        segment.isPaperTitle ? (
          <span
            key={`${keyPrefix}-${index}`}
            className={`mx-[0.08rem] inline rounded-md px-1 py-[0.03rem] font-semibold italic ${
              isLightTheme
                ? "bg-amber-100/95 text-amber-950"
                : "bg-amber-300/16 text-amber-100"
            }`}
          >
            {segment.text}
          </span>
        ) : (
          <span key={`${keyPrefix}-${index}`}>{segment.text}</span>
        ),
      )}
    </>
  );

  const panelLinks = useMemo(() => {
    if (!infoNode) {
      return [];
    }

    if (infoNode.subItems.length === 0 && infoNode.links.length === 0) {
      return [];
    }

    return infoNode.links.map((link) => ({
      label: link.label,
      href: link.href,
      external: link.external,
      draft: link.draft,
    }));
  }, [infoNode]);

  const fireflies = useMemo(
    () =>
      Array.from({ length: lowPerformanceMode ? (isMobile ? 10 : 16) : isMobile ? 18 : 28 }, (_, i) => {
        const x = ((i * 31) % 100) + ((i % 4) - 1.5) * 1.25;
        const y = ((i * 23) % 100) + ((i % 5) - 2) * 1.15;
        const sizeRem = 0.14 + (i % 4) * 0.07;
        const alpha = 0.2 + (i % 5) * 0.075;
        const driftX = ((i % 3) - 1) * (0.6 + (i % 4) * 0.26);
        const driftY = ((i % 4) - 1.5) * (0.8 + (i % 5) * 0.22);
        const duration = 3.8 + (i % 6) * 0.75;
        const delay = (i % 7) * 0.24;
        return { x, y, sizeRem, alpha, driftX, driftY, duration, delay };
      }),
    [isMobile, lowPerformanceMode],
  );

  const strandSamplePoints = useMemo(
    () => (reduceMotion || lowPerformanceMode ? [] : buildStrandSamplePoints(nodePositions, corePosition)),
    [nodePositions, corePosition, reduceMotion, lowPerformanceMode],
  );

  const firefliesWithAttraction = useMemo(() => {
    if (reduceMotion || lowPerformanceMode) {
      return fireflies.map((firefly) => ({ ...firefly, attraction: 0 }));
    }

    const influenceRadius = isMobile ? 7.2 : 6.6;

    // Fireflies brighten near sampled neural strands to feel subtly "drawn" by the network.
    return fireflies.map((firefly) => {
      let minDist = Number.POSITIVE_INFINITY;

      for (const sample of strandSamplePoints) {
        const dx = firefly.x - sample.x;
        const dy = firefly.y - sample.y;
        const d = Math.hypot(dx, dy);
        if (d < minDist) {
          minDist = d;
        }
      }

      const attraction = Math.pow(clamp01(1 - minDist / influenceRadius), 1.6);
      return { ...firefly, attraction };
    });
  }, [fireflies, strandSamplePoints, isMobile, reduceMotion, lowPerformanceMode]);

  const flowDotRxScale = useMemo(() => {
    if (!Number.isFinite(containerAspectRatio) || containerAspectRatio <= 0) {
      return 1;
    }
    return 1 / containerAspectRatio;
  }, [containerAspectRatio]);

  // Expansion is click-driven to keep subitems open while users explore.
  const expandedNodeId = activeNodeId;

  // Convert pointer position into a tiny parallax vector for the whole network layer.
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || lowPerformanceMode) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setPointer({ x: (x - 0.5) * 2, y: (y - 0.5) * 2 });
  };

  return (
    <div className="h-full min-h-0">
      <LayoutGroup id="yangs-portal-layout">
        <div className={isMobile ? "flex w-full flex-col gap-3" : "grid h-full min-h-0 grid-cols-[minmax(0,1fr)_22rem] gap-3"}>
        <section
          ref={sectionRef}
          data-neural-portal
          className={`relative w-full min-h-[26rem] overflow-hidden rounded-2xl border shadow-[0_10px_40px_rgba(0,0,0,0.35)] ${
            isMobile ? "h-[46vh] min-h-[18rem] shrink-0" : "h-full"
          } ${
            isLightTheme
              ? "border-slate-700/20 bg-[rgba(247,251,255,0.82)] shadow-[0_16px_38px_rgba(94,120,152,0.22)]"
              : "border-white/20 bg-[rgba(18,18,22,0.52)]"
          }`}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            setPointer({ x: 0, y: 0 });
            setHoveredNodeId(null);
            setHoveredSubitem(null);
          }}
          aria-label="YangsAI neural portal"
        >
      <motion.div
        className="absolute inset-0"
        animate={{
          x: reduceMotion ? 0 : pointer.x * 8,
          y: reduceMotion ? 0 : pointer.y * 8,
        }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(250,252,255,0.12),transparent_60%)]" />
        <div className={`absolute left-[14%] top-[18%] h-56 w-56 rounded-full blur-3xl ${isLightTheme ? "bg-sky-300/24" : "bg-white/14"}`} />
        <div className={`absolute right-[8%] top-[6%] h-72 w-72 rounded-full blur-3xl ${isLightTheme ? "bg-blue-300/22" : "bg-zinc-200/12"}`} />
        <div className={`absolute bottom-[8%] left-[44%] h-56 w-56 rounded-full blur-3xl ${isLightTheme ? "bg-slate-300/20" : "bg-zinc-300/10"}`} />
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {firefliesWithAttraction.map((firefly, index) => (
            <motion.span
              key={`firefly-${index}`}
              className="absolute rounded-full bg-zinc-100"
              style={{
                left: `${firefly.x}%`,
                top: `${firefly.y}%`,
                width: `${firefly.sizeRem}rem`,
                height: `${firefly.sizeRem}rem`,
              }}
              initial={false}
              animate={
                reduceMotion
                  ? {
                      x: 0,
                      y: 0,
                      opacity: firefly.alpha + firefly.attraction * 0.2,
                      scale: 1 + firefly.attraction * 0.18,
                    }
                  : {
                      x: [0, firefly.driftX * 8, 0],
                      y: [0, firefly.driftY * 8, 0],
                      opacity: [
                        firefly.alpha * (0.42 + firefly.attraction * 0.2),
                        firefly.alpha + firefly.attraction * 0.32,
                        firefly.alpha * (0.55 + firefly.attraction * 0.24),
                      ],
                      scale: [1, 1.08 + firefly.attraction * 0.36, 1],
                    }
              }
              transition={{
                duration: firefly.duration,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: firefly.delay,
              }}
            />
          ))}
        </div>
      </motion.div>

      <div
        ref={networkViewportRef}
        className="absolute inset-0"
      >
        <>
      <NetworkLayer
        nodes={portalNodes}
        nodePositions={nodePositions}
        corePosition={corePosition}
        hoveredId={hoveredNodeId}
        activeId={activeNodeId}
        hoveredSubitem={hoveredSubitem}
        isMobile={isMobile}
        lowPerformanceMode={lowPerformanceMode}
        flowDotRxScale={flowDotRxScale}
        isLightTheme={isLightTheme}
      />

      <div className="absolute inset-0 z-20">
        {portalNodes.map((node, index) => {
          const position = nodePositions[node.id];
          const highlighted = hoveredNodeId === node.id || activeNodeId === node.id;
          const orbitBiasAngle = Math.atan2(corePosition.y - position.y, corePosition.x - position.x);

          return (
            <PrimaryNode
              key={node.id}
              node={node}
              position={position}
              isMobile={isMobile}
              orbitBiasAngle={orbitBiasAngle}
              depth={1 + (index % 3)}
              highlighted={highlighted}
              expanded={expandedNodeId === node.id}
              hoveredSubitemIndex={hoveredSubitem?.nodeId === node.id ? hoveredSubitem.index : null}
              // Desktop uses hover-to-expand, mobile uses tap-to-expand only.
              onHoverStart={() => {
                setHoveredNodeId(node.id);
              }}
              onHoverEnd={() => {
                setHoveredNodeId(null);
                setHoveredSubitem(null);
              }}
              onSubitemHover={(index) => {
                if (index === null) {
                  setHoveredSubitem(null);
                  return;
                }
                setHoveredNodeId(node.id);
                setHoveredSubitem({ nodeId: node.id, index });
              }}
              onPointerDown={(event) => handleNodePointerDown(node.id, event)}
              onClick={() => handleNodeClick(node.id)}
            />
          );
        })}
      </div>

      <motion.div
        className={`absolute z-20 flex h-20 w-24 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-[58%_42%_49%_51%/48%_56%_44%_52%] border text-center backdrop-blur-sm active:cursor-grabbing md:h-24 md:w-28 ${
          isLightTheme
            ? "border-slate-700/24 bg-[radial-gradient(circle_at_42%_36%,rgba(248,252,255,0.96),rgba(203,217,236,0.88)_64%)] shadow-[0_10px_24px_rgba(101,128,164,0.24)]"
            : "border-zinc-100/24 bg-[radial-gradient(circle_at_42%_36%,rgba(236,241,249,0.1),rgba(23,24,30,0.94)_64%)] shadow-[0_8px_22px_rgba(4,6,12,0.54)]"
        }`}
        style={{ left: `${corePosition.x}%`, top: `${corePosition.y}%` }}
        onPointerDown={handleCorePointerDown}
        animate={{
          rotate: reduceMotion ? 0 : [0, 0.9, -0.8, 0],
          boxShadow: reduceMotion
            ? "0 10px 24px rgba(6,10,18,0.56)"
            : [
              "0 8px 22px rgba(6,10,18,0.5)",
              "0 11px 28px rgba(8,12,20,0.62)",
              "0 8px 22px rgba(6,10,18,0.5)",
              ],
        }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        aria-label={coreNode.shortDescription}
        role="button"
        tabIndex={0}
        data-core-node
        onClick={() => {
          if (coreDragStateRef.current?.moved) {
            return;
          }
          setActiveNodeId(null);
          setHoveredSubitem(null);
          setHoveredNodeId(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setActiveNodeId(null);
            setHoveredSubitem(null);
            setHoveredNodeId(null);
          }
        }}
      >
        <span className={`font-tech relative z-10 text-xs font-semibold tracking-[0.16em] md:text-sm ${isLightTheme ? "text-slate-800" : "text-zinc-100/88"}`}>
          {coreNode.label}
        </span>
      </motion.div>
      </>
      </div>

      <button
        type="button"
        data-reset-layout
        className={`absolute left-2 top-2 z-50 cursor-pointer rounded-lg border px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.12em] focus-visible:outline-none focus-visible:ring-2 md:left-auto md:right-2 md:top-auto md:bottom-2 ${
          isLightTheme
            ? "border-slate-700/26 bg-white/90 text-slate-800 hover:bg-slate-100 focus-visible:ring-slate-700/58"
            : "border-zinc-100/24 bg-[rgba(20,20,24,0.88)] text-zinc-200 hover:bg-zinc-100/12 focus-visible:ring-zinc-200/85"
        }`}
        onClick={() => {
          setNodePositions(getDefaultLayout(isMobile));
          setCorePosition(getDefaultCorePosition(isMobile));
        }}
      >
        Reset Layout
      </button>
        </section>

        <div className={isMobile ? "flex w-full flex-col gap-3 pb-2" : "flex min-h-0 flex-col gap-3"}>
          {homeNewsItems.length > 0 ? (
            <aside
              className={`rounded-2xl border p-3 backdrop-blur-md ${
                isLightTheme
                  ? "border-amber-700/24 bg-[rgba(255,248,236,0.94)] shadow-[0_12px_26px_rgba(167,131,77,0.18)]"
                  : "border-amber-200/20 bg-[rgba(34,26,16,0.78)]"
              }`}
              data-news-panel
            >
              <div className="mb-1 flex items-center justify-between">
                <p className={`text-sm font-semibold tracking-wide ${isLightTheme ? "text-amber-900" : "text-amber-100"}`}>News</p>
                {isMobile ? (
                  <button
                    type="button"
                    onClick={() => setPanelOpen((prev) => ({ ...prev, news: !prev.news }))}
                    className={`rounded-md border px-1.5 py-0.5 text-[0.62rem] uppercase tracking-[0.08em] ${
                      isLightTheme ? "border-amber-800/30 text-amber-800" : "border-amber-100/30 text-amber-100"
                    }`}
                  >
                    {panelOpen.news ? "Hide" : "Show"}
                  </button>
                ) : null}
              </div>
              {!isMobile || panelOpen.news ? <div className="space-y-1.5">
                {latestNewsItems.map((item) => (
                  <button
                    key={`news-${item.id}`}
                    type="button"
                    onClick={() => setActiveNewsId(item.id)}
                    className={`block w-full cursor-pointer rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${
                      isLightTheme
                        ? "border-amber-800/20 bg-amber-50/80 text-amber-900 hover:bg-amber-100/80"
                        : "border-amber-100/20 bg-amber-200/8 text-amber-50 hover:bg-amber-200/14"
                    }`}
                  >
                    <span className="font-medium">{item.title}</span>
                    <span className={`mt-0.5 block text-[0.66rem] ${isLightTheme ? "text-amber-700" : "text-amber-100/70"}`}>
                      {new Date(`${item.publishedOn}T00:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                    </span>
                  </button>
                ))}
                <a
                  href="/news"
                  className={`inline-block rounded-lg border px-2.5 py-1.5 text-[0.68rem] font-medium transition-colors ${
                    isLightTheme
                      ? "border-amber-800/20 bg-amber-50/70 text-amber-900 hover:bg-amber-100/80"
                      : "border-amber-100/20 bg-amber-200/8 text-amber-50 hover:bg-amber-200/14"
                  }`}
                >
                  View All News
                </a>
              </div> : null}
            </aside>
          ) : null}

          {homeFeaturedLinks.length > 0 ? (
            <aside
              className={`rounded-2xl border p-3 backdrop-blur-md ${
                isLightTheme
                  ? "border-indigo-700/24 bg-[rgba(238,244,255,0.94)] shadow-[0_12px_26px_rgba(90,118,154,0.2)]"
                  : "border-indigo-200/20 bg-[rgba(23,24,36,0.82)]"
              }`}
              data-featured-panel
            >
              <div className="mb-1 flex items-center justify-between">
                <p className={`text-sm font-semibold tracking-wide ${isLightTheme ? "text-indigo-900" : "text-indigo-100"}`}>Featured</p>
                {isMobile ? (
                  <button
                    type="button"
                    onClick={() => setPanelOpen((prev) => ({ ...prev, featured: !prev.featured }))}
                    className={`rounded-md border px-1.5 py-0.5 text-[0.62rem] uppercase tracking-[0.08em] ${
                      isLightTheme ? "border-indigo-800/30 text-indigo-800" : "border-indigo-100/30 text-indigo-100"
                    }`}
                  >
                    {panelOpen.featured ? "Hide" : "Show"}
                  </button>
                ) : null}
              </div>
              {!isMobile || panelOpen.featured ? <div className="flex flex-wrap gap-2">
                {homeFeaturedLinks.map((link) => (
                  <a
                    key={`featured-${link.label}-${link.href}`}
                    href={link.href || "#"}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    data-draft-link={link.draft || !link.href ? "true" : undefined}
                    className={`rounded-xl border px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 ${
                      isLightTheme
                        ? "border-indigo-700/24 bg-indigo-50/88 text-indigo-900 hover:bg-indigo-100/84 focus-visible:ring-indigo-700/60"
                        : "border-indigo-100/24 bg-indigo-200/10 text-indigo-50 hover:bg-indigo-200/18 focus-visible:ring-indigo-100/70"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div> : null}
            </aside>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.aside
              key={infoNode?.id ?? "core"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`rounded-2xl border p-3 backdrop-blur-md ${
                isLightTheme
                  ? "border-sky-700/24 bg-[rgba(244,250,255,0.94)] shadow-[0_12px_26px_rgba(90,118,154,0.2)]"
                  : "border-sky-200/24 bg-[rgba(18,24,34,0.82)]"
              } ${isMobile ? "" : "h-[23rem] overflow-y-auto"}`}
              data-info-panel
            >
              <div className="mb-1 flex items-center justify-between">
                <p className={`text-sm font-semibold tracking-wide ${isLightTheme ? "text-sky-900" : "text-sky-100"}`} data-info-panel-title>
                  {infoNode?.label ?? coreNode.label}
                </p>
                {isMobile ? (
                  <button
                    type="button"
                    onClick={() => setPanelOpen((prev) => ({ ...prev, info: !prev.info }))}
                    className={`rounded-md border px-1.5 py-0.5 text-[0.62rem] uppercase tracking-[0.08em] ${
                      isLightTheme ? "border-sky-800/30 text-sky-800" : "border-sky-100/30 text-sky-100"
                    }`}
                  >
                    {panelOpen.info ? "Hide" : "Show"}
                  </button>
                ) : null}
              </div>
              {!isMobile || panelOpen.info ? (
                <>
                  <p className={`mb-2 text-xs leading-relaxed ${isLightTheme ? "text-slate-700" : "text-zinc-300/92"}`}>
                    {infoNode?.shortDescription ?? coreNode.shortDescription}
                  </p>
                  {infoNode?.detailDescription && infoNode.detailDescription !== infoNode.shortDescription ? (
                    <p className={`mb-2 text-xs leading-relaxed ${isLightTheme ? "text-slate-600" : "text-zinc-400/92"}`}>{infoNode.detailDescription}</p>
                  ) : null}
                  {panelLinks.length > 0 ? (
                <>
                  <p className={`mb-1 text-[0.65rem] uppercase tracking-[0.12em] ${isLightTheme ? "text-slate-600" : "text-zinc-300/64"}`}>
                    Curated Links
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {panelLinks.map((link) => (
                      <a
                        key={`${link.label}-${link.href}`}
                        href={link.href || "#"}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noreferrer" : undefined}
                        data-draft-link={link.draft || !link.href ? "true" : undefined}
                        className={`rounded-xl border px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 ${
                          isLightTheme
                            ? "border-sky-700/24 bg-sky-50/88 text-sky-900 hover:bg-sky-100/84 focus-visible:ring-sky-700/60"
                            : "border-sky-100/24 bg-sky-200/10 text-sky-50 hover:bg-sky-200/18 focus-visible:ring-sky-100/70"
                        }`}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </>
                  ) : null}
                </>
              ) : null}
            </motion.aside>
          </AnimatePresence>

          <aside
            className={`rounded-2xl border p-3 backdrop-blur-md ${
              isLightTheme
                ? "border-emerald-700/24 bg-[rgba(236,252,248,0.94)] shadow-[0_12px_26px_rgba(86,145,126,0.18)]"
                : "border-emerald-200/20 bg-[rgba(19,34,30,0.8)]"
            }`}
            data-thanks-panel
          >
            <div className="mb-1.5 flex items-center justify-between">
              <p className={`text-sm font-semibold tracking-wide ${isLightTheme ? "text-emerald-900" : "text-emerald-100"}`}>Thanks</p>
              <span className={`rounded-md border px-1.5 py-0.5 text-[0.62rem] uppercase tracking-[0.08em] ${isLightTheme ? "border-emerald-800/24 text-emerald-800" : "border-emerald-100/26 text-emerald-100/90"}`}>
                Note
              </span>
            </div>
            <p className={`mb-2 text-xs leading-relaxed ${isLightTheme ? "text-emerald-800" : "text-emerald-50/90"}`}>
              {isMobile
                ? "Acknowledgement to Prof. Jianfeng Zhan for mentorship and support."
                : "Acknowledgement to Prof. Jianfeng Zhan for mentorship and support that made this research journey possible."}
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="/thanks"
                className={`rounded-xl border px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 ${
                  isLightTheme
                    ? "border-emerald-700/24 bg-emerald-50/88 text-emerald-900 hover:bg-emerald-100/84 focus-visible:ring-emerald-700/60"
                    : "border-emerald-100/24 bg-emerald-200/10 text-emerald-50 hover:bg-emerald-200/18 focus-visible:ring-emerald-100/70"
                }`}
              >
                Read Thanks
              </a>
              {!isMobile ? (
                <a
                  href="https://www.zhanjianfeng.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-xl border px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 ${
                    isLightTheme
                      ? "border-emerald-700/24 bg-emerald-50/88 text-emerald-900 hover:bg-emerald-100/84 focus-visible:ring-emerald-700/60"
                      : "border-emerald-100/24 bg-emerald-200/10 text-emerald-50 hover:bg-emerald-200/18 focus-visible:ring-emerald-100/70"
                  }`}
                >
                  Prof. Zhan Website
                </a>
              ) : null}
            </div>
          </aside>
        </div>

        <AnimatePresence>
          {activeNewsItem ? (
            <motion.div
              className="absolute inset-0 z-[120] flex items-center justify-center bg-[rgba(4,8,18,0.45)] px-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveNewsId(null)}
            >
              <motion.article
                className={`w-[min(92vw,40rem)] rounded-2xl border p-4 ${
                  isLightTheme
                    ? "border-slate-700/20 bg-[rgba(252,254,255,0.98)] text-slate-900"
                    : "border-zinc-100/18 bg-[rgba(22,24,32,0.96)] text-zinc-100"
                }`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-[0.68rem] uppercase tracking-[0.12em] ${isLightTheme ? "text-slate-600" : "text-zinc-300/72"}`}>News</p>
                    <h3 className="mt-1 text-lg font-semibold leading-snug">{activeNewsItem.title}</h3>
                    <p className={`mt-1 text-xs ${isLightTheme ? "text-slate-600" : "text-zinc-300/72"}`}>
                      {new Date(`${activeNewsItem.publishedOn}T00:00:00`).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!previousNewsItem}
                      onClick={() => setActiveNewsId(previousNewsItem?.id ?? null)}
                      className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        isLightTheme
                          ? "border-slate-700/24 bg-slate-100/90 text-slate-800 hover:bg-slate-200/80"
                          : "border-zinc-100/24 bg-white/8 text-zinc-100 hover:bg-white/14"
                      }`}
                    >
                      Newer
                    </button>
                    <button
                      type="button"
                      disabled={!nextNewsItem}
                      onClick={() => setActiveNewsId(nextNewsItem?.id ?? null)}
                      className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        isLightTheme
                          ? "border-slate-700/24 bg-slate-100/90 text-slate-800 hover:bg-slate-200/80"
                          : "border-zinc-100/24 bg-white/8 text-zinc-100 hover:bg-white/14"
                      }`}
                    >
                      Older
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNewsId(null)}
                      className={`cursor-pointer rounded-md border px-2 py-1 text-xs ${
                        isLightTheme
                          ? "border-slate-700/24 bg-slate-100/90 text-slate-800 hover:bg-slate-200/80"
                          : "border-zinc-100/24 bg-white/8 text-zinc-100 hover:bg-white/14"
                      }`}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div
                  className={`mb-3 rounded-xl border px-3 py-2.5 text-[0.94rem] leading-relaxed ${
                    isLightTheme
                      ? "border-sky-700/18 bg-sky-50/80 text-slate-800"
                      : "border-sky-100/20 bg-sky-300/8 text-zinc-100"
                  }`}
                >
                  {renderNewsRichText(activeNewsItem.summary, `${activeNewsItem.id}-summary`)}
                </div>
                <div
                  className={`space-y-2 border-t pt-2 ${
                    isLightTheme ? "border-slate-700/12" : "border-zinc-100/10"
                  }`}
                >
                  {activeNewsItem.body.map((paragraph, index) => (
                    <p
                      key={`${activeNewsItem.id}-p-${index}`}
                      className={`text-sm leading-relaxed ${isLightTheme ? "text-slate-700" : "text-zinc-200"}`}
                    >
                      {renderNewsRichText(paragraph, `${activeNewsItem.id}-body-${index}`)}
                    </p>
                  ))}
                </div>
                {activeNewsItem.ctaHref ? (
                  <a
                    href={activeNewsItem.ctaHref}
                    target={activeNewsItem.ctaExternal ? "_blank" : undefined}
                    rel={activeNewsItem.ctaExternal ? "noreferrer" : undefined}
                    className={`mt-3 inline-block rounded-lg border px-3 py-1.5 text-xs ${
                      isLightTheme
                        ? "border-sky-700/24 bg-sky-50/88 text-sky-900 hover:bg-sky-100/84"
                        : "border-sky-100/24 bg-sky-200/10 text-sky-50 hover:bg-sky-200/18"
                    }`}
                  >
                    {activeNewsItem.ctaLabel ?? "Read More"}
                  </a>
                ) : null}
              </motion.article>
            </motion.div>
          ) : null}
        </AnimatePresence>
        </div>
      </LayoutGroup>
    </div>
  );
}
