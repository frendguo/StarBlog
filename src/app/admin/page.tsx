import Link from "next/link";
import { count, sql } from "drizzle-orm";
import { getDbAsync } from "@/db";
import { posts, comments, subscribers } from "@/db/schema";
import { fmtDate, relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const db = await getDbAsync();
  const [postCounts] = await db
    .select({
      total: count(),
      published: sql<number>`SUM(CASE WHEN ${posts.status} = 'published' THEN 1 ELSE 0 END)`,
      draft: sql<number>`SUM(CASE WHEN ${posts.status} = 'draft' THEN 1 ELSE 0 END)`,
      scheduled: sql<number>`SUM(CASE WHEN ${posts.status} = 'scheduled' THEN 1 ELSE 0 END)`,
      views: sql<number>`COALESCE(SUM(${posts.views}), 0)`,
      words: sql<number>`COALESCE(SUM(${posts.words}), 0)`,
    })
    .from(posts);

  const [commentCounts] = await db
    .select({
      pending: sql<number>`SUM(CASE WHEN ${comments.status} = 'pending' THEN 1 ELSE 0 END)`,
      approved: sql<number>`SUM(CASE WHEN ${comments.status} = 'approved' THEN 1 ELSE 0 END)`,
    })
    .from(comments);

  const [subscriberCount] = await db
    .select({ total: count() })
    .from(subscribers);

  const recentPosts = await db
    .select()
    .from(posts)
    .orderBy(sql`${posts.updatedAt} DESC`)
    .limit(6);

  return {
    posts: {
      total: Number(postCounts?.total ?? 0),
      published: Number(postCounts?.published ?? 0),
      draft: Number(postCounts?.draft ?? 0),
      scheduled: Number(postCounts?.scheduled ?? 0),
      views: Number(postCounts?.views ?? 0),
      words: Number(postCounts?.words ?? 0),
    },
    comments: {
      pending: Number(commentCounts?.pending ?? 0),
      approved: Number(commentCounts?.approved ?? 0),
    },
    subscribers: Number(subscriberCount?.total ?? 0),
    recentPosts,
  };
}

const STATUS_PILL: Record<string, string> = {
  published: "published",
  draft: "draft",
  scheduled: "scheduled",
};

export default async function AdminDashboard() {
  const data = await getDashboardData();

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
            Dashboard
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            总览
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/posts/new" className="btn btn-primary">
            ＋ 新建文章
          </Link>
        </div>
      </div>

      <div className="admin-content">
        <h1 className="admin-title">早，准备好了吗？</h1>
        <p className="admin-sub">
          站点状态正常，下面是最近的指标和文章活动。
        </p>

        <div className="kpi-grid">
          <Kpi label="Articles" num={data.posts.published} sub={`${data.posts.draft} 草稿 · ${data.posts.scheduled} 计划`} delta="up" />
          <Kpi label="Total words" num={(data.posts.words / 1000).toFixed(1) + "K"} sub="所有已发布文章合计" />
          <Kpi label="Subscribers" num={data.subscribers} sub="已订阅 newsletter" delta="up" />
          <Kpi
            label="Comments"
            num={data.comments.pending}
            sub={`待审核 · 已通过 ${data.comments.approved}`}
            delta={data.comments.pending > 0 ? "up" : undefined}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div>
            <div className="section-label">
              <span>§</span> 最近编辑
            </div>
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--rule)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              {data.recentPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/posts/${p.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 16,
                    padding: "14px 18px",
                    borderBottom: "1px solid var(--rule-soft)",
                    color: "inherit",
                    textDecoration: "none",
                    fontSize: 13,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 15,
                      color: "var(--ink)",
                    }}
                  >
                    {p.pinned && (
                      <span
                        style={{ color: "var(--accent)", marginRight: 6 }}
                      >
                        ★
                      </span>
                    )}
                    {p.title || <em style={{ color: "var(--ink-4)" }}>(无标题)</em>}
                  </div>
                  <span className={`status-pill ${STATUS_PILL[p.status] ?? "draft"}`}>
                    {p.status}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      color: "var(--ink-4)",
                    }}
                  >
                    {relativeTime(p.updatedAt)}
                  </span>
                </Link>
              ))}
              {data.recentPosts.length === 0 && (
                <div
                  style={{
                    padding: 32,
                    textAlign: "center",
                    color: "var(--ink-4)",
                  }}
                >
                  还没有文章。
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="section-label">
              <span>◌</span> 操作
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <Link
                  href="/admin/posts/new"
                  className="btn btn-accent"
                  style={{ justifyContent: "flex-start" }}
                >
                  ＋ 写一篇新的
                </Link>
                <Link
                  href="/admin/posts?status=draft"
                  className="btn"
                  style={{ justifyContent: "flex-start" }}
                >
                  ✎ 继续草稿（{data.posts.draft}）
                </Link>
                <Link
                  href="/admin/comments"
                  className="btn"
                  style={{ justifyContent: "flex-start" }}
                >
                  ❝ 审核评论（{data.comments.pending}）
                </Link>
                <Link
                  href="/admin/tags"
                  className="btn"
                  style={{ justifyContent: "flex-start" }}
                >
                  # 管理标签
                </Link>
              </div>
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px dashed var(--rule)",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: "var(--ink-4)",
                  lineHeight: 1.65,
                }}
              >
                数据库：Cloudflare D1
                <br />
                运行环境：Workers + OpenNext
                <br />
                快照时间：{fmtDate(new Date())}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Kpi({
  label,
  num,
  sub,
  delta,
}: {
  label: string;
  num: number | string;
  sub?: string;
  delta?: "up" | "down";
}) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-num">{num}</div>
      {sub && (
        <div
          className={`kpi-delta${delta ? ` ${delta}` : ""}`}
          style={{ color: delta ? undefined : "var(--ink-4)" }}
        >
          {delta === "up" && "▲ "}
          {delta === "down" && "▼ "}
          {sub}
        </div>
      )}
    </div>
  );
}
