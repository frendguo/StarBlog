"use client";

import { useEffect, useMemo, useState } from "react";
import type { TocItem } from "@/lib/markdown";

interface Props {
  items: TocItem[];
}

export function TocSidebar({ items }: Props) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const ids = useMemo(() => items.map((i) => i.id), [items]);

  useEffect(() => {
    if (items.length === 0) return;
    const tops = new Map<string, number>();
    const update = () => {
      let cur = items[0]?.id ?? "";
      for (const it of items) {
        const top = tops.get(it.id);
        if (top === undefined) continue;
        if (top < 140) cur = it.id;
      }
      setActive(cur);
      const idx = ids.indexOf(cur);
      if (idx >= 0) {
        setVisited((prev) => {
          const next = new Set(prev);
          for (let i = 0; i <= idx; i++) next.add(ids[i]);
          return next;
        });
      }
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          tops.set(entry.target.id, entry.boundingClientRect.top);
        }
        update();
      },
      { rootMargin: "0px 0px -55% 0px", threshold: [0, 1] }
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) {
        tops.set(it.id, el.getBoundingClientRect().top);
        io.observe(el);
      }
    }
    const onScroll = () => {
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el) tops.set(it.id, el.getBoundingClientRect().top);
      }
      update();
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items, ids]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
      setMobileOpen(false);
    }
  };

  return (
    <div className="toc-sidebar">
      {items.length > 0 && (
        <>
          <button
            type="button"
            className="toc-mobile-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="toc-mobile-panel"
          >
            <span className="toc-label">On this page</span>
            <span>{mobileOpen ? "收起" : "展开"}</span>
          </button>
          <div className="toc-desktop-list">
            {items.map((t) => (
              <button
                key={t.id}
                onClick={() => scrollTo(t.id)}
                className={`toc-item ${active === t.id ? "active" : visited.has(t.id) ? "visited" : ""}`}
                style={{ paddingLeft: `${12 + (t.depth - 2) * 12}px` }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div
            id="toc-mobile-panel"
            className={`toc-mobile-panel ${mobileOpen ? "open" : ""}`}
            aria-hidden={!mobileOpen}
          >
            {items.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => scrollTo(t.id)}
                className={`toc-item ${active === t.id ? "active" : visited.has(t.id) ? "visited" : ""}`}
                style={{ paddingLeft: `${12 + (t.depth - 2) * 12}px` }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="toc-utility-block">
        <div className="toc-label">Share</div>
        <div className="toc-utility-list">
          <CopyLink />
        </div>
      </div>

      <div className="toc-tip-card">
        <div className="toc-tip-title">★ TIP</div>
        用{" "}
        <kbd className="toc-kbd">⌘K</kbd>{" "}
        搜索；
        <kbd className="toc-kbd toc-kbd-spaced">g w</kbd>{" "}
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
      className="btn toc-copy-btn"
      onClick={onCopy}
    >
      {copied ? "✓ Copied" : "⎘ Copy link"}
    </button>
  );
}
