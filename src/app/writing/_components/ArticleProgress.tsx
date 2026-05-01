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
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: "transparent",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, var(--accent) 0%, #FF9F43 100%)",
          boxShadow: "0 0 6px rgba(255,87,34,.45)",
          transition: "width .1s linear",
        }}
      />
    </div>
  );
}
