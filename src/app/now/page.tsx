import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionTabs } from "@/components/SectionTabs";
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
      <SectionTabs />
      <div className="page-eyebrow">
        Updated {fmtDate(post.updatedAt)} · /now
      </div>
      <div className="now-summary-card">
        <div className="now-summary-dot" />
        <div>
          <div className="now-summary-title">最近在做</div>
          <p className="now-summary-copy">短日志优先，不堆时间线。把近期在写、在读、在构建的东西放在这里。</p>
        </div>
      </div>
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
