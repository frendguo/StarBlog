"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTION_ITEMS = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/now", label: "Now" },
] as const;

export function SectionTabs() {
  const pathname = usePathname();

  return (
    <nav className="section-tabs" aria-label="About sections">
      {SECTION_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`section-tab ${active ? "active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
