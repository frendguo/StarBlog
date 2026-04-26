"use client";

import Link from "next/link";
import type { TagRow } from "@/lib/posts";

interface Props {
  tags: TagRow[];
  activeTag: string;
  totalCount: number;
}

export function WritingFilter({ tags, activeTag, totalCount }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginBottom: 40,
        paddingBottom: 24,
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <Link
        href="/writing"
        className="tag"
        style={{
          cursor: "pointer",
          padding: "5px 11px",
          fontSize: 12,
          background: activeTag === "all" ? "var(--ink)" : "var(--bg-soft)",
          color: activeTag === "all" ? "var(--bg)" : "var(--ink-3)",
          borderColor: activeTag === "all" ? "var(--ink)" : "var(--rule)",
          textDecoration: "none",
        }}
      >
        All <span style={{ marginLeft: 4, opacity: 0.6 }}>· {totalCount}</span>
      </Link>
      {tags.map((t) => (
        <Link
          key={t.id}
          href={`/writing?tag=${t.id}`}
          className={`tag ${activeTag === t.id ? "" : t.id}`}
          style={{
            cursor: "pointer",
            padding: "5px 11px",
            fontSize: 12,
            textDecoration: "none",
            ...(activeTag === t.id
              ? {
                  background: "var(--ink)",
                  color: "var(--bg)",
                  borderColor: "var(--ink)",
                }
              : {}),
          }}
        >
          {t.label}{" "}
          <span style={{ marginLeft: 4, opacity: 0.6 }}>· {t.count}</span>
        </Link>
      ))}
    </div>
  );
}
