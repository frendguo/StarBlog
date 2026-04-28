import type { Element, ElementContent, Root } from "hast";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

function rehypeFigure() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "p" || !parent || index === undefined) return;
      const meaningful = node.children.filter(
        (c) => !(c.type === "text" && /^\s*$/.test(c.value))
      );
      if (
        meaningful.length === 0 ||
        !meaningful.every(
          (c): c is Element => c.type === "element" && c.tagName === "img"
        )
      ) return;
      const figures: Element[] = meaningful.map((img) => {
        const altRaw = img.properties?.alt;
        const alt = typeof altRaw === "string" ? altRaw.trim() : "";
        const children: ElementContent[] = [img];
        if (alt) {
          children.push({
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: [{ type: "text", value: alt }],
          });
        }
        return { type: "element", tagName: "figure", properties: {}, children };
      });
      parent.children[index] =
        figures.length === 1
          ? figures[0]
          : {
              type: "element",
              tagName: "div",
              properties: { className: ["prose-figure-row"] },
              children: figures,
            };
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeFigure)
  .use(rehypePrettyCode, {
    theme: { light: "github-light", dark: "github-dark-dimmed" },
    keepBackground: true,
    defaultLang: "plaintext",
  })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: "append",
    test: ["h2", "h3", "h4"],
    properties: { className: ["heading-anchor"], ariaLabel: "Anchor link" },
    content: { type: "text", value: "#" },
  })
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
