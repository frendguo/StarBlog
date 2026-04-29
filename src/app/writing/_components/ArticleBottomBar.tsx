"use client";

import { useState } from "react";

interface Props {
  hasToc: boolean;
}

export function ArticleBottomBar({ hasToc }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.offsetTop - 88, behavior: "smooth" });
  };

  return (
    <div className="article-bottom-bar">
      <button type="button" className="article-bottom-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        ↑ 顶部
      </button>
      <button
        type="button"
        className="article-bottom-btn article-bottom-btn-accent"
        onClick={() => (hasToc ? scrollTo("article-toc") : scrollTo("article-body"))}
      >
        继续阅读
      </button>
      <button type="button" className="article-bottom-btn" onClick={onCopy}>
        {copied ? "已复制" : "分享"}
      </button>
    </div>
  );
}
