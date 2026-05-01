"use client";

import { useEffect, useState } from "react";

interface Props {
  postCount: number;
  nowSummary: string;
}

const SEEN_KEY = "starblog_term_played";

export function HeroTerminal({ postCount, nowSummary }: Props) {
  const lines = [
    { p: "~/blog", cmd: "whoami" },
    { p: "", out: "frendguo · C++ / Windows / AI engineer" },
    { p: "~/blog", cmd: "ls posts/ | wc -l" },
    { p: "", out: String(postCount) },
    { p: "~/blog", cmd: "cat now.md" },
    { p: "", out: nowSummary },
  ];

  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY) === "1") {
        setIdx(lines.length);
        setDone(true);
        return;
      }
    } catch {}
  }, [lines.length]);

  useEffect(() => {
    if (idx >= lines.length) {
      if (!done) {
        setDone(true);
        try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
      }
      return;
    }
    const t = setTimeout(() => setIdx((i) => i + 1), 700);
    return () => clearTimeout(t);
  }, [idx, lines.length, done]);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div className="terminal-float" style={{ marginTop: 0 }}>
        <div className="terminal-float-bar">
          <span className="t-r" />
          <span className="t-y" />
          <span className="t-g" />
        </div>
        <div style={{ textAlign: "left" }}>
          {lines.slice(0, idx).map((l, i) =>
            l.cmd ? (
              <div key={i}>
                <span className="prompt">{l.p} ▸ </span>
                <span className="cmd">{l.cmd}</span>
              </div>
            ) : (
              <div key={i}>
                <span className="out">{l.out}</span>
              </div>
            )
          )}
          {(idx < lines.length || done) && <span className="cursor" />}
        </div>
      </div>
    </div>
  );
}
