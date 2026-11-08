import { type MetadataRoute } from "next";

import { siteUrl } from "~/lib/seo";
import { getPosts, getProjects } from "~/server/content";

/**
 * Only canonical addresses: posts live at /blog/<slug> and projects at
 * /projeler/<slug>, whatever mood they're read in.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [url, posts, projects] = await Promise.all([siteUrl(), getPosts(), getProjects()]);
  const latest = [...posts.map((p) => p.updatedAt), ...projects.map((p) => p.updatedAt)].reduce(
    (a, b) => (b > a ? b : a),
    new Date(0),
  );

  const pages: MetadataRoute.Sitemap = [
    { url: `${url}/`, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${url}/blog`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    { url: `${url}/projeler`, lastModified: latest, changeFrequency: "monthly", priority: 0.9 },
    ...["ciddi", "mutlu", "sakin", "merakli", "nostaljik"].map((m) => ({
      url: `${url}/${m}`,
      lastModified: latest,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...["mutlu", "ciddi", "sakin"].map((m) => ({
      url: `${url}/${m}/oyunlar`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];

  return [
    ...pages,
    ...posts.map((p) => ({
      url: `${url}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: p.coverImage ? [new URL(p.coverImage, url).toString()] : undefined,
    })),
    ...projects.map((p) => ({
      url: `${url}/projeler/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: p.coverImage ? [new URL(p.coverImage, url).toString()] : undefined,
    })),
  ];
}
