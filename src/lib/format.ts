export function fmtDate(d: Date | string | number): string {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtMonthDay(d: Date | string | number): string {
  const dt = d instanceof Date ? d : new Date(d);
  return dt
    .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
    .toUpperCase();
}

export function fmtMonthYear(d: Date | string | number): string {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

/**
 * Compute reading time + word count from a markdown body.
 * Mixed CJK + Latin: count CJK chars + Latin words ≈ "word units".
 */
export function analyzeBody(body: string): { words: number; readTime: number } {
  const cjk = (body.match(/[一-龥　-〿]/g) || []).length;
  const latinWords = body
    .replace(/[一-龥　-〿]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const words = cjk + latinWords;
  // 280 wpm for mixed text feels honest.
  const readTime = Math.max(1, Math.round(words / 280));
  return { words, readTime };
}

export function relativeTime(d: Date | string | number): string {
  const dt = d instanceof Date ? d : new Date(d);
  const diff = (Date.now() - dt.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} days ago`;
  return fmtDate(dt);
}
