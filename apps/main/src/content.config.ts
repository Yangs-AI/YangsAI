import { defineCollection, z } from "astro:content";

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
