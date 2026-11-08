import { type MetadataRoute } from "next";

import { SEO_DESCRIPTION } from "~/lib/seo";
import { SITE } from "~/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Yazılım Geliştirici`,
    short_name: SITE.name,
    description: SEO_DESCRIPTION,
    lang: "tr",
    start_url: "/",
    display: "standalone",
    background_color: "#151412",
    theme_color: "#151412",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
