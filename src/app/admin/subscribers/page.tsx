import { sql } from "drizzle-orm";
import { getDbAsync } from "@/db";
import { subscribers } from "@/db/schema";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const db = await getDbAsync();
  const rows = await db
    .select()
    .from(subscribers)
    .orderBy(sql`${subscribers.createdAt} DESC`);

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
            Subscribers
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            订阅者 · {rows.length}
          </div>
        </div>
        <div>
          <a
            className="btn"
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(
              "email,confirmed_at,created_at\n" +
                rows
                  .map(
                    (r) =>
                      `${r.email},${r.confirmedAt?.toISOString() ?? ""},${r.createdAt.toISOString()}`
                  )
                  .join("\n")
            )}`}
            download="subscribers.csv"
          >
            ↓ 导出 CSV
          </a>
        </div>
      </div>
      <div className="admin-content">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Confirmed</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 13,
                    color: "var(--ink-2)",
                  }}
                >
                  {s.email}
                </td>
                <td
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: s.confirmedAt ? "var(--accent-3)" : "var(--ink-4)",
                  }}
                >
                  {s.confirmedAt ? "● confirmed" : "○ pending"}
                </td>
                <td
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: "var(--ink-4)",
                  }}
                >
                  {fmtDate(s.createdAt)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    textAlign: "center",
                    color: "var(--ink-4)",
                    padding: 48,
                  }}
                >
                  还没有订阅者。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
