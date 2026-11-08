import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getPost, getPosts } from "~/server/content";

export const postRouter = createTRPCRouter({
  all: publicProcedure.query(() => getPosts()),

  // drafts stay private until published from the admin panel
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => getPost(input.slug)),
});
