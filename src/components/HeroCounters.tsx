"use client";

import { useEffect, useState } from "react";

interface Props {
  posts: number;
  words: number;
  years: number;
}

export function HeroCounters({ posts, words, years }: Props) {
  // Initialize with real values so the SSR pass and hidden tabs (where rAF
  // is throttled to never-fire) both render correctly. The visible-tab
  // animation resets to 0 below.
  const [shown, setShown] = useState({ posts, words, years });

  useEffect(() => {
    if (typeof document === "undefined" || document.hidden) return;
    setShown({ posts: 0, words: 0, years: 0 });

    const dur = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setShown({
        posts: Math.round(posts * e),
        words: Math.round(words * e),
        years: Math.round(years * e),
      });
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [posts, words, years]);

  return (
    <div className="hero-stats" style={{ justifyContent: "center" }}>
      <div>
        <div className="hero-stat-num">{shown.posts}</div>
        <div className="hero-stat-lbl">Articles</div>
      </div>
      <div>
        <div className="hero-stat-num">{(shown.words / 1000).toFixed(1)}K</div>
        <div className="hero-stat-lbl">Words written</div>
      </div>
      <div>
        <div className="hero-stat-num">
          {shown.years}
          <span style={{ fontSize: 18, color: "var(--ink-3)" }}> yrs</span>
        </div>
        <div className="hero-stat-lbl">Writing online</div>
      </div>
      <div>
        <div className="hero-stat-num" style={{ color: "var(--accent-3)" }}>
          ● <span style={{ fontSize: 16 }}>online</span>
        </div>
        <div className="hero-stat-lbl">Building right now</div>
      </div>
    </div>
  );
}
