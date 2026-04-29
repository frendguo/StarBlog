"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CLOSE_SEARCH, OPEN_SEARCH } from "@/lib/client-events";

interface IndexedPost {
  slug: string;
  title: string;
  excerpt: string;
  tagId: string;
  tagLabel: string;
  readTime: number;
}

interface SearchPaletteProps {
  posts: IndexedPost[];
}

interface CommandItem {
  type: "cmd";
  label: string;
  hint?: string;
  action: () => void;
}

interface PostItem {
  type: "post";
  data: IndexedPost;
}

type Item = CommandItem | PostItem;

export function SearchPalette({ posts }: SearchPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    window.addEventListener(OPEN_SEARCH, onOpen);
    window.addEventListener(CLOSE_SEARCH, onClose);
    return () => {
      window.removeEventListener(OPEN_SEARCH, onOpen);
      window.removeEventListener(CLOSE_SEARCH, onClose);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const commands = useMemo<CommandItem[]>(
    () => [
      { type: "cmd", label: "Go to Home", action: () => router.push("/"), hint: "g h" },
      { type: "cmd", label: "Go to Writing", action: () => router.push("/writing"), hint: "g w" },
      { type: "cmd", label: "Go to Projects", action: () => router.push("/projects"), hint: "g p" },
      { type: "cmd", label: "Go to Now", action: () => router.push("/now"), hint: "g n" },
      { type: "cmd", label: "Go to About", action: () => router.push("/about"), hint: "g a" },
      {
        type: "cmd",
        label: "Toggle theme",
        action: () => {
          const html = document.documentElement;
          const next = html.dataset.theme === "dark" ? "light" : "dark";
          html.dataset.theme = next;
          try {
            localStorage.setItem("theme", next);
          } catch {}
        },
        hint: "⌘ ⇧ L",
      },
      {
        type: "cmd",
        label: "Subscribe via RSS",
        action: () => router.push("/feed.xml"),
      },
      {
        type: "cmd",
        label: "Open Admin Studio (后台管理)",
        action: () => router.push("/admin"),
        hint: "⌘ ⇧ A",
      },
    ],
    [router]
  );

  const lower = q.toLowerCase().trim();
  const postResults = useMemo(
    () =>
      posts
        .filter(
          (p) =>
            !lower ||
            p.title.toLowerCase().includes(lower) ||
            p.excerpt.toLowerCase().includes(lower) ||
            p.tagLabel.toLowerCase().includes(lower)
        )
        .slice(0, 6),
    [posts, lower]
  );
  const cmdResults = useMemo(
    () =>
      commands.filter((c) => !lower || c.label.toLowerCase().includes(lower)),
    [commands, lower]
  );

  const all = useMemo<Item[]>(
    () => [
      ...postResults.map((p) => ({ type: "post" as const, data: p })),
      ...cmdResults,
    ],
    [postResults, cmdResults]
  );

  const close = () => setOpen(false);
  const run = (item: Item) => {
    if (item.type === "post") {
      router.push(`/writing/${item.data.slug}`);
    } else {
      item.action();
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSel((s) => Math.min(s + 1, all.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSel((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = all[sel];
        if (!item) return;
        if (item.type === "post") {
          router.push(`/writing/${item.data.slug}`);
        } else {
          item.action();
        }
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, sel, all, router]);

  if (!open) return null;

  return (
    <div className="palette-overlay" onClick={close}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input-row">
          <span className="palette-input-prefix">›</span>
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="Search articles, jump to pages, run commands…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
          />
          <kbd className="palette-esc">esc</kbd>
        </div>
        <div className="palette-results">
          {postResults.length > 0 && (
            <>
              <div className="palette-section-label">ARTICLES · {postResults.length}</div>
              {postResults.map((p, i) => (
                <div
                  key={p.slug}
                  className={`palette-result ${sel === i ? "sel" : ""}`}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => run({ type: "post", data: p })}
                >
                  <span className="palette-result-icon palette-result-icon-accent">§</span>
                  <span className="palette-result-title">{p.title}</span>
                  <span className={`tag ${p.tagId} palette-result-tag`}>
                    {p.tagLabel}
                  </span>
                  <span className="palette-result-meta">{p.readTime}m</span>
                </div>
              ))}
            </>
          )}
          {cmdResults.length > 0 && (
            <>
              <div className="palette-section-label palette-section-label-spaced">
                COMMANDS · {cmdResults.length}
              </div>
              {cmdResults.map((c, i) => {
                const idx = postResults.length + i;
                return (
                  <div
                    key={c.label}
                    className={`palette-result ${sel === idx ? "sel" : ""}`}
                    onMouseEnter={() => setSel(idx)}
                    onClick={() => run(c)}
                  >
                    <span className="palette-result-icon">›</span>
                    <span className="palette-result-title palette-result-title-command">{c.label}</span>
                    {c.hint && <span className="palette-result-meta">{c.hint}</span>}
                  </div>
                );
              })}
            </>
          )}
          {all.length === 0 && (
            <div className="palette-empty">没有匹配的结果</div>
          )}
        </div>
        <div className="palette-foot">
          <span>
            <kbd>↑↓</kbd>navigate
          </span>
          <span>
            <kbd>↵</kbd>select
          </span>
          <span>
            <kbd>esc</kbd>close
          </span>
          <span className="palette-foot-label">frendguo.com search</span>
        </div>
      </div>
    </div>
  );
}
