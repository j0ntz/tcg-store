import type { MetadataRoute } from "next";
import { cards, generatedAt, sealed, sets } from "@/lib/catalog";
import { siteUrl } from "@/lib/store";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl().origin;
  const lastModified = new Date(`${generatedAt}T00:00:00Z`);
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sealed`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/sets`, lastModified, changeFrequency: "weekly", priority: 0.6 },
  ];
  for (const set of sets) pages.push({ url: `${base}/shop?set=${set.slug}`, lastModified, changeFrequency: "weekly", priority: 0.6 });
  for (const card of cards) pages.push({ url: `${base}/cards/${card.slug}`, lastModified, changeFrequency: "weekly", priority: 0.5 });
  for (const product of sealed) pages.push({ url: `${base}/sealed/${product.slug}`, lastModified, changeFrequency: "weekly", priority: 0.7 });
  return pages;
}
