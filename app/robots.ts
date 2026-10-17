import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/store";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/checkout"] },
    sitemap: `${siteUrl().origin}/sitemap.xml`,
  };
}
