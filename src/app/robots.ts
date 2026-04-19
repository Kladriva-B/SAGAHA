import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = absoluteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/distributeur", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
