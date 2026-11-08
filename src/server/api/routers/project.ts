import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getFeaturedProjects, getProject, getProjects } from "~/server/content";

export const projectRouter = createTRPCRouter({
  all: publicProcedure.query(() => getProjects()),

  featured: publicProcedure.query(() => getFeaturedProjects()),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => getProject(input.slug)),
});
