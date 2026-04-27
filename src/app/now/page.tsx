import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fmtDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { getPostBySlug } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Now",
  description: "我现在正在做什么、想什么、读什么。",
};

export const revalidate = 60;

export default async function NowPage() {
  const post = await getPostBySlug("now");
  if (!post || post.status !== "published") notFound();
  const html = await renderMarkdown(post.body);

  return (
    <div className="page">
      <div className="page-eyebrow">
        Updated {fmtDate(post.updatedAt)} · /now
      </div>
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
