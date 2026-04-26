"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

interface Props {
  href: string;
  className?: string;
  style?: CSSProperties;
  hoverShift?: number;
  children: React.ReactNode;
}

/**
 * Row link that mirrors the design's hover translateX/background effect
 * without dropping into a fully client-rendered list.
 */
export function HoverRow({ href, className, style, hoverShift = 4, children }: Props) {
  return (
    <Link
      href={href}
      className={className}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        ...style,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "var(--bg-soft)";
        el.style.transform = `translateX(${hoverShift}px)`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "";
        el.style.transform = "";
      }}
    >
      {children}
    </Link>
  );
}
