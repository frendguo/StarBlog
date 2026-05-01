"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_ITEMS, siteConfig } from "@/lib/site-config";
import { dispatchOpenSearch } from "@/lib/client-events";

export function TopNav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = (document.documentElement.dataset.theme as "light" | "dark") || "light";
    setTheme(t);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (mobileSheetRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  const onToggle = () => {
    const next = theme === "light" ? "dark" : "light";
    const root = document.documentElement;
    root.classList.add("theme-switching");
    setTheme(next);
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    window.setTimeout(() => root.classList.remove("theme-switching"), 60);
  };

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  // Hide TopNav on /admin (admin has its own shell)
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header className="topnav">
        <Link href="/" className="brand">
          <div className="brand-mark">f</div>
          <span>
            {siteConfig.author.name}
            <span style={{ color: "var(--accent)" }}>.</span>
          </span>
        </Link>
        <nav className="nav-pills" aria-label="Primary">
          {NAV_ITEMS.map((it) => (
            <Link
              key={it.id}
              href={it.href}
              className={`nav-pill ${isActive(it.href) ? "active" : ""}`}
            >
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="nav-spacer" />
        <button
          type="button"
          className="search-trigger"
          onClick={() => dispatchOpenSearch()}
          aria-label="Open search"
        >
          <span style={{ color: "var(--ink-4)" }}>⌕</span>
          <span className="search-trigger-label">Search</span>
          <span className="kbd">⌘K</span>
        </button>
        <button
          type="button"
          className="icon-btn nav-mobile-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          title={menuOpen ? "Close menu" : "Open menu"}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-sheet"
        >
          {menuOpen ? (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M3 4.5h10M3 8h10M3 11.5h10" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <button
          type="button"
          className="icon-btn desktop-only"
          onClick={onToggle}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <circle cx="8" cy="8" r="3.2" />
              <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M3.3 12.7l1.1-1.1M11.6 4.4l1.1-1.1" />
              </g>
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M11 8.5A5 5 0 016.2 2 6 6 0 1014 9.7 5 5 0 0111 8.5z" />
            </svg>
          )}
        </button>
        <a
          className="icon-btn desktop-only"
          href={`https://github.com/${siteConfig.author.github}`}
          target="_blank"
          rel="noreferrer noopener"
          title="GitHub"
          aria-label="GitHub"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
        <Link className="icon-btn desktop-only" href="/feed.xml" title="RSS" aria-label="RSS">
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <circle cx="3.5" cy="12.5" r="1.5" />
            <path d="M2 5.5v2A6.5 6.5 0 018.5 14h2A8.5 8.5 0 002 5.5z" />
            <path d="M2 1.5v2A10.5 10.5 0 0112.5 14h2A12.5 12.5 0 002 1.5z" />
          </svg>
        </Link>
      </header>

      {menuOpen && <button type="button" className="nav-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <div
        id="mobile-nav-sheet"
        ref={mobileSheetRef}
        className={`mobile-nav-sheet ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-nav-handle" />
        <div className="mobile-nav-header">
          <span className="mobile-nav-title">Navigation</span>
          <button type="button" className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="mobile-nav-list" aria-label="Mobile navigation">
          {NAV_ITEMS.map((it) => (
            <Link
              key={it.id}
              href={it.href}
              className={`mobile-nav-item ${isActive(it.href) ? "active" : ""}`}
            >
              <span>{it.label}</span>
              <span>→</span>
            </Link>
          ))}
        </nav>
        <div className="mobile-nav-utilities">
          <a
            className="icon-btn"
            href={`https://github.com/${siteConfig.author.github}`}
            target="_blank"
            rel="noreferrer noopener"
            title="GitHub"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <Link className="icon-btn" href="/feed.xml" title="RSS" aria-label="RSS">
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <circle cx="3.5" cy="12.5" r="1.5" />
              <path d="M2 5.5v2A6.5 6.5 0 018.5 14h2A8.5 8.5 0 002 5.5z" />
              <path d="M2 1.5v2A10.5 10.5 0 0112.5 14h2A12.5 12.5 0 002 1.5z" />
            </svg>
          </Link>
          <a className="icon-btn" href={`mailto:${siteConfig.author.email}`} aria-label="Mail">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M2.5 4.5h11v7h-11z" />
              <path d="M2.8 5l5.2 4 5.2-4" />
            </svg>
          </a>
          <button
            type="button"
            className="icon-btn"
            onClick={onToggle}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <circle cx="8" cy="8" r="3.2" />
                <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M3.3 12.7l1.1-1.1M11.6 4.4l1.1-1.1" />
                </g>
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M11 8.5A5 5 0 016.2 2 6 6 0 1014 9.7 5 5 0 0111 8.5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
