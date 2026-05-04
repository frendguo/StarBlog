import { siteConfig } from "@/lib/site-config";

// Build absolute URLs against the canonical site origin (siteConfig.url).
// Stripping trailing slash on either side keeps the URLs predictable for
// search-engine canonicalization.
function abs(path: string): string {
  const base = siteConfig.url.replace(/\/+$/, "");
  const tail = path.startsWith("/") ? path : `/${path}`;
  return `${base}${tail}`;
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.author.name,
    url: abs("/"),
    description: siteConfig.description,
    inLanguage: "zh-CN",
    publisher: {
      "@type": "Person",
      name: siteConfig.author.realName,
      url: abs("/about"),
    },
  } as const;
}

export interface BlogPostingInput {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt?: Date | null;
  updatedAt: Date;
  tagLabel?: string;
  readTime?: number;
  words?: number;
}

export function blogPostingJsonLd(post: BlogPostingInput) {
  const url = abs(`/writing/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished:
      post.publishedAt?.toISOString() ?? post.updatedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    inLanguage: "zh-CN",
    image: [abs("/opengraph-image")],
    author: {
      "@type": "Person",
      name: siteConfig.author.realName,
      url: abs("/about"),
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.author.realName,
      url: abs("/about"),
    },
    ...(post.tagLabel ? { keywords: [post.tagLabel] } : {}),
    ...(post.words ? { wordCount: post.words } : {}),
    ...(post.readTime ? { timeRequired: `PT${post.readTime}M` } : {}),
  } as const;
}

// Helper: produce a stringified, escaped JSON-LD payload safe for inline
// <script> injection. </script> in the JSON would break the script tag,
// so we escape `<` defensively.
export function ldJsonString(payload: unknown): string {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
