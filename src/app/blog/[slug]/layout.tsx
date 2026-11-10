import { JsonLd, postJsonLd, siteUrl } from "~/lib/seo";
import { getPost } from "~/server/content";

/** structured data for the canonical copy of a post */
export default async function PostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const [post, url] = await Promise.all([
    getPost((await params).slug),
    siteUrl(),
  ]);
  return (
    <>
      {post && postJsonLd(url, post).map((d, i) => <JsonLd key={i} data={d} />)}
      {children}
    </>
  );
}
