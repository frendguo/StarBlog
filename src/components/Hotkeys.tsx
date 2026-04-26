"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { dispatchOpenSearch } from "@/lib/client-events";

const G_MAP: Record<string, string> = {
  h: "/",
  w: "/writing",
  p: "/projects",
  n: "/now",
  a: "/about",
};

export function Hotkeys() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let lastG = 0;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dispatchOpenSearch();
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const now = Date.now();
      if (e.key === "g") {
        lastG = now;
        return;
      }
      if (now - lastG < 800) {
        const dest = G_MAP[e.key];
        if (dest) {
          router.push(dest);
          lastG = 0;
          window.scrollTo({ top: 0 });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, pathname]);

  return null;
}
