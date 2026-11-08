import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "~/server/db";

/**
 * Public content, cached across requests. Every admin mutation calls
 * `revalidateTag(CONTENT_TAG)`, so edits show up right away; the hourly
 * revalidate is just a safety net.
 */
export const CONTENT_TAG = "content";
const opts = { tags: [CONTENT_TAG], revalidate: 3600 };

// the cache stores JSON, so dates come back as strings: revive them
type Dated = { createdAt: Date; updatedAt: Date };
function revive<T extends Dated>(row: T): T {
  const out = { ...row, createdAt: new Date(row.createdAt), updatedAt: new Date(row.updatedAt) };
  if ("publishedAt" in row) {
    (out as T & { publishedAt: Date }).publishedAt = new Date(
      (row as T & { publishedAt: Date }).publishedAt,
    );
  }
  return out;
}

const postsCached = unstable_cache(
  () =>
    db.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    }),
  ["posts:all"],
  opts,
);

const projectsCached = unstable_cache(
  () => db.project.findMany({ orderBy: [{ order: "asc" }, { year: "desc" }] }),
  ["projects:all"],
  opts,
);

export async function getPosts() {
  return (await postsCached()).map(revive);
}

export async function getPost(slug: string) {
  // drafts never reach the cache: only published posts are listed
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}

export async function getProjects() {
  return (await projectsCached()).map(revive);
}

export async function getFeaturedProjects() {
  return (await getProjects()).filter((p) => p.featured);
}

export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}
