"use client";

import { useState, useTransition } from "react";
import { addComment } from "@/app/actions/comments";
import { fmtDate } from "@/lib/format";

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: Date;
}

interface Props {
  postId: number;
  initialComments: Comment[];
}

export function CommentSection({ postId, initialComments }: Props) {
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const r = await addComment({
        postId,
        author,
        email: email || undefined,
        content,
        website,
      });
      if (r.ok) {
        setMsg({
          kind: "ok",
          text: "已收到，等管理员审核通过后会显示。",
        });
        setAuthor("");
        setEmail("");
        setContent("");
      } else {
        setMsg({ kind: "err", text: r.error });
      }
    });
  };

  return (
    <section
      style={{
        marginTop: 64,
        paddingTop: 32,
        borderTop: "1px solid var(--rule)",
      }}
    >
      <div className="section-label">
        <span>❝</span> Comments · {initialComments.length}
      </div>

      {initialComments.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            color: "var(--ink-4)",
            marginBottom: 24,
          }}
        >
          还没有评论。下面留下第一条吧。
        </p>
      ) : (
        <div style={{ marginBottom: 32 }}>
          {initialComments.map((c) => (
            <article
              key={c.id}
              style={{
                padding: "16px 0",
                borderBottom: "1px dashed var(--rule)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "baseline",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.7813rem",
                    color: "var(--ink-2)",
                    fontWeight: 600,
                  }}
                >
                  {c.author}
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.6875rem",
                    color: "var(--ink-4)",
                  }}
                >
                  {fmtDate(c.createdAt)}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  color: "var(--ink-2)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {c.content}
              </p>
            </article>
          ))}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        style={{
          background: "var(--bg-tint-3)",
          padding: 20,
          borderRadius: 12,
          border: "1px solid var(--rule)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.6875rem",
            color: "var(--ink-4)",
            letterSpacing: "0.1em",
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          ＋ 留个评论
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <input
            className="input"
            placeholder="昵称 *"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={60}
            required
            disabled={pending}
          />
          <input
            className="input"
            type="email"
            placeholder="邮箱（可选，不会公开）"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
        </div>
        <textarea
          className="input"
          placeholder="说点什么…（支持纯文本）"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1500}
          required
          disabled={pending}
          style={{
            width: "100%",
            fontFamily: "var(--serif)",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            resize: "vertical",
            marginBottom: 10,
          }}
        />
        {/* Honeypot — kept out of normal layout. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{
            position: "absolute",
            left: "-10000px",
            width: 1,
            height: 1,
            opacity: 0,
          }}
          aria-hidden="true"
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            type="submit"
            className="btn btn-primary"
            disabled={pending}
            style={{ fontSize: "0.8125rem" }}
          >
            {pending ? "提交中…" : "提交 →"}
          </button>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.6875rem",
              color:
                msg?.kind === "err"
                  ? "#DC2626"
                  : msg?.kind === "ok"
                    ? "var(--accent-3)"
                    : "var(--ink-4)",
            }}
          >
            {msg?.text ?? "提交后由管理员审核 · 通常 24h 内显示"}
          </span>
        </div>
      </form>
    </section>
  );
}
