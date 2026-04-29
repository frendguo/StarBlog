import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fmtDate } from "@/lib/format";
import { extractToc, renderMarkdown } from "@/lib/markdown";
import { getAllPosts, getApprovedComments, getPostBySlug } from "@/lib/posts";
import { ArticleProgress } from "../_components/ArticleProgress";
import { ArticleBottomBar } from "../_components/ArticleBottomBar";
import { ArticleMobileTools } from "../_components/ArticleMobileTools";
import { CommentSection } from "../_components/CommentSection";
import { TocSidebar } from "../_components/TocSidebar";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "未找到文章" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export const revalidate = 60;

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") notFound();

  const allPosts = await getAllPosts({ status: "published" });
  const idx = allPosts.findIndex((p) => p.slug === post.slug);
  const prev = idx > 0 ? allPosts[idx - 1] : null;
  const next = idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null;
  const related = allPosts
    .filter((p) => p.slug !== post.slug && p.tagId === post.tagId)
    .slice(0, 3);

  const html = await renderMarkdown(post.body);
  const toc = extractToc(post.body);
  const comments = await getApprovedComments(post.id);

  return (
    <div>
      <ArticleProgress />
      <ArticleBottomBar hasToc={toc.length > 0} />

      <div className="article-layout">
        <article id="article-body" className="article-main">
          <ArticleMobileTools hasToc={toc.length > 0} />
          <div className="article-tag-row">
            <span className={`tag ${post.tagId}`}>{post.tagLabel}</span>
            {post.series && (
              <span className="article-series">
                SERIES · {post.series}
              </span>
            )}
            <span className="article-date">
              {post.publishedAt ? fmtDate(post.publishedAt) : ""}
            </span>
          </div>

          <h1 className="article-title">{post.title}</h1>

          <p className="article-excerpt">{post.excerpt}</p>

          <div className="article-meta">
            <span>⌖ {post.readTime} min read</span>
            <span>≡ {post.words.toLocaleString()} words</span>
            <span>↺ updated {fmtDate(post.updatedAt)}</span>
          </div>

          {toc.length > 0 && (
            <div id="article-toc" className="article-toc-inline">
              <div className="article-toc-label">目录</div>
              <div className="article-toc-inline-list">
                {toc.map((item) => (
                  <Link key={item.id} href={`#${item.id}`} className="article-toc-inline-link">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="article-actions">
            <span className="article-actions-label">── END ──</span>
            <div className="article-actions-spacer" />
            <Link href="#top" className="btn">
              ↑ Back to top
            </Link>
            <Link href="/#newsletter" className="btn btn-primary">
              Subscribe
            </Link>
          </div>

          <div className="article-pagination">
            {prev ? (
              <Link
                href={`/writing/${prev.slug}`}
                className="card article-pagination-card"
              >
                <div className="article-pagination-label">← NEWER</div>
                <div className="article-pagination-title">{prev.title}</div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/writing/${next.slug}`}
                className="card article-pagination-card article-pagination-card-next"
              >
                <div className="article-pagination-label">OLDER →</div>
                <div className="article-pagination-title">{next.title}</div>
              </Link>
            ) : (
              <div />
            )}
          </div>

          <CommentSection postId={post.id} initialComments={comments} />

          {related.length > 0 && (
            <div className="article-related">
              <div className="section-label">
                <span>≈</span> Related on {post.tagLabel}
              </div>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/writing/${r.slug}`}
                  className="article-related-row"
                >
                  <span className="article-related-date">
                    {r.publishedAt
                      ? new Date(r.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "2-digit",
                        })
                      : ""}
                  </span>
                  <span className="article-related-title">{r.title}</span>
                  <span className="article-related-meta">{r.readTime}m →</span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <aside className="article-sidebar">
          <TocSidebar items={toc} />
        </aside>
      </div>
    </div>
  );
}
