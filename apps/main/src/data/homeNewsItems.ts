export interface HomeNewsItem {
  id: string;
  title: string;
  publishedOn: string;
  summary: string;
  body: string[];
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
}

// Homepage shows only the latest items; all items are listed on /news.
export const HOME_NEWS_HOME_LIMIT = 3;

// Edit this list to control both the homepage News panel and /news history page.
export const homeNewsItems: HomeNewsItem[] = [
  {
    id: "probing-memes-platform-launch-2026-03",
    title: "Probing Memes evaluation platform launched",
    publishedOn: "2026-03-11",
    summary: "The Probing Memes platform provides leaderboard benchmarking and fine-grained behavioral analysis for large models and datasets.",
    body: [
      "The platform hosts model and dataset leaderboards for large model evaluation.",
      "It also offers online tools for analyzing fine-grained behaviors and capability patterns of models and datasets.",
      "Researchers can explore model behaviors interactively through the Probing Memes interface.",
    ],
    ctaLabel: "Explore Platform",
    ctaHref: "https://probing-memes.benchmarks.yangs.ai/",
  },
  {
    id: "two-new-papers-released-2026-03",
    title: "Two new research papers released",
    publishedOn: "2026-03-10",
    summary: "YangsAI released two new papers on neural architecture discovery and LLM evaluation.",
    body: [
      "[[GraDE: A Graph Diffusion Estimator for Frequent Subgraph Discovery in Neural Architectures.]]",
      "[[Probing Memes in LLMs: A Paradigm for the Entangled Evaluation World.]]",
      "Both papers are now available on the research papers page.",
    ],
    ctaLabel: "View Papers",
    ctaHref: "/research/papers/",
  },
  {
    id: "yangsai-website-launch-2026-03",
    title: "YangsAI website is now online",
    publishedOn: "2026-03-08",
    summary: "The YangsAI website is now live, introducing our research directions, projects, and resources.",
    body: [
      "The site presents YangsAI's research directions, team members, and ongoing projects.",
      "Visitors can explore publications, benchmarks, datasets, and community resources.",
      "We welcome everyone to explore the platform and learn more about our work.",
    ],
    ctaLabel: "Visit YangsAI",
    ctaHref: "https://yangs.ai/",
  },
];