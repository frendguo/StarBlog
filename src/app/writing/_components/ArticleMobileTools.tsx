"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  hasToc: boolean;
}

export function ArticleMobileTools({ hasToc }: Props) {
  const router = useRouter();
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("reader-large");
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.offsetTop - 88, behavior: "smooth" });
  };

  return (
    <div className="article-mobile-tools">
      <button type="button" className="article-tool-btn" onClick={() => router.back()}>
        ← 返回
      </button>
      <button
        type="button"
        className="article-tool-btn"
        onClick={() => (hasToc ? scrollTo("article-toc") : scrollTo("article-body"))}
      >
        ☰ 目录
      </button>
      <button
        type="button"
        className={`article-tool-btn ${largeText ? "active" : ""}`}
        onClick={() =>
          setLargeText((value) => {
            const next = !value;
            document.documentElement.classList.toggle("reader-large", next);
            return next;
          })
        }
        aria-pressed={largeText}
      >
        Aa
      </button>
    </div>
  );
}
