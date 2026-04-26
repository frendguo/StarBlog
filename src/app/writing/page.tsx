import type { Metadata } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { fmtMonthDay } from "@/lib/format";
import { WritingFilter } from "./_components/WritingFilter";

export const metadata: Metadata = {
  title: "Writing",
  description: "所有文章按时间倒序，可按主题筛选。",
};

export const revalidate = 60;

interface SearchParams {
  searchParams?: Promise<{ tag?: string }>;
}

export default async function WritingIndex({ searchParams }: SearchParams) {
  const params = (await searchParams) ?? {};
  const activeTag = params.tag ?? "all";
  const allPosts = await getAllPosts({ status: "published" });
  const tags = await getAllTags();
  const filtered =
    activeTag === "all"
      ? allPosts
      : allPosts.filter((p) => p.tagId === activeTag);

  // Group by year
  const byYear = filtered.reduce<Record<number, typeof filtered>>((acc, p) => {
    const y = (p.publishedAt ?? p.createdAt).getFullYear();
    (acc[y] = acc[y] ?? []).push(p);
    return acc;
  }, {});
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  const totalWords = allPosts.reduce((s, p) => s + p.words, 0);

  return (
    <div className="page">
      <div className="page-eyebrow">
        {allPosts.length} pieces · {totalWords.toLocaleString()} words
      </div>
      <h1 className="page-title">Writing</h1>
      <p className="page-lede">
        所有文章按时间倒序。也可以按主题筛选 — 这里的内容质量比频率重要。
      </p>

      <WritingFilter
        tags={tags}
        activeTag={activeTag}
        totalCount={allPosts.length}
      />

      {years.map((year) => (
        <div key={year} style={{ marginBottom: 56 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: 38,
                fontWeight: 500,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              {year}
            </h3>
            <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--ink-4)",
              }}
            >
              {byYear[year].length}{" "}
              {byYear[year].length === 1 ? "piece" : "pieces"}
            </span>
          </div>
          <div>
            {byYear[year].map((p) => (
              <a
                key={p.slug}
                href={`/writing/${p.slug}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "76px 1fr 110px 60px",
                  gap: 20,
                  padding: "14px 0",
                  borderBottom: "1px dashed var(--rule)",
                  cursor: "pointer",
                  alignItems: "center",
                  transition: "background .12s",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: "var(--ink-4)",
                  }}
                >
                  {p.publishedAt ? fmtMonthDay(p.publishedAt) : ""}
                </div>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 17,
                    color: "var(--ink)",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {p.pinned && (
                    <span style={{ color: "var(--accent)", marginRight: 6 }}>
                      ★
                    </span>
                  )}
                  {p.title}
                </div>
                <div>
                  <span className={`tag ${p.tagId}`}>{p.tagLabel}</span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: "var(--ink-4)",
                    textAlign: "right",
                  }}
                >
                  {p.readTime} min
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div
          style={{
            padding: "40px 0",
            fontFamily: "var(--serif)",
            color: "var(--ink-4)",
            textAlign: "center",
            fontSize: 16,
          }}
        >
          这个分类下还没有文章。
        </div>
      )}
    </div>
  );
}
