import type { Metadata } from "next";
import Link from "next/link";
import { SectionTabs } from "@/components/SectionTabs";
import { getAllProjects } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

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
  const isEmpty = projects.length === 0;
  const ghUrl = `https://github.com/${siteConfig.author.github}`;
  return (
    <div className="page">
      <SectionTabs />
      <div className="page-eyebrow">
        {isEmpty ? "in workshop · open source" : `${projects.length} repos · open source`}
      </div>
      <h1 className="page-title">Projects</h1>
      <p className="page-lede">
        我做的一些东西。大多是 C++ / TypeScript 写的，开源在 GitHub。
        关于工具的看法：我倾向于自己造一些小而锋利的，胜过用一个大而全的。
      </p>

      {isEmpty && (
        <div className="projects-empty">
          <div className="projects-empty-card">
            <div className="projects-empty-mark">≡</div>
            <p className="projects-empty-caption">
              正在缝里头，更多项目散落在 GitHub 主页 — 先去 Writing 看看？
            </p>
            <p className="projects-empty-sub">
              这里专门展示的卡片还在挑，进行中的活儿都在
              <a href={ghUrl} target="_blank" rel="noreferrer noopener">
                {" "}github.com/{siteConfig.author.github}
              </a>
              。
            </p>
            <div className="projects-empty-actions">
              <a className="btn btn-primary" href={ghUrl} target="_blank" rel="noreferrer noopener">
                ↗ GitHub 主页
              </a>
              <Link className="btn" href="/writing">
                去 Writing →
              </Link>
            </div>
          </div>

          <a
            className="card project-card project-card-fallback"
            href={ghUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            <div className="project-card-head">
              <span style={{ fontFamily: "var(--mono)", fontSize: "1.0625rem", fontWeight: 600, color: "var(--ink)" }}>
                github.com/{siteConfig.author.github}
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
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF5722" }} />
                live profile
              </span>
            </div>
            <p style={{ fontFamily: "var(--serif)", fontSize: "0.9375rem", color: "var(--ink-3)", lineHeight: 1.55 }}>
              C++ / Windows / AI 相关的所有进行中的代码都丢在这。
              点进去翻最新的几个 repo 就够了。
            </p>
          </a>
        </div>
      )}

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
