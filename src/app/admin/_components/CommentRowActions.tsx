"use client";

import { useTransition } from "react";
import { deleteComment, setCommentStatus } from "@/app/actions/comments";

interface Props {
  id: number;
  status: string;
}

export function CommentRowActions({ id, status }: Props) {
  const [pending, start] = useTransition();
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        justifyContent: "flex-end",
        opacity: pending ? 0.5 : 1,
      }}
    >
      {status !== "approved" && (
        <button
          type="button"
          className="btn"
          style={{ fontSize: "0.6875rem", padding: "4px 8px", color: "#16A34A" }}
          onClick={() => start(() => setCommentStatus(id, "approved"))}
          disabled={pending}
        >
          ✓ 通过
        </button>
      )}
      {status !== "blocked" && (
        <button
          type="button"
          className="btn"
          style={{ fontSize: "0.6875rem", padding: "4px 8px" }}
          onClick={() => start(() => setCommentStatus(id, "blocked"))}
          disabled={pending}
        >
          ✕ 拦截
        </button>
      )}
      <button
        type="button"
        className="btn"
        style={{
          fontSize: "0.6875rem",
          padding: "4px 8px",
          color: "#DC2626",
          borderColor: "rgba(220,38,38,.3)",
        }}
        onClick={() => {
          if (confirm("删除这条评论？")) start(() => deleteComment(id));
        }}
        disabled={pending}
      >
        🗑
      </button>
    </div>
  );
}
