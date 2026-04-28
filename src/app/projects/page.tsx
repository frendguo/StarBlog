import type { Metadata } from "next";
import { SectionTabs } from "@/components/SectionTabs";
import { getAllProjects } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Projects",
  description: "我做的一些开源项目，大多是 C++ / TypeScript 写的。",
};

export const revalidate = 60;

const STATE_PALETTE: Record<string, { c: string; l: string }> = {
  maintained: { c: "#22c55e", l: "maintained" },
  wip: { c: "#f59e0b", l: "wip" },
  paused: { c: "#94a3b8", l: "paused" },
  live: { c: "#FF5722", l: "live" },
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  return (
    <div className="page">
      <SectionTabs />
      <div className="page-eyebrow">{projects.length} repos · open source</div>
      <h1 className="page-title">Projects</h1>
      <p className="page-lede">
        我做的一些东西。大多是 C++ / TypeScript 写的，开源在 GitHub。
        关于工具的看法：我倾向于自己造一些小而锋利的，胜过用一个大而全的。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {projects.map((p) => {
          const palette = STATE_PALETTE[p.state] ?? { c: "#888", l: p.state };
          return (
            <div key={p.name} className="card project-card" style={{ padding: 22 }}>
              <div className="project-card-head">
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "1.0625rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  {p.name}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: "var(--mono)",
                    fontSize: "0.6563rem",
                    color: "var(--ink-3)",
                    padding: "2px 7px",
                    border: "1px solid var(--rule)",
                    borderRadius: 3,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: palette.c,
                    }}
                  />
                  {palette.l}
                </span>
                <span className="project-card-metrics">
                  <span>
                    <span style={{ color: "var(--ink-3)" }}>⌥</span> {p.language}
                  </span>
                  <span>
                    <span style={{ color: "var(--ink-3)" }}>★</span> {p.stars}
                  </span>
                  <span>{p.year}</span>
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "0.9375rem",
                  color: "var(--ink-3)",
                  lineHeight: 1.55,
                }}
              >
                {p.description}
              </p>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                {p.url && (
                  <a
                    className="btn"
                    style={{ fontSize: "0.6875rem", padding: "6px 10px" }}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    ↗ GitHub
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
