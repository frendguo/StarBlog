"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/markdown";

interface Props {
  items: TocItem[];
}

export function TocSidebar({ items }: Props) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;
    const onScroll = () => {
      let cur = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top < 140) cur = it.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    }
  };

  return (
    <div style={{ position: "sticky", top: 100 }}>
      {items.length > 0 && (
        <>
          <div
            className="nav-label"
            style={{
              color: "var(--ink-4)",
              marginBottom: 14,
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            On this page
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {items.map((t) => (
              <button
                key={t.id}
                onClick={() => scrollTo(t.id)}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  textAlign: "left",
                  padding: `5px 0 5px ${12 + (t.depth - 2) * 12}px`,
                  borderLeft: `2px solid ${
                    active === t.id ? "var(--accent)" : "var(--rule)"
                  }`,
                  color: active === t.id ? "var(--ink)" : "var(--ink-3)",
                  cursor: "pointer",
                  transition: "all .12s",
                  background: "transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div
        style={{
          marginTop: 32,
          paddingTop: 20,
          borderTop: "1px solid var(--rule)",
        }}
      >
        <div
          style={{
            color: "var(--ink-4)",
            marginBottom: 12,
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Share
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <CopyLink />
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 14,
          background: "var(--bg-soft)",
          borderRadius: 6,
          fontFamily: "var(--mono)",
          fontSize: 10.5,
          color: "var(--ink-3)",
          lineHeight: 1.5,
        }}
      >
        <div style={{ color: "var(--accent)", marginBottom: 4 }}>★ TIP</div>
        用{" "}
        <kbd
          style={{
            background: "var(--bg-card)",
            padding: "1px 4px",
            borderRadius: 2,
            border: "1px solid var(--rule)",
          }}
        >
          ⌘K
        </kbd>{" "}
        搜索；
        <kbd
          style={{
            background: "var(--bg-card)",
            padding: "1px 4px",
            borderRadius: 2,
            border: "1px solid var(--rule)",
            marginLeft: 4,
          }}
        >
          g w
        </kbd>{" "}
        回 Writing。
      </div>
    </div>
  );
}

function CopyLink() {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  };
  return (
    <button
      className="btn"
      style={{ justifyContent: "flex-start", fontSize: 11 }}
      onClick={onCopy}
    >
      {copied ? "✓ Copied" : "⎘ Copy link"}
    </button>
  );
}
