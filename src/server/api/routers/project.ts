import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const projectRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      orderBy: [{ order: "asc" }, { year: "desc" }],
    });
  }),

  featured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: { featured: true },
      orderBy: [{ order: "asc" }, { year: "desc" }],
    });
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.project.findUnique({ where: { slug: input.slug } });
    }),
});
