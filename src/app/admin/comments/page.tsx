import { eq, sql } from "drizzle-orm";
import { getDbAsync } from "@/db";
import { comments, posts } from "@/db/schema";
import { fmtDate } from "@/lib/format";
import { CommentRowActions } from "../_components/CommentRowActions";

export const dynamic = "force-dynamic";

export default async function CommentsPage() {
  const db = await getDbAsync();
  const rows = await db
    .select({
      comment: comments,
      postTitle: posts.title,
      postSlug: posts.slug,
    })
    .from(comments)
    .innerJoin(posts, eq(posts.id, comments.postId))
    .orderBy(sql`${comments.createdAt} DESC`)
    .limit(200);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.6875rem",
              color: "var(--ink-4)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Comments
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.125rem",
              fontWeight: 500,
            }}
          >
            评论审核
          </div>
        </div>
      </div>
      <div className="admin-content">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Comment</th>
              <th>On</th>
              <th>Status</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.comment.id}>
                <td
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.75rem",
                    color: "var(--ink-2)",
                  }}
                >
                  {r.comment.author}
                </td>
                <td
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "0.875rem",
                    maxWidth: 360,
                  }}
                >
                  {r.comment.content}
                </td>
                <td
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.6875rem",
                    color: "var(--ink-4)",
                  }}
                >
                  /writing/{r.postSlug}
                </td>
                <td>
                  <span className={`status-pill ${r.comment.status}`}>
                    {r.comment.status}
                  </span>
                </td>
                <td
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.6875rem",
                    color: "var(--ink-4)",
                  }}
                >
                  {fmtDate(r.comment.createdAt)}
                </td>
                <td>
                  <CommentRowActions
                    id={r.comment.id}
                    status={r.comment.status}
                  />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    color: "var(--ink-4)",
                    padding: 48,
                  }}
                >
                  还没有评论。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
