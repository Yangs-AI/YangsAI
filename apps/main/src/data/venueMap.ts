export const venueCatalog = {
  Preprint: {
    fullName: "Preprint",
    aliases: ["Preprint"],
  },
  TBench: {
    fullName: "BenchCouncil Transactions on Benchmarks, Standards and Evaluations",
    aliases: ["TBench"],
  },
  ACL: {
    fullName: "Annual Meeting of the Association for Computational Linguistics",
    aliases: ["ACL"],
  },
  AAAI: {
    fullName: "AAAI Conference on Artificial Intelligence",
    aliases: ["AAAI"],
  },
  EMNLP: {
    fullName: "Conference on Empirical Methods in Natural Language Processing",
    aliases: ["EMNLP"],
  },
  XHYXZZ: {
    fullName: "Medical Journal of Peking Union Medical College Hospital",
    aliases: ["XHYXZZ", "协和医学杂志"],
  },
  JXMU: {
    fullName: "Journal of Xiamen University (Natural Science)",
    aliases: ["JXMU"],
  },
  Bench: {
    fullName: "BenchCouncil International Symposium On Evaluatology: Evaluation Science and Engineering",
    aliases: ["Bench"],
  },
  Other: {
    fullName: "Other / Unspecified Venue",
    aliases: ["Other", "Unknown", "Unspecified"],
  },
} as const;

export type VenueKey = keyof typeof venueCatalog;

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const venueKeyByToken = new Map<string, VenueKey>();
Object.entries(venueCatalog).forEach(([key, config]) => {
  const venueKey = key as VenueKey;
  venueKeyByToken.set(normalize(venueKey), venueKey);
  venueKeyByToken.set(normalize(config.fullName), venueKey);
  config.aliases.forEach((alias) => {
    venueKeyByToken.set(normalize(alias), venueKey);
  });
});

export const resolveVenueKey = (value: string | undefined | null): VenueKey | null => {
  if (!value) {
    return null;
  }
  return venueKeyByToken.get(normalize(value)) ?? null;
};

export const getVenueShortLabel = (venue: VenueKey) => venue;

export const getVenueFullName = (venue: VenueKey) => venueCatalog[venue].fullName;

export const getVenueFilterLabel = (venue: VenueKey) => getVenueShortLabel(venue);

export const getVenuePaperLabel = (venue: VenueKey) => {
  const shortLabel = getVenueShortLabel(venue);
  const fullName = getVenueFullName(venue);
  if (shortLabel === fullName) {
    return fullName;
  }
  return `${fullName} (${shortLabel})`;
};
