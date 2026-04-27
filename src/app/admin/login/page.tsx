import { login } from "@/app/actions/auth";

export const metadata = { title: "登录 · Admin Studio" };

const ERROR_MAP: Record<string, string> = {
  bad: "用户名或密码不对",
  empty: "请填写用户名和密码",
  config: "服务端缺少环境变量（ADMIN_PASSWORD_HASH / AUTH_SECRET），无法登录",
};

interface Props {
  searchParams?: Promise<{ err?: string; from?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const errMsg = params.err ? ERROR_MAP[params.err] ?? "登录失败" : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg)",
        padding: 24,
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 32,
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}
        >
          <div className="brand-mark">f</div>
          <div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.125rem",
                fontWeight: 600,
              }}
            >
              Admin Studio
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.6875rem",
                color: "var(--ink-4)",
              }}
            >
              内部使用 · 单管理员
            </div>
          </div>
        </div>

        <form action={login}>
          <input type="hidden" name="from" value={params.from ?? "/admin"} />

          <div className="field-row">
            <label className="field-label" htmlFor="username">
              用户名
            </label>
            <input
              id="username"
              name="username"
              className="input"
              autoComplete="username"
              defaultValue="admin"
              required
            />
          </div>

          <div className="field-row">
            <label className="field-label" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              autoComplete="current-password"
              required
            />
          </div>

          {errMsg && (
            <div
              style={{
                marginBottom: 16,
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(220, 38, 38, .08)",
                border: "1px solid rgba(220, 38, 38, .25)",
                color: "#DC2626",
                fontFamily: "var(--mono)",
                fontSize: "0.75rem",
              }}
            >
              {errMsg}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            登录 →
          </button>
        </form>

        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid var(--rule)",
            fontFamily: "var(--mono)",
            fontSize: "0.6563rem",
            color: "var(--ink-4)",
            lineHeight: 1.6,
          }}
        >
          需要先在 <code>.dev.vars</code> 或 Cloudflare 环境变量里设置:
          <br />
          <code>ADMIN_USERNAME</code> · <code>ADMIN_PASSWORD_HASH</code> ·{" "}
          <code>AUTH_SECRET</code>
        </div>
      </div>
    </div>
  );
}
