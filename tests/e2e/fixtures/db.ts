import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { E2E_SLUG_PREFIX } from "./test-data";

const DB_NAME = "starblog-db";

function runD1Sql(sql: string): { ok: boolean; stderr: string; stdout: string } {
  // Write SQL to a temp file to avoid Windows shell argument-splitting on quoted strings.
  mkdirSync(tmpdir(), { recursive: true });
  const file = join(tmpdir(), `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
  writeFileSync(file, sql, "utf8");
  try {
    const r = spawnSync(
      "pnpm",
      [
        "exec",
        "wrangler",
        "d1",
        "execute",
        DB_NAME,
        "--local",
        `--file=${file}`,
      ],
      { encoding: "utf8", shell: process.platform === "win32" }
    );
    return {
      ok: r.status === 0,
      stderr: r.stderr ?? "",
      stdout: r.stdout ?? "",
    };
  } finally {
    try {
      unlinkSync(file);
    } catch {
      // ignore
    }
  }
}

export function deleteE2EPosts(): void {
  const sql = `DELETE FROM posts WHERE slug LIKE '${E2E_SLUG_PREFIX}%';`;
  const r = runD1Sql(sql);
  if (!r.ok) {
    throw new Error(`[e2e/db] failed to delete e2e posts:\n${r.stderr}`);
  }
}

export function deleteE2ESubscribers(): void {
  const r = runD1Sql(
    `DELETE FROM subscribers WHERE email LIKE '%@e2e.test' OR email LIKE '%@example.test';`
  );
  if (!r.ok) {
    throw new Error(`[e2e/db] failed to delete e2e subscribers:\n${r.stderr}`);
  }
}

export function deleteE2EComments(): void {
  const r = runD1Sql(
    `DELETE FROM comments WHERE author LIKE '[E2E]%' OR content LIKE '[E2E]%';`
  );
  if (!r.ok) {
    throw new Error(`[e2e/db] failed to delete e2e comments:\n${r.stderr}`);
  }
}

export function cleanAllE2EData(): void {
  deleteE2EComments();
  deleteE2EPosts();
  deleteE2ESubscribers();
}

export function ensureSeed(): void {
  const r = spawnSync(
    "pnpm",
    [
      "exec",
      "wrangler",
      "d1",
      "execute",
      DB_NAME,
      "--local",
      "--file=./drizzle/seed.sql",
    ],
    { encoding: "utf8", shell: process.platform === "win32" }
  );
  if (r.status !== 0) {
    throw new Error(`[e2e/db] failed to apply seed:\n${r.stderr}`);
  }
}

/**
 * Insert a few published fixture posts so tests that depend on the public
 * Writing list / RSS / article detail have content to render. The project's
 * seed.sql only seeds tags — real posts come from import-wp.mjs which the
 * e2e suite intentionally does not need.
 *
 * All fixture rows use the `${E2E_SLUG_PREFIX}fixture-` prefix and get cleaned
 * up by globalTeardown along with anything else e2e tests created.
 */
export function seedFixturePosts(): void {
  const body = [
    "## 引子",
    "",
    "这是 e2e fixture 文章正文。",
    "",
    "## 第二节",
    "",
    "更多内容用于测试 TOC 和 prose 渲染。",
    "",
  ].join("\n");
  const escaped = body.replace(/'/g, "''");
  const sql = `
INSERT INTO posts
  (slug, title, excerpt, body, tag_id, status, pinned, words, read_time, published_at)
VALUES
  ('${E2E_SLUG_PREFIX}fixture-cpp', '[E2E] Fixture C++ coroutines', 'e2e fixture excerpt one', '${escaped}', 'cpp', 'published', 1, 200, 2, unixepoch() - 86400 * 30),
  ('${E2E_SLUG_PREFIX}fixture-win', '[E2E] Fixture Windows debugging', 'e2e fixture excerpt two', '${escaped}', 'win', 'published', 0, 150, 1, unixepoch() - 86400 * 60),
  ('${E2E_SLUG_PREFIX}fixture-ai', '[E2E] Fixture AI tools', 'e2e fixture excerpt three', '${escaped}', 'ai', 'published', 0, 100, 1, unixepoch() - 86400 * 90);
`;
  const r = runD1Sql(sql);
  if (!r.ok) {
    throw new Error(`[e2e/db] failed to seed fixture posts:\n${r.stderr}`);
  }
}
