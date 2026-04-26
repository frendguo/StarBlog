"use client";

import { useEffect, useState } from "react";

interface Props {
  postCount: number;
  nowSummary: string;
}

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

  useEffect(() => {
    if (idx >= lines.length) return;
    const t = setTimeout(() => setIdx((i) => i + 1), 700);
    return () => clearTimeout(t);
  }, [idx, lines.length]);

  return (
    <div
      style={{
        maxWidth: 460,
        margin: "56px auto 0",
        position: "relative",
        zIndex: 1,
      }}
    >
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
          {idx < lines.length && <span className="cursor" />}
        </div>
      </div>
    </div>
  );
}
