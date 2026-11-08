import { blogPostingJsonLd, JsonLd, siteUrl } from "~/lib/seo";
import { getPost } from "~/server/content";

/** structured data for the canonical copy of a post */
export default async function PostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const [post, url] = await Promise.all([getPost((await params).slug), siteUrl()]);
  return (
    <>
      {post && <JsonLd data={blogPostingJsonLd(url, post)} />}
      {children}
    </>
  );
}
