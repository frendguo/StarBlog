import "@/styles/global.css";
import type { Metadata, Viewport } from "next";
import { TopNav } from "@/components/TopNav";
import { SearchPalette } from "@/components/SearchPalette";
import { Hotkeys } from "@/components/Hotkeys";
import { ThemeBootstrap } from "@/components/ThemeBootstrap";
import { siteConfig } from "@/lib/site-config";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.author.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.author.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: "RSS" }] },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteConfig.url,
    title: `${siteConfig.author.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.author.name,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF9F4" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0E14" },
  ],
};

// All routes need a live D1 binding; skip the static prerender pass.
// On Cloudflare Workers, ISR / cache is handled by OpenNext at the edge.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Best-effort: build-time prerender runs before D1 migrations are applied,
  // so we degrade to an empty index rather than failing the build.
  let indexedPosts: Array<{
    slug: string;
    title: string;
    excerpt: string;
    tagId: string;
    tagLabel: string;
    readTime: number;
  }> = [];
  try {
    const posts = await getAllPosts({ status: "published" });
    indexedPosts = posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      tagId: p.tagId,
      tagLabel: p.tagLabel,
      readTime: p.readTime,
    }));
  } catch {
    indexedPosts = [];
  }

  return (
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <head>
        <ThemeBootstrap />
      </head>
      <body>
        <TopNav />
        <div className="page-shell">{children}</div>
        <SearchPalette posts={indexedPosts} />
        <Hotkeys />
      </body>
    </html>
  );
}
