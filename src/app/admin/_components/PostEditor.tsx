"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { savePost, deletePost } from "@/app/actions/posts";
import { analyzeBody } from "@/lib/format";

interface TagItem {
  id: string;
  label: string;
}

interface InitialState {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tagId: string;
  series: string;
  status: "draft" | "published" | "scheduled";
  pinned: boolean;
  scheduledAt: string;
}

interface Props {
  mode: "new" | "edit";
  tags: TagItem[];
  initial: InitialState;
}

export function PostEditor({ tags, initial, mode }: Props) {
  const router = useRouter();
  const [state, setState] = useState<InitialState>(initial);
  const [pending, start] = useTransition();
  const [showPreview, setShowPreview] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const stats = useMemo(() => analyzeBody(state.body), [state.body]);

  const update = <K extends keyof InitialState>(key: K, val: InitialState[K]) => {
    setState((s) => ({ ...s, [key]: val }));
  };

  const onSave = (status?: "draft" | "published" | "scheduled") => {
    start(async () => {
      const finalStatus = status ?? state.status;
      const r = await savePost({
        id: state.id,
        slug: state.slug.trim(),
        title: state.title.trim(),
        excerpt: state.excerpt.trim(),
        body: state.body,
        tagId: state.tagId,
        series: state.series.trim() || null,
        status: finalStatus,
        pinned: state.pinned,
        scheduledAt:
          finalStatus === "scheduled" && state.scheduledAt
            ? new Date(state.scheduledAt)
            : null,
      });
      setSavedAt(new Date());
      if (r.ok && mode === "new") {
        router.replace(`/admin/posts/${r.id}`);
      } else {
        router.refresh();
      }
    });
  };

  const onDelete = () => {
    if (!state.id) return;
    if (!confirm("确定删除这篇文章？此操作不可撤销")) return;
    start(async () => {
      await deletePost(state.id!);
      router.push("/admin/posts");
    });
  };

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.6875rem",
              color: "var(--ink-4)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {mode === "new" ? "New post" : `Editing #${state.id}`}
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.125rem",
              fontWeight: 500,
            }}
          >
            {state.title || "未命名"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {savedAt && (
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.6875rem",
                color: "var(--ink-4)",
              }}
            >
              ● 已保存 {savedAt.toLocaleTimeString()}
            </span>
          )}
          <button
            className="btn"
            type="button"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? "✎ 编辑" : "👁 预览"}
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => onSave("draft")}
            disabled={pending}
          >
            存为草稿
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => onSave("published")}
            disabled={pending}
          >
            {state.status === "published" ? "更新" : "发布"} →
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="editor-grid">
          <div className="editor-paper">
            <input
              className="input"
              style={{
                border: "none",
                fontFamily: "var(--serif)",
                fontSize: "2rem",
                fontWeight: 600,
                padding: "0 0 8px",
                marginBottom: 12,
                background: "transparent",
              }}
              placeholder="文章标题…"
              value={state.title}
              onChange={(e) => update("title", e.target.value)}
            />
            <input
              className="input"
              style={{
                border: "none",
                fontFamily: "var(--serif)",
                fontSize: "1rem",
                fontStyle: "italic",
                color: "var(--ink-3)",
                padding: "0 0 8px",
                marginBottom: 22,
                borderBottom: "1px solid var(--rule)",
                background: "transparent",
              }}
              placeholder="一句话摘要 — 会显示在列表和首页 featured 卡片"
              value={state.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
            />

            <div className="toolbar">
              <button
                type="button"
                onClick={() => insertWrap(state, setState, "**", "**", "粗体")}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertWrap(state, setState, "*", "*", "斜体")}
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertLine(state, setState, "## ")}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertLine(state, setState, "### ")}
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => insertLine(state, setState, "> ")}
              >
                ❝
              </button>
              <button
                type="button"
                onClick={() => insertLine(state, setState, "- ")}
              >
                •
              </button>
              <button
                type="button"
                onClick={() => insertWrap(state, setState, "`", "`", "代码")}
              >
                {"<>"}
              </button>
              <button
                type="button"
                onClick={() =>
                  insertWrap(state, setState, "\n```cpp\n", "\n```\n", "代码块")
                }
              >
                {"```"}
              </button>
              <button
                type="button"
                onClick={() =>
                  insertWrap(state, setState, "[", "](https://)", "链接")
                }
              >
                ⌬
              </button>
              <span style={{ flex: 1 }} />
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6875rem",
                  color: "var(--ink-4)",
                  alignSelf: "center",
                }}
              >
                {stats.words.toLocaleString()} words · ≈{stats.readTime} min
              </span>
            </div>

            {showPreview ? (
              <PreviewBody body={state.body} />
            ) : (
              <textarea
                id="body-textarea"
                className="input"
                style={{
                  width: "100%",
                  minHeight: 480,
                  fontFamily: "var(--mono)",
                  fontSize: "0.8438rem",
                  lineHeight: 1.7,
                  resize: "vertical",
                  whiteSpace: "pre-wrap",
                }}
                placeholder="开始用 Markdown 写吧…"
                value={state.body}
                onChange={(e) => update("body", e.target.value)}
              />
            )}
          </div>

          <div className="editor-side">
            <div className="card" style={{ padding: 18 }}>
              <div className="field-row">
                <label className="field-label">状态</label>
                <select
                  className="input"
                  value={state.status}
                  onChange={(e) =>
                    update(
                      "status",
                      e.target.value as InitialState["status"]
                    )
                  }
                >
                  <option value="draft">draft（草稿）</option>
                  <option value="published">published（已发布）</option>
                  <option value="scheduled">scheduled（计划中）</option>
                </select>
              </div>

              {state.status === "scheduled" && (
                <div className="field-row">
                  <label className="field-label">计划发布时间</label>
                  <input
                    className="input mono"
                    type="datetime-local"
                    value={state.scheduledAt}
                    onChange={(e) => update("scheduledAt", e.target.value)}
                  />
                </div>
              )}

              <div className="field-row">
                <label className="field-label">Slug</label>
                <input
                  className="input mono"
                  placeholder="my-post-slug"
                  value={state.slug}
                  onChange={(e) => update("slug", e.target.value)}
                />
              </div>

              <div className="field-row">
                <label className="field-label">主题标签</label>
                <select
                  className="input"
                  value={state.tagId}
                  onChange={(e) => update("tagId", e.target.value)}
                >
                  {tags.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-row">
                <label className="field-label">系列（可选）</label>
                <input
                  className="input"
                  placeholder="例如：Modern C++ / 调试日记"
                  value={state.series}
                  onChange={(e) => update("series", e.target.value)}
                />
              </div>

              <div className="field-row">
                <label
                  className="field-label"
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <input
                    type="checkbox"
                    checked={state.pinned}
                    onChange={(e) => update("pinned", e.target.checked)}
                  />
                  <span>置顶到首页 Featured</span>
                </label>
              </div>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div className="field-label">阅读指标</div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  color: "var(--ink-3)",
                  lineHeight: 1.8,
                }}
              >
                <div>≡ 字数：{stats.words.toLocaleString()}</div>
                <div>⌖ 阅读：≈{stats.readTime} min</div>
                {state.id && <div>ID：{state.id}</div>}
              </div>
            </div>

            {mode === "edit" && (
              <div className="card" style={{ padding: 18 }}>
                <div className="field-label" style={{ color: "#DC2626" }}>
                  Danger zone
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{
                    color: "#DC2626",
                    borderColor: "rgba(220,38,38,.3)",
                    width: "100%",
                    justifyContent: "center",
                  }}
                  onClick={onDelete}
                  disabled={pending}
                >
                  删除这篇文章
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function insertWrap(
  state: InitialState,
  setState: React.Dispatch<React.SetStateAction<InitialState>>,
  before: string,
  after: string,
  placeholder: string
) {
  const ta = document.getElementById("body-textarea") as HTMLTextAreaElement | null;
  if (!ta) {
    setState((s) => ({ ...s, body: s.body + before + placeholder + after }));
    return;
  }
  const start = ta.selectionStart ?? state.body.length;
  const end = ta.selectionEnd ?? state.body.length;
  const sel = state.body.slice(start, end) || placeholder;
  const next = state.body.slice(0, start) + before + sel + after + state.body.slice(end);
  setState((s) => ({ ...s, body: next }));
  requestAnimationFrame(() => {
    ta.focus();
    ta.setSelectionRange(start + before.length, start + before.length + sel.length);
  });
}

function insertLine(
  state: InitialState,
  setState: React.Dispatch<React.SetStateAction<InitialState>>,
  prefix: string
) {
  const ta = document.getElementById("body-textarea") as HTMLTextAreaElement | null;
  if (!ta) {
    setState((s) => ({ ...s, body: s.body + "\n" + prefix }));
    return;
  }
  const start = ta.selectionStart ?? 0;
  const lineStart = state.body.lastIndexOf("\n", start - 1) + 1;
  const next = state.body.slice(0, lineStart) + prefix + state.body.slice(lineStart);
  setState((s) => ({ ...s, body: next }));
  requestAnimationFrame(() => {
    ta.focus();
    ta.setSelectionRange(start + prefix.length, start + prefix.length);
  });
}

function PreviewBody({ body }: { body: string }) {
  const html = useMemo(() => renderClient(body), [body]);
  return (
    <div
      className="prose"
      style={{ minHeight: 480 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderClient(body: string): string {
  // Lightweight Markdown → HTML for editor preview only. Server-side rendering
  // (with shiki + GFM tables) is the canonical pipeline; this just gets close.
  return body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^> (.+)$/gm, "<blockquote><p>$1</p></blockquote>")
    .replace(/^\- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre><code class="lang-${lang}">${code}</code></pre>`)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .split(/\n{2,}/)
    .map((para) => (/^<(h\d|ul|pre|blockquote)/.test(para) ? para : `<p>${para}</p>`))
    .join("\n");
}
