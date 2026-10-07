import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  all: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    });
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.post.findUnique({ where: { slug: input.slug } });
    }),
});
