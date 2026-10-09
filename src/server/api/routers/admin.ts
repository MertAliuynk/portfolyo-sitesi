import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

const slug = z
  .string()
  .trim()
  .min(1, "Kısa ad boş olamaz")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Sadece küçük harf, rakam ve tire");

const imageUrl = z.string().trim().max(500).nullable();

const postInput = z.object({
  title: z.string().trim().min(1, "Başlık boş olamaz").max(200),
  slug,
  excerpt: z.string().trim().max(500),
  tag: z.string().trim().min(1, "Konu boş olamaz").max(40),
  readingTime: z.number().int().min(1).max(240),
  contentJson: z.string().max(4_000_000),
  coverImage: imageUrl,
  published: z.boolean(),
  publishedAt: z.date(),
});

const projectInput = z.object({
  title: z.string().trim().min(1, "Başlık boş olamaz").max(200),
  slug,
  summary: z.string().trim().min(1, "Özet boş olamaz").max(400),
  description: z.string().trim().max(2000),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  gradient: z.enum(["magenta", "sunset", "ocean", "forest", "cosmic"]),
  liveUrl: z.string().trim().url().max(500).nullable(),
  repoUrl: z.string().trim().url().max(500).nullable(),
  year: z.number().int().min(1990).max(2100),
  featured: z.boolean(),
  order: z.number().int().min(0).max(999),
  role: z.string().trim().max(120).nullable(),
  duration: z.string().trim().max(120).nullable(),
  status: z.string().trim().max(60).nullable(),
  coverImage: imageUrl,
  contentJson: z.string().max(4_000_000).nullable(),
});

function slugTaken(): never {
  throw new TRPCError({
    code: "CONFLICT",
    message: "Bu kısa ad başka bir kayıtta kullanılıyor.",
  });
}

export const adminRouter = createTRPCRouter({
  stats: adminProcedure.query(async ({ ctx }) => {
    const [posts, drafts, projects, featured, recentPosts, recentProjects] =
      await Promise.all([
        ctx.db.post.count(),
        ctx.db.post.count({ where: { published: false } }),
        ctx.db.project.count(),
        ctx.db.project.count({ where: { featured: true } }),
        ctx.db.post.findMany({
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: { id: true, title: true, published: true, updatedAt: true, tag: true },
        }),
        ctx.db.project.findMany({
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: { id: true, title: true, featured: true, updatedAt: true, year: true },
        }),
      ]);
    return { posts, drafts, projects, featured, recentPosts, recentProjects };
  }),

  /* ------------------------------------------------------------ posts */

  posts: adminProcedure.query(({ ctx }) =>
    ctx.db.post.findMany({
      orderBy: [{ publishedAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        tag: true,
        readingTime: true,
        published: true,
        publishedAt: true,
        updatedAt: true,
        format: true,
        coverImage: true,
      },
    }),
  ),

  post: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input.id } });
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });
      return post;
    }),

  tags: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.post.findMany({ select: { tag: true }, distinct: ["tag"] });
    return rows.map((r) => r.tag);
  }),

  createPost: adminProcedure.input(postInput).mutation(async ({ ctx, input }) => {
    if (await ctx.db.post.findUnique({ where: { slug: input.slug } })) slugTaken();
    return ctx.db.post.create({
      data: { ...input, format: "rich", content: "" },
      select: { id: true },
    });
  }),

  updatePost: adminProcedure
    .input(postInput.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const clash = await ctx.db.post.findUnique({ where: { slug: data.slug } });
      if (clash && clash.id !== id) slugTaken();
      return ctx.db.post.update({
        where: { id },
        data: { ...data, format: "rich" },
        select: { id: true, updatedAt: true },
      });
    }),

  setPostPublished: adminProcedure
    .input(z.object({ id: z.string(), published: z.boolean() }))
    .mutation(({ ctx, input }) =>
      ctx.db.post.update({
        where: { id: input.id },
        data: { published: input.published },
        select: { id: true },
      }),
    ),

  deletePost: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => ctx.db.post.delete({ where: { id: input.id }, select: { id: true } })),

  /* --------------------------------------------------------- projects */

  projects: adminProcedure.query(({ ctx }) =>
    ctx.db.project.findMany({
      orderBy: [{ order: "asc" }, { year: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        tags: true,
        gradient: true,
        year: true,
        featured: true,
        order: true,
        status: true,
        coverImage: true,
        updatedAt: true,
      },
    }),
  ),

  project: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({ where: { id: input.id } });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return project;
    }),

  createProject: adminProcedure.input(projectInput).mutation(async ({ ctx, input }) => {
    if (await ctx.db.project.findUnique({ where: { slug: input.slug } })) slugTaken();
    return ctx.db.project.create({
      data: { ...input, tags: input.tags.join(",") },
      select: { id: true },
    });
  }),

  updateProject: adminProcedure
    .input(projectInput.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const clash = await ctx.db.project.findUnique({ where: { slug: data.slug } });
      if (clash && clash.id !== id) slugTaken();
      return ctx.db.project.update({
        where: { id },
        data: { ...data, tags: data.tags.join(",") },
        select: { id: true, updatedAt: true },
      });
    }),

  setProjectFeatured: adminProcedure
    .input(z.object({ id: z.string(), featured: z.boolean() }))
    .mutation(({ ctx, input }) =>
      ctx.db.project.update({
        where: { id: input.id },
        data: { featured: input.featured },
        select: { id: true },
      }),
    ),

  deleteProject: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.project.delete({ where: { id: input.id }, select: { id: true } }),
    ),
});
