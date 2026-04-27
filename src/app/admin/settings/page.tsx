import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
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
            Settings
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.125rem",
              fontWeight: 500,
            }}
          >
            站点配置
          </div>
        </div>
      </div>
      <div className="admin-content" style={{ maxWidth: 720 }}>
        <p
          style={{
            color: "var(--ink-3)",
            fontFamily: "var(--serif)",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          站点的基础信息存在 <code>src/lib/site-config.ts</code> 里 —
          重新部署即可生效。下面这些字段是只读快照：
        </p>

        <div className="card" style={{ padding: 22 }}>
          <Field label="作者" value={`${siteConfig.author.realName} (${siteConfig.author.name})`} />
          <Field label="所在地" value={siteConfig.author.location} />
          <Field label="邮箱" value={siteConfig.author.email} />
          <Field label="GitHub" value={`https://github.com/${siteConfig.author.github}`} />
          <Field label="站点 URL" value={siteConfig.url} />
        </div>

        <div className="section-label" style={{ marginTop: 32 }}>
          <span>⚙</span> 部署
        </div>
        <div className="card" style={{ padding: 22 }}>
          <Field label="运行环境" value="Cloudflare Workers + OpenNext" />
          <Field label="数据库" value="Cloudflare D1 (SQLite, edge-replicated)" />
          <Field label="构建命令" value="pnpm deploy → wrangler deploy" />
          <Field
            label="迁移"
            value="pnpm db:generate · pnpm db:migrate:remote · pnpm db:seed:remote"
          />
        </div>

        <div className="section-label" style={{ marginTop: 32 }}>
          <span>!</span> Danger zone
        </div>
        <div
          className="card"
          style={{
            padding: 22,
            borderColor: "rgba(220,38,38,.3)",
            background: "rgba(220, 38, 38, .04)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.75rem",
              color: "var(--ink-3)",
              lineHeight: 1.6,
            }}
          >
            重置 / 重灌数据请用 wrangler 命令行。后台不再提供一键操作以避免误删除。
            <br />
            <br />
            <code>wrangler d1 execute starblog-db --remote --command &quot;DROP TABLE posts&quot;</code>
          </p>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 16,
        padding: "10px 0",
        borderBottom: "1px dashed var(--rule-soft)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.6875rem",
          color: "var(--ink-4)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.8125rem",
          color: "var(--ink-2)",
          wordBreak: "break-all",
        }}
      >
        {value}
      </span>
    </div>
  );
}
