import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Now",
  description: "我现在正在做什么、想什么、读什么。",
};

const NOW_DATA = {
  updatedAt: "2026-04-22",
  doing: [
    { k: "wcap v2", v: "把 Win32 capture API 包装成可 await 的协程" },
    { k: "PDB 系列文章", v: "正在写第二篇，关于 TPI / IPI Stream" },
    { k: "Claude Code 模板", v: "为 C++ 项目写一套 hooks 和子代理" },
  ],
  reading: [
    { k: "Designing Data-Intensive Applications", v: "Martin Kleppmann" },
    { k: "我们如何陷入分歧", v: "Tim Urban (重读)" },
    { k: "C++ Templates: The Complete Guide", v: "Vandevoorde et al." },
  ],
  thinking: [
    { k: "工具的代价", v: "当 AI 帮你写完所有代码，你还是工程师吗？" },
    { k: "C++ 的边界", v: "Rust 已经吃掉了系统编程的一半地盘" },
    { k: "专注力", v: "我的注意力跨度在变短，这值得警惕" },
  ],
  notDoing: [
    { k: "社交媒体", v: "从 X 上撤了 80%，只发布不消费" },
    { k: "副业焦虑", v: "今年决定只做一件事到底" },
    { k: "加班", v: "主动选择 9–6，把时间留给写作" },
  ],
};

export default function NowPage() {
  return (
    <div className="page">
      <div className="page-eyebrow">Updated {NOW_DATA.updatedAt} · /now</div>
      <h1 className="page-title">Now</h1>
      <p className="page-lede">
        一份{" "}
        <a
          style={{ color: "var(--accent)", textDecoration: "underline" }}
          href="https://sive.rs/nowff"
          target="_blank"
          rel="noreferrer noopener"
        >
          Derek Sivers 风格
        </a>{" "}
        的 now 页 — 我现在正在做什么、想什么、读什么。每月更新一次。
      </p>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}
      >
        <NowSection title="正在做" emoji="✦" items={NOW_DATA.doing} />
        <NowSection title="正在读" emoji="❒" items={NOW_DATA.reading} />
        <NowSection title="正在思考" emoji="◐" items={NOW_DATA.thinking} />
        <NowSection title="不在做" emoji="✕" items={NOW_DATA.notDoing} />
      </div>

      <hr
        style={{
          margin: "64px 0 32px",
          border: "none",
          borderTop: "1px solid var(--rule)",
        }}
      />
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.6875rem",
          color: "var(--ink-4)",
        }}
      >
        Last 4 updates · 2026-04 · 2026-03 · 2026-02 · 2026-01
      </div>
    </div>
  );
}

function NowSection({
  title,
  emoji,
  items,
}: {
  title: string;
  emoji: string;
  items: { k: string; v: string }[];
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.6875rem",
          color: "var(--accent)",
          letterSpacing: "0.14em",
          marginBottom: 16,
        }}
      >
        {emoji} {title.toUpperCase()}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((it) => (
          <div
            key={it.k}
            style={{ paddingBottom: 14, borderBottom: "1px dashed var(--rule)" }}
          >
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1rem",
                color: "var(--ink)",
                marginBottom: 4,
                fontWeight: 500,
              }}
            >
              {it.k}
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "0.875rem",
                color: "var(--ink-3)",
                lineHeight: 1.5,
              }}
            >
              {it.v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
