import Link from "next/link";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { getDbAsync } from "@/db";
import { posts, tags } from "@/db/schema";
import { fmtDate } from "@/lib/format";
import { createDraftAndEdit } from "@/app/actions/posts";
import { PostRowActions } from "../_components/PostRowActions";

export const dynamic = "force-dynamic";

interface Props {
  searchParams?: Promise<{ status?: string; q?: string }>;
}

const STATUSES = ["all", "published", "draft", "scheduled"] as const;

export default async function AdminPostsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const status = (params.status ?? "all") as (typeof STATUSES)[number];
  const q = params.q?.trim() ?? "";

  const db = await getDbAsync();
  const where = and(
    status !== "all" ? eq(posts.status, status) : undefined,
    q
      ? or(like(posts.title, `%${q}%`), like(posts.slug, `%${q}%`))
      : undefined
  );
  const rows = await db
    .select({ posts, tags })
    .from(posts)
    .innerJoin(tags, eq(posts.tagId, tags.id))
    .where(where)
    .orderBy(desc(posts.updatedAt));

  const counts = await db
    .select({ status: posts.status, c: sql<number>`COUNT(*)` })
    .from(posts)
    .groupBy(posts.status);
  const countMap: Record<string, number> = { all: 0 };
  let allTotal = 0;
  for (const r of counts) {
    countMap[r.status] = Number(r.c);
    allTotal += Number(r.c);
  }
  countMap.all = allTotal;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--ink-4)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Posts
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            文章 · {allTotal} 篇
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <form action={createDraftAndEdit}>
            <button type="submit" className="btn btn-primary">
              ＋ 新建文章
            </button>
          </form>
        </div>
      </div>

      <div className="admin-content">
        <form
          method="GET"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 22,
            flexWrap: "wrap",
          }}
        >
          <input
            name="q"
            className="input mono"
            defaultValue={q}
            placeholder="搜索 标题 / slug…"
            style={{ maxWidth: 320 }}
          />
          <input type="hidden" name="status" value={status} />
          <button type="submit" className="btn">
            搜索
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 4 }}>
            {STATUSES.map((s) => (
              <Link
                key={s}
                href={`/admin/posts?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className="tag"
                style={{
                  padding: "5px 11px",
                  fontSize: 12,
                  cursor: "pointer",
                  background: status === s ? "var(--ink)" : "var(--bg-soft)",
                  color: status === s ? "var(--bg)" : "var(--ink-3)",
                  borderColor: status === s ? "var(--ink)" : "var(--rule)",
                  textDecoration: "none",
                }}
              >
                {s}{" "}
                <span style={{ marginLeft: 4, opacity: 0.6 }}>
                  · {countMap[s] ?? 0}
                </span>
              </Link>
            ))}
          </div>
        </form>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Tag</th>
              <th>Status</th>
              <th>Updated</th>
              <th style={{ width: 1 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.posts.id}>
                <td>
                  <Link
                    href={`/admin/posts/${r.posts.id}`}
                    style={{
                      color: "var(--ink)",
                      textDecoration: "none",
                      fontFamily: "var(--serif)",
                      fontSize: 15,
                    }}
                  >
                    {r.posts.pinned && (
                      <span
                        style={{ color: "var(--accent)", marginRight: 6 }}
                      >
                        ★
                      </span>
                    )}
                    {r.posts.title || <em style={{ color: "var(--ink-4)" }}>(无标题)</em>}
                  </Link>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      color: "var(--ink-4)",
                      marginTop: 4,
                    }}
                  >
                    /writing/{r.posts.slug}
                  </div>
                </td>
                <td>
                  <span className={`tag ${r.tags.id}`}>{r.tags.label}</span>
                </td>
                <td>
                  <span className={`status-pill ${r.posts.status}`}>
                    {r.posts.status}
                  </span>
                </td>
                <td
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: "var(--ink-4)",
                  }}
                >
                  {fmtDate(r.posts.updatedAt)}
                </td>
                <td>
                  <PostRowActions
                    id={r.posts.id}
                    slug={r.posts.slug}
                    status={r.posts.status}
                    pinned={r.posts.pinned}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    color: "var(--ink-4)",
                    padding: 48,
                  }}
                >
                  没有匹配的文章。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
