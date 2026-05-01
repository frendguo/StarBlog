import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import type { HighlighterCore } from "@shikijs/types";
import type { Element, ElementContent, Root } from "hast";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { Processor } from "unified";
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
        const props = (img.properties ??= {});
        const cls = Array.isArray(props.className) ? [...props.className] : [];
        if (!cls.includes("prose-img-zoomable")) cls.push("prose-img-zoomable");
        props.className = cls;
        if (alt && !props.title) props.title = alt;
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

function rehypeCodeChrome() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return;
      if (
        parent.type === "element" &&
        (parent as Element).tagName === "figure" &&
        Array.isArray((parent as Element).properties?.className) &&
        ((parent as Element).properties!.className as string[]).includes("code-block")
      ) return;

      let lang = "";
      const dl = node.properties?.dataLanguage;
      if (typeof dl === "string") lang = dl;
      if (!lang) {
        const code = node.children.find(
          (c): c is Element => c.type === "element" && c.tagName === "code"
        );
        const cls = code?.properties?.className;
        if (Array.isArray(cls)) {
          const found = cls.find(
            (c): c is string => typeof c === "string" && c.startsWith("language-")
          );
          if (found) lang = found.slice("language-".length);
        }
      }
      if (!lang || lang === "plaintext") lang = "text";

      const head: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-block-head"] },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { className: ["code-block-lang"] },
            children: [{ type: "text", value: lang }],
          },
          {
            type: "element",
            tagName: "button",
            properties: {
              type: "button",
              className: ["code-block-copy"],
              "data-copy-code": "",
              "aria-label": "Copy code",
            },
            children: [{ type: "text", value: "Copy" }],
          },
        ],
      };
      const figure: Element = {
        type: "element",
        tagName: "figure",
        properties: { className: ["code-block"] },
        children: [head, node],
      };
      parent.children[index] = figure;
    });
  };
}

// 用 shiki/core + 显式 langs 列表，避开 rehype-pretty-code 顶层 import 'shiki' 拉
// bundle-full 把 ~200 种语言全打包进 Worker（实测会让 handler.mjs 涨到 13MB+）。
// JS regex engine 替代 oniguruma wasm 再省 ~250KB；如某语言 grammar 不兼容，再换回 wasm。
let highlighter: HighlighterCore | null = null;
let processor: Processor<Root, Root, Root, Root, string> | null = null;

async function getProcessor() {
  if (processor) return processor;
  if (!highlighter) {
    highlighter = await createHighlighterCore({
      themes: [
        import("shiki/themes/github-light.mjs"),
        import("shiki/themes/github-dark-dimmed.mjs"),
      ],
      langs: [
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/javascript.mjs"),
        import("shiki/langs/tsx.mjs"),
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/powershell.mjs"),
        import("shiki/langs/json.mjs"),
        import("shiki/langs/yaml.mjs"),
        import("shiki/langs/sql.mjs"),
        import("shiki/langs/python.mjs"),
        import("shiki/langs/cpp.mjs"),
        import("shiki/langs/csharp.mjs"),
        import("shiki/langs/rust.mjs"),
        import("shiki/langs/go.mjs"),
        import("shiki/langs/html.mjs"),
        import("shiki/langs/css.mjs"),
        import("shiki/langs/markdown.mjs"),
      ],
      engine: createJavaScriptRegexEngine(),
    });
  }
  processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeFigure)
    .use(rehypeShikiFromHighlighter, highlighter as Parameters<typeof rehypeShikiFromHighlighter>[0], {
      themes: { light: "github-light", dark: "github-dark-dimmed" },
      defaultLanguage: "plaintext",
      fallbackLanguage: "plaintext",
    })
    .use(rehypeCodeChrome)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      test: ["h2", "h3", "h4"],
      properties: { className: ["heading-anchor"], ariaLabel: "Anchor link" },
      content: { type: "text", value: "#" },
    })
    .use(rehypeStringify) as unknown as Processor<Root, Root, Root, Root, string>;
  return processor;
}

export async function renderMarkdown(body: string): Promise<string> {
  const p = await getProcessor();
  const file = await p.process(body);
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
