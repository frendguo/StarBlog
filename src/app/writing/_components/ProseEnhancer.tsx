"use client";

import { useEffect, useState } from "react";

export function ProseEnhancer() {
  const [zoomed, setZoomed] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      const copyBtn = target.closest<HTMLButtonElement>("button.code-block-copy");
      if (copyBtn) {
        const figure = copyBtn.closest("figure.code-block");
        const code = figure?.querySelector("pre code");
        if (!code) return;
        try {
          await navigator.clipboard.writeText(code.textContent ?? "");
          const original = copyBtn.dataset.original ?? copyBtn.textContent ?? "Copy";
          copyBtn.dataset.original = original;
          copyBtn.classList.add("copied");
          copyBtn.textContent = "✓ Copied";
          window.setTimeout(() => {
            copyBtn.classList.remove("copied");
            copyBtn.textContent = original;
          }, 1400);
        } catch {}
        return;
      }

      const img = target.closest<HTMLImageElement>("img.prose-img-zoomable");
      if (img) {
        e.preventDefault();
        setZoomed({ src: img.currentSrc || img.src, alt: img.alt || "" });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoomed]);

  if (!zoomed) return null;

  return (
    <div
      className="prose-img-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={zoomed.alt || "Image preview"}
      onClick={() => setZoomed(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={zoomed.src} alt={zoomed.alt} />
      {zoomed.alt && <div className="prose-img-lightbox-caption">{zoomed.alt}</div>}
      <button
        type="button"
        className="prose-img-lightbox-close"
        aria-label="Close"
        onClick={() => setZoomed(null)}
      >
        ×
      </button>
    </div>
  );
}
