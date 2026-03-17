import { defineCollection, z } from "astro:content";

const extraPublicationAuthor = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  isFirstAuthor: z.boolean().optional(),
  isCorrespondingAuthor: z.boolean().optional(),
});

const extraPublication = z.object({
  title: z.string(),
  venue: z.string().optional(),
  publishedOn: z.string().optional(),
  authors: z.array(extraPublicationAuthor).min(1),
  paperUrl: z.string().url().optional(),
  codeUrl: z.string().url().optional(),
  bibtex: z.string().optional(),
});

const directions = defineCollection({
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().optional(),
    updatedOn: z.string().optional(),
  }),
});

const teamMembers = defineCollection({
  schema: z.discriminatedUnion("memberType", [
    z.object({
      memberType: z.literal("employee"),
      name: z.string(),
      role: z.string(),
      affiliation: z.string(),
      summary: z.string(),
      extraPublications: z.array(extraPublication).optional(),
      publicationView: z.enum(["all", "selected"]).optional(),
      publicationLimit: z.number().int().positive().optional(),
      order: z.number().optional(),
      avatar: z.string().optional(),
      email: z.string().optional(),
      website: z.string().url().optional(),
      updatedOn: z.string().optional(),
    }),
    z.object({
      memberType: z.literal("student"),
      name: z.string(),
      role: z.string(),
      affiliation: z.string(),
      summary: z.string(),
      extraPublications: z.array(extraPublication).optional(),
      publicationView: z.enum(["all", "selected"]).optional(),
      publicationLimit: z.number().int().positive().optional(),
      studentLevel: z.enum(["undergraduate", "master", "phd"]),
      graduated: z.boolean(),
      graduationYear: z.number().optional(),
      order: z.number().optional(),
      avatar: z.string().optional(),
      email: z.string().optional(),
      website: z.string().url().optional(),
      updatedOn: z.string().optional(),
    }),
  ]),
});

export const collections = {
  directions,
  "team-members": teamMembers,
};
