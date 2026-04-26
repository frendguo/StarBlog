import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/writing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/projects`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/now`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.5 },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllPosts({ status: "published" });
    postRoutes = posts.map((p) => ({
      url: `${base}/writing/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    // D1 not yet migrated during prerender — render the static skeleton.
  }

  return [...staticRoutes, ...postRoutes];
}
