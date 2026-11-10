import { finalDescription } from "~/lib/seo-check";
import { siteUrl } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { getPosts } from "~/server/content";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** RSS 2.0 feed of the published posts, newest first */
export async function GET() {
  const [url, posts] = await Promise.all([siteUrl(), getPosts()]);
  const items = posts
    .slice(0, 50)
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}/blog/${p.slug}</link>
      <guid isPermaLink="true">${url}/blog/${p.slug}</guid>
      <description>${esc(finalDescription(p))}</description>
      <category>${esc(p.tag)}</category>
      <pubDate>${p.publishedAt.toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)} — Blog</title>
    <link>${url}/blog</link>
    <description>${esc(`${SITE.name}'ın yazıları ve dersleri: yazılım, web ve öğrencilik.`)}</description>
    <language>tr-TR</language>
    <atom:link href="${url}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
