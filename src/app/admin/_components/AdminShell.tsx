"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

interface NavEntry {
  href: string;
  label: string;
  icon: string;
  badge?: string;
}

const NAV: NavEntry[] = [
  { href: "/admin", label: "Dashboard", icon: "◧" },
  { href: "/admin/posts", label: "Posts", icon: "§" },
  { href: "/admin/tags", label: "Tags", icon: "#" },
  { href: "/admin/comments", label: "Comments", icon: "❝" },
  { href: "/admin/subscribers", label: "Subscribers", icon: "✉" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Render bare on /admin/login
  if (pathname === "/admin/login") return <>{children}</>;

  const active = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          <div
            className="brand-mark"
            style={{ width: 26, height: 26, fontSize: "0.75rem" }}
          >
            f
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Admin Studio
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.625rem",
                color: "var(--ink-4)",
              }}
            >
              v3.0
            </div>
          </div>
        </div>
        <nav>
          {NAV.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`admin-nav-item ${active(it.href) ? "active" : ""}`}
            >
              <span className="ico">{it.icon}</span>
              <span>{it.label}</span>
              {it.badge && <span className="badge">{it.badge}</span>}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "auto" }}>
          <Link
            href="/"
            className="admin-nav-item"
            style={{ marginTop: 16, fontSize: "0.75rem" }}
          >
            <span className="ico">↗</span>
            <span>Back to site</span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="admin-nav-item"
              style={{
                width: "100%",
                fontSize: "0.75rem",
                color: "var(--ink-3)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span className="ico">⏻</span>
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
