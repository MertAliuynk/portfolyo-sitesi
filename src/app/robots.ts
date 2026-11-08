import { type MetadataRoute } from "next";

import { siteUrl } from "~/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const url = await siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // the panel, the API, and the hidden corners stay out of search results
        disallow: ["/admin", "/api/", "/yolculuk", "/playground"],
      },
    ],
    sitemap: `${url}/sitemap.xml`,
  };
}
