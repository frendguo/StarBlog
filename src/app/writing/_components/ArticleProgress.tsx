"use client";

import { useEffect, useState } from "react";

export function ArticleProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const sc = window.scrollY;
      setPct(total > 0 ? Math.min(100, Math.max(0, (sc / total) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: "transparent",
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "var(--accent)",
          transition: "width .1s linear",
        }}
      />
    </div>
  );
}
