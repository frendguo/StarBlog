/**
 * Seed data — only fixed tag taxonomy is seeded.
 * Posts and projects are imported from external sources (e.g. WordPress dump)
 * via scripts/import-wp.mjs.
 */

export const SEED_TAGS = [
  { id: "cpp", label: "C++", hint: "现代 C++ 实践与底层", color: "cpp", sort: 1 },
  { id: "win", label: "Windows", hint: "Win32 / WinRT / 调试", color: "win", sort: 2 },
  { id: "ai", label: "AI", hint: "LLM 工具链与思考", color: "ai", sort: 3 },
  { id: "note", label: "随笔", hint: "关于工程师生活", color: "note", sort: 4 },
  { id: "tool", label: "工具", hint: "开发环境与小品", color: "tool", sort: 5 },
] as const;

export type SeedTagId = (typeof SEED_TAGS)[number]["id"];
