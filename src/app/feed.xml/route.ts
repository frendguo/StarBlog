import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 600;

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];
  try {
    posts = await getAllPosts({ status: "published" });
  } catch {
    posts = [];
  }

  const items = posts
    .map((p) => {
      const url = `${siteConfig.url}/writing/${p.slug}`;
      const pubDate = (p.publishedAt ?? p.createdAt).toUTCString();
      return `    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escape(p.tagLabel)}</category>
      <description>${escape(p.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const lastBuild = (posts[0]?.updatedAt ?? new Date()).toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(siteConfig.author.name)}</title>
    <link>${siteConfig.url}</link>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${escape(siteConfig.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=600, s-maxage=3600",
    },
  });
}
