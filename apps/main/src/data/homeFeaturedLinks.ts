export interface HomeFeaturedLink {
  label: string;
  href: string;
  external?: boolean;
  draft?: boolean;
  note?: string;
}

// Edit this list to customize the homepage featured panel.
export const homeFeaturedLinks: HomeFeaturedLink[] = [
  {
    label: "Benchmark: Probing Memes",
    href: "https://probing-memes.benchmarks.yangs.ai",
    note: "Leaderboard and analysis platform for the Probing Memes paradigm, evaluating large language models through population-level probing.",
  },
  {
    label: "Selected Papers",
    href: "/research/papers/selected",
    note: "Recent highlighted publications",
  },
];
