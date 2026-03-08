export type PortalNodeId =
  | "research"
  | "resources"
  | "community"
  | "team"
  | "founder";

export interface NodeLink {
  label: string;
  href: string;
  external?: boolean;
  draft?: boolean;
}

export interface SubItemLink {
  label: string;
  href: string;
  external?: boolean;
  draft?: boolean;
}

export interface PortalNode {
  id: PortalNodeId;
  label: string;
  shortDescription: string;
  detailDescription: string;
  positionDesktop: { x: number; y: number };
  positionMobile: { x: number; y: number };
  subItems: SubItemLink[];
  links: NodeLink[];
  fallbackLink?: NodeLink;
}

export const coreNode = {
  id: "core",
  label: "YangsAI",
  shortDescription: "Official Yangs AI website: research, datasets, benchmarks, and initiatives for fundamental AI.",
  detailDescription:
    "Official Yangs AI website: research, datasets, benchmarks, and initiatives for fundamental AI.",
  positionDesktop: { x: 50, y: 50 },
  positionMobile: { x: 50, y: 42 },
} as const;

export const portalNodes: PortalNode[] = [
  {
    id: "research",
    label: "Research",
    shortDescription: "Papers, projects, and long-term research directions.",
    detailDescription:
      "Explore the research landscape of YangsAI through papers, projects, and evolving directions across neural networks, AI systems, and foundational studies.",
    positionDesktop: { x: 18, y: 21 },
    positionMobile: { x: 24, y: 16 },
    subItems: [
      { label: "Papers", href: "/research/papers" },
      { label: "Projects", href: "/research/projects" },
      { label: "Directions", href: "/research/directions" },
    ],
    links: [
      { label: "Selected Papers", href: "/research/papers/selected" },
      { label: "Selected Projects", href: "/research/projects/selected" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    shortDescription: "Datasets, benchmarks, and documentation for reproducible AI research.",
    detailDescription:
      "Access research resources across datasets, benchmarks, and documentation, including representative entries such as Younger Datasets, Probing Memes, and FRESH documentation.",
    positionDesktop: { x: 82, y: 18 },
    positionMobile: { x: 78, y: 26 },
    subItems: [
      { label: "Datasets", href: "https://datasets.yangs.ai", external: true },
      { label: "Benchmarks", href: "https://benchmarks.yangs.ai", external: true },
      { label: "Documentations", href: "https://documentations.yangs.ai", external: true, draft: true },
    ],
    links: [
      {
        label: "Younger Datasets",
        href: "https://datasets.yangs.ai/younger",
        external: true,
      },
      {
        label: "Probing Memes",
        href: "https://benchmarks.yangs.ai/probing-memes",
        external: true,
      },
      {
        label: "FRESH Documentation",
        href: "https://fresh.research.jason-young.me",
        external: true,
      }
    ],
  },
  {
    id: "community",
    label: "Community",
    shortDescription:
      "Journals and organizational activities across the YangsAI ecosystem.",
    detailDescription:
      "Follow the scholarly and organizational side of YangsAI through hosted journals and the Yangs AI GitHub organization, where publications, code, and broader academic activities are brought together.",
    positionDesktop: { x: 33, y: 46 },
    positionMobile: { x: 21, y: 52 },
    subItems: [
      { label: "Journals", href: "/community/journals" , draft: true },
      { label: "Organizations", href: "/community/organizations" , draft: true },
    ],
    links: [
      { label: "Communications of the BenchCouncil", href: "/community/journals/cbench" , draft: true },
      { label: "Yangs AI on GitHub", href: "https://github.com/yangs-ai", external: true },
    ],
  },
  {
    id: "team",
    label: "Team",
    shortDescription: "Team introduction and member profiles.",
    detailDescription:
      "Get to know the YangsAI team through a concise introduction and member pages that present the people behind its research, resources, and academic activities.",
    positionDesktop: { x: 86, y: 76 },
    positionMobile: { x: 82, y: 76 },
    subItems: [
      { label: "About", href: "/team/about" },
      { label: "Members", href: "/team/members" },
    ],
    links: [
      { label: "YANG Yikang", href: "/team/members/yang-yikang" },
      { label: "PENG Luzhou", href: "/team/members/peng-luzhou" },
    ],
  },
  {
    id: "founder",
    label: "Founder",
    shortDescription: "Founder of YangsAI.",
    detailDescription:
      "Learn more about Jason Young, the founder of YangsAI, through his personal website and broader academic presence.",
    positionDesktop: { x: 14, y: 84 },
    positionMobile: { x: 26, y: 82 },
    subItems: [
        { label: "YANG Zhengxin", href: "https://jason-young.me", external: true },
    ],
    links: [
    ],
    // fallbackLink: {
    //   label: "YANG Zhengxin",
    //   href: "https://jason-young.me",
    //   external: true,
    // },
  },
];
