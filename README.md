# YangsAI Web Workspace

This repository now hosts two Astro apps:

- Main site at `apps/main`: `yangs.ai`
- Benchmarks portal at `apps/benchmarks`: `benchmarks.yangs.ai`

Brand assets are shared from `packages/brand` and synced into each app's `public/brand` directory.

## Structure

```text
/
├── apps/
│   └── main/
│       ├── src/
│       └── public/
│   └── benchmarks/
│       ├── src/
│       └── package.json
├── packages/
│   └── brand/              # Shared logo/favicon source
├── tools/
│   └── sync-brand.mjs
└── package.json
```

## Commands

Run from repository root:

| Command | Action |
| :-- | :-- |
| `npm run dev` | Start main site dev server |
| `npm run dev:main` | Start main site dev server |
| `npm run dev:benchmarks` | Start benchmarks app dev server |
| `npm run sync:brand` | Copy shared brand assets into both apps |
| `npm run build` | Build main site |
| `npm run build:main` | Build main site |
| `npm run build:benchmarks` | Build benchmarks app |
| `npm run build:all` | Build both apps in sequence |
| `npm run preview:main` | Preview main site build |
| `npm run preview:benchmarks` | Preview benchmarks build |

## Notes

- The benchmarks app was scaffolded with the official `create-astro` flow.
- The main app is now located at `apps/main`.
- Deploy each app independently and bind domains per target platform:
	- Main app -> `yangs.ai`
	- Benchmarks app -> `benchmarks.yangs.ai`

Both apps run `prebuild` automatically to sync shared assets from `packages/brand`.
