export interface ProjectEntry {
  id: string;
  title: string;
  summary: string;
  status: "active" | "completed" | "paused";
  updatedOn: string;
  projectUrl?: string;
  codeUrl?: string;
  selected?: boolean;
}

export const projects: ProjectEntry[] = [
  {
    id: "younger-first-aigc-architecture-dataset",
    title: "Younger: The First Dataset for Artificial Intelligence-Generated Neural Network Architecture",
    summary: "A benchmark dataset project focused on AI-generated neural network architectures.",
    status: "completed",
    updatedOn: "2026-03-08",
    selected: true,
  },
  {
    id: "youngs-sequence-modeling-system",
    title: "YoungS",
    summary: "YoungS is a young but low-coupling, flexible, and scalable sequence modeling system.",
    status: "active",
    updatedOn: "2026-03-08",
    selected: true,
  },
  {
    id: "probing-memes",
    title: "Probing Memes",
    summary: "Research project on probing and evaluating meme understanding in large language models.",
    status: "active",
    updatedOn: "2026-03-08",
    selected: true,
  },
  {
    id: "aidai",
    title: "AIDAI",
    summary: "Research project under the AIDAI initiative.",
    status: "active",
    updatedOn: "2026-03-08",
    selected: true,
  },
];
