/**
 * One-shot importer: WordPress softsql.sql dump → drizzle/imports/wp.sql.
 *
 *   node scripts/import-wp.mjs <path-to-softsql.sql>
 *
 * Outputs three artifacts under drizzle/imports/:
 *   - wp.sql              D1-compatible INSERTs for posts table
 *   - wp-redirects.json   array of slugs (for next.config.ts redirects)
 *   - wp-images.json      array of upload paths (for upload-media-to-r2.mjs)
 *
 * Decisions baked in (per user choice):
 *   - all posts mapped to tagId='win'
 *   - series = null, pinned = false
 *   - drafts kept (status='draft'), auto-draft skipped
 *   - comments NOT imported
 *   - image URLs rewritten to https://media.frendguo.com/<key>
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import TurndownService from "turndown";
import * as turndownPluginGfm from "turndown-plugin-gfm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const WP_HOST = "frendguo.com";
const MEDIA_BASE = "https://media.frendguo.com";
const TAG_ID = "win";

const sqlPath = resolve(process.argv[2] ?? "C:/Users/frend/AppData/Local/Temp/wp-import/softsql.sql");
console.log(`Reading ${sqlPath}`);
const SQL = readFileSync(sqlPath, "utf8");

// ---------- MySQL dump parser ---------------------------------------------

function extractInsertBlock(table) {
  const re = new RegExp(`INSERT INTO \`${table}\` VALUES\\s*([\\s\\S]*?);\\n`, "g");
  const blocks = [];
  for (const m of SQL.matchAll(re)) blocks.push(m[1]);
  return blocks.join(",\n");
}

function parseTuples(text) {
  const tuples = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    while (i < n && text[i] !== "(") i++;
    if (i >= n) break;
    i++;
    const fields = [];
    let cur = "";
    let inStr = false;
    let depth = 0;
    while (i < n) {
      const c = text[i];
      if (inStr) {
        if (c === "\\") {
          cur += c + text[i + 1];
          i += 2;
          continue;
        }
        if (c === "'") {
          inStr = false;
          cur += c;
          i++;
          continue;
        }
        cur += c;
        i++;
        continue;
      }
      if (c === "'") {
        inStr = true;
        cur += c;
        i++;
        continue;
      }
      if (c === "(") {
        depth++;
        cur += c;
        i++;
        continue;
      }
      if (c === ")" && depth > 0) {
        depth--;
        cur += c;
        i++;
        continue;
      }
      if (c === ")" && depth === 0) {
        fields.push(cur.trim());
        i++;
        tuples.push(fields);
        break;
      }
      if (c === ",") {
        fields.push(cur.trim());
        cur = "";
        i++;
        continue;
      }
      cur += c;
      i++;
    }
  }
  return tuples;
}

function unq(s) {
  if (s === "NULL") return null;
  if (s.startsWith("'") && s.endsWith("'")) {
    return s
      .slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\0/g, "\0")
      .replace(/\\t/g, "\t");
  }
  return s;
}

// ---------- Extract posts + meta ------------------------------------------

const postsRaw = parseTuples(extractInsertBlock("wp_posts"));
const allPosts = postsRaw.map((r) => ({
  ID: Number(r[0]),
  post_date_gmt: unq(r[3]),
  post_content: unq(r[4]),
  post_title: unq(r[5]),
  post_excerpt: unq(r[6]),
  post_status: unq(r[7]),
  post_name: unq(r[11]),
  post_modified_gmt: unq(r[15]),
  post_type: unq(r[20]),
}));

const importable = allPosts.filter(
  (p) => p.post_type === "post" && (p.post_status === "publish" || p.post_status === "draft"),
);
console.log(`Importable posts: ${importable.length} (publish + draft)`);

const pmRaw = parseTuples(extractInsertBlock("wp_postmeta"));
const viewsByPostId = new Map();
for (const r of pmRaw) {
  const post_id = Number(r[1]);
  const meta_key = unq(r[2]);
  const meta_value = unq(r[3]);
  if (meta_key === "views") {
    const v = Number(meta_value);
    if (Number.isFinite(v)) viewsByPostId.set(post_id, v);
  }
}

// ---------- HTML preprocess + Turndown -------------------------------------

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*",
  fence: "```",
  hr: "---",
  linkStyle: "inlined",
});
turndown.use(turndownPluginGfm.gfm);

// Preserve language hints on <pre><code class="language-xxx">
turndown.addRule("fenced-code-with-lang", {
  filter(node) {
    return (
      node.nodeName === "PRE" &&
      node.firstChild &&
      node.firstChild.nodeName === "CODE"
    );
  },
  replacement(_content, node) {
    const code = node.firstChild;
    const className = code.getAttribute("class") || "";
    const langMatch = className.match(/language-([\w+-]+)/i);
    const lang = langMatch ? langMatch[1] : code.getAttribute("lang") || "";
    const text = code.textContent || "";
    return `\n\n\`\`\`${lang}\n${text.replace(/\n$/, "")}\n\`\`\`\n\n`;
  },
});

// WP figure with image: keep just the inner image (turndown handles <img>).
turndown.addRule("wp-figure-image", {
  filter: (node) =>
    node.nodeName === "FIGURE" && node.querySelector && node.querySelector("img"),
  replacement(_content, node) {
    const img = node.querySelector("img");
    const src = img.getAttribute("src") || "";
    const alt = (img.getAttribute("alt") || "").replace(/[\[\]]/g, "");
    const figcap = node.querySelector("figcaption");
    const cap = figcap ? figcap.textContent.trim() : "";
    let md = `\n\n![${alt}](${src})\n`;
    if (cap) md += `*${cap}*\n`;
    return md + "\n";
  },
});

// Strip empty wp-block divs by treating them as their inner content.

function preprocessHtml(html) {
  // Remove all Gutenberg block comments.
  html = html.replace(/<!--\s*\/?wp:[^>]*?-->/g, "");
  // Remove inline color/font styles that are pure noise.
  html = html.replace(/\s*style="[^"]*color:\s*rgb\([^)]*\)[^"]*"/gi, "");
  html = html.replace(/\s*style="[^"]*font-(family|size|weight)[^"]*"/gi, "");
  // Strip class names that turndown won't use anyway, to keep regex below simpler.
  // (Don't strip class on <code>, we read language- from there.)
  return html;
}

function htmlToMarkdown(html) {
  const pre = preprocessHtml(html);
  return turndown.turndown(pre).trim();
}

// ---------- Image URL rewriting --------------------------------------------

// Match the various forms WP can produce for upload URLs.
const UPLOAD_PATH_RE = /\/wp-content\/uploads\/([^\s\)\]"'<>]+)/g;
const referencedImages = new Set();

function rewriteUploadUrls(md) {
  return md.replace(
    /(https?:)?\/\/frendguo\.com\/wp-content\/uploads\/([^\s\)\]"'<>]+)/g,
    (_m, _proto, key) => {
      referencedImages.add(key);
      return `${MEDIA_BASE}/${key}`;
    },
  ).replace(
    // also catch root-relative
    /(?<![:\w])\/wp-content\/uploads\/([^\s\)\]"'<>]+)/g,
    (_m, key) => {
      referencedImages.add(key);
      return `${MEDIA_BASE}/${key}`;
    },
  );
}

// ---------- Word count + readTime + excerpt --------------------------------

function analyze(body) {
  const cjk = (body.match(/[一-鿿　-〿]/g) || []).length;
  const latin = body
    .replace(/[一-鿿　-〿]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const words = cjk + latin;
  const readTime = Math.max(1, Math.round(words / 280));
  return { words, readTime };
}

function deriveExcerpt(wpExcerpt, markdown) {
  const fromWp = (wpExcerpt || "").replace(/<[^>]+>/g, "").trim();
  if (fromWp) return fromWp.slice(0, 200);
  // Strip markdown markers crudely.
  const plain = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^\)]*\)/g, "$1")
    .replace(/[#>*`_~|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, 160);
}

// ---------- SQL emit -------------------------------------------------------

function sqlStr(s) {
  if (s == null) return "NULL";
  return `'${String(s).replace(/'/g, "''")}'`;
}

function tsFromGmt(gmt) {
  if (!gmt || gmt.startsWith("0000")) return null;
  const t = Date.parse(gmt + "Z"); // mark as UTC
  if (Number.isNaN(t)) return null;
  return Math.floor(t / 1000);
}

const records = [];
for (const p of importable) {
  const markdownRaw = htmlToMarkdown(p.post_content || "");
  const markdown = rewriteUploadUrls(markdownRaw);
  const { words, readTime } = analyze(markdown);
  const excerpt = deriveExcerpt(p.post_excerpt, markdown);
  const status = p.post_status === "publish" ? "published" : "draft";
  const publishedAt = status === "published" ? tsFromGmt(p.post_date_gmt) : null;
  const updatedAt =
    tsFromGmt(p.post_modified_gmt) ?? tsFromGmt(p.post_date_gmt) ?? Math.floor(Date.now() / 1000);
  const createdAt = tsFromGmt(p.post_date_gmt) ?? updatedAt;
  const views = viewsByPostId.get(p.ID) ?? 0;
  // post_name (slug) may be empty for drafts; fall back to wp-id-N
  const slug = (p.post_name || `wp-${p.ID}`).trim();

  records.push({
    slug,
    title: p.post_title || "(untitled)",
    excerpt,
    body: markdown,
    tagId: TAG_ID,
    status,
    pinned: 0,
    words,
    readTime,
    views,
    publishedAt,
    createdAt,
    updatedAt,
  });
}

// Detect slug collisions
const seen = new Set();
const dupes = [];
for (const r of records) {
  if (seen.has(r.slug)) dupes.push(r.slug);
  seen.add(r.slug);
}
if (dupes.length) {
  console.warn(`! slug collisions: ${dupes.join(", ")}`);
}

let out = `-- Auto-generated by scripts/import-wp.mjs — do not edit by hand.
-- Apply via:  pnpm wrangler d1 execute starblog-db --local --file=./drizzle/imports/wp.sql

`;
for (const r of records) {
  out +=
    `INSERT INTO posts (slug, title, excerpt, body, tag_id, series, status, pinned, words, read_time, views, published_at, created_at, updated_at) VALUES (` +
    [
      sqlStr(r.slug),
      sqlStr(r.title),
      sqlStr(r.excerpt),
      sqlStr(r.body),
      sqlStr(r.tagId),
      "NULL",
      sqlStr(r.status),
      String(r.pinned),
      String(r.words),
      String(r.readTime),
      String(r.views),
      r.publishedAt == null ? "NULL" : String(r.publishedAt),
      String(r.createdAt),
      String(r.updatedAt),
    ].join(", ") +
    `);\n`;
}

const outDir = join(repoRoot, "drizzle", "imports");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "wp.sql"), out, "utf8");
writeFileSync(
  join(outDir, "wp-redirects.json"),
  JSON.stringify(
    records.filter((r) => r.status === "published").map((r) => r.slug),
    null,
    2,
  ),
  "utf8",
);
writeFileSync(
  join(outDir, "wp-images.json"),
  JSON.stringify([...referencedImages].sort(), null, 2),
  "utf8",
);

console.log(`✓ Wrote ${join(outDir, "wp.sql")} (${out.length} bytes, ${records.length} posts)`);
console.log(`✓ Wrote ${join(outDir, "wp-redirects.json")} (${records.filter((r) => r.status === "published").length} slugs)`);
console.log(`✓ Wrote ${join(outDir, "wp-images.json")} (${referencedImages.size} image keys referenced)`);

const totalChars = records.reduce((a, r) => a + r.body.length, 0);
console.log(`\nSummary: ${records.length} posts, total markdown ${totalChars} chars (avg ${Math.round(totalChars / records.length)})`);
console.log(`  published: ${records.filter((r) => r.status === "published").length}`);
console.log(`  draft:     ${records.filter((r) => r.status === "draft").length}`);
