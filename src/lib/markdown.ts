import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSlug)
  .use(rehypeStringify);

export async function renderMarkdown(body: string): Promise<string> {
  const file = await processor.process(body);
  return String(file);
}

export interface TocItem {
  id: string;
  label: string;
  depth: number;
}

/**
 * Extract H2/H3 headings into a flat TOC, mirroring rehype-slug's slug logic.
 */
export function extractToc(body: string): TocItem[] {
  const items: TocItem[] = [];
  const used = new Set<string>();
  const re = /^(#{2,3})\s+(.+?)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const depth = m[1].length;
    const label = m[2].replace(/\s*\{#[^}]+\}\s*$/, "").trim();
    let id = label
      .toLowerCase()
      .replace(/[^a-z0-9一-龥]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!id) id = `heading-${items.length}`;
    let unique = id;
    let n = 1;
    while (used.has(unique)) {
      unique = `${id}-${n++}`;
    }
    used.add(unique);
    items.push({ id: unique, label, depth });
  }
  return items;
}
