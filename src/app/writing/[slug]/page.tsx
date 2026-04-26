import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fmtDate } from "@/lib/format";
import { extractToc, renderMarkdown } from "@/lib/markdown";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { ArticleProgress } from "../_components/ArticleProgress";
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

  return (
    <div>
      <ArticleProgress />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px",
          gap: 56,
          padding: "56px 56px 120px",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <article style={{ minWidth: 0 }}>
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span className={`tag ${post.tagId}`}>{post.tagLabel}</span>
            {post.series && (
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--ink-3)",
                  letterSpacing: "0.05em",
                }}
              >
                SERIES · {post.series}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--ink-4)",
              }}
            >
              {post.publishedAt ? fmtDate(post.publishedAt) : ""}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: 46,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "var(--ink)",
              marginBottom: 20,
              textWrap: "pretty",
            }}
          >
            {post.title}
          </h1>

          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: 19,
              fontStyle: "italic",
              lineHeight: 1.5,
              color: "var(--ink-3)",
              marginBottom: 36,
              paddingLeft: 18,
              borderLeft: "2px solid var(--accent)",
            }}
          >
            {post.excerpt}
          </p>

          <div
            style={{
              display: "flex",
              gap: 24,
              padding: "14px 0",
              borderTop: "1px solid var(--rule)",
              borderBottom: "1px solid var(--rule)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--ink-3)",
              marginBottom: 56,
              flexWrap: "wrap",
            }}
          >
            <span>⌖ {post.readTime} min read</span>
            <span>≡ {post.words.toLocaleString()} words</span>
            <span>↺ updated {fmtDate(post.updatedAt)}</span>
          </div>

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div
            style={{
              marginTop: 64,
              paddingTop: 24,
              borderTop: "1px solid var(--rule)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--ink-4)",
                letterSpacing: "0.06em",
              }}
            >
              ── END ──
            </span>
            <div style={{ flex: 1 }} />
            <Link href="#top" className="btn">
              ↑ Back to top
            </Link>
            <Link href="/#newsletter" className="btn btn-primary">
              Subscribe
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginTop: 32,
            }}
          >
            {prev ? (
              <Link
                href={`/writing/${prev.slug}`}
                className="card"
                style={{ cursor: "pointer", textDecoration: "none" }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    color: "var(--ink-4)",
                    marginBottom: 6,
                    letterSpacing: "0.1em",
                  }}
                >
                  ← NEWER
                </div>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 15,
                    color: "var(--ink)",
                    lineHeight: 1.3,
                  }}
                >
                  {prev.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/writing/${next.slug}`}
                className="card"
                style={{
                  cursor: "pointer",
                  textAlign: "right",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    color: "var(--ink-4)",
                    marginBottom: 6,
                    letterSpacing: "0.1em",
                  }}
                >
                  OLDER →
                </div>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 15,
                    color: "var(--ink)",
                    lineHeight: 1.3,
                  }}
                >
                  {next.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {related.length > 0 && (
            <div style={{ marginTop: 56 }}>
              <div className="section-label">
                <span>≈</span> Related on {post.tagLabel}
              </div>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/writing/${r.slug}`}
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "12px 0",
                    borderBottom: "1px dashed var(--rule)",
                    cursor: "pointer",
                    fontFamily: "var(--serif)",
                    fontSize: 16,
                    color: "var(--ink-2)",
                    textDecoration: "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      color: "var(--ink-4)",
                      flexShrink: 0,
                      width: 60,
                    }}
                  >
                    {r.publishedAt
                      ? new Date(r.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "2-digit",
                        })
                      : ""}
                  </span>
                  <span style={{ flex: 1 }}>{r.title}</span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      color: "var(--ink-4)",
                    }}
                  >
                    {r.readTime}m →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <aside style={{ position: "relative" }}>
          <TocSidebar items={toc} />
        </aside>
      </div>
    </div>
  );
}
