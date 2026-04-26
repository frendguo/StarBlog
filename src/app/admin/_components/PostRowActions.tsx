"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deletePost, quickPublish, setPinned } from "@/app/actions/posts";

interface Props {
  id: number;
  slug: string;
  status: string;
  pinned: boolean;
}

export function PostRowActions({ id, slug, status, pinned }: Props) {
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
      <Link
        href={`/admin/posts/${id}`}
        className="btn"
        style={{ fontSize: 11, padding: "4px 8px" }}
      >
        ✎
      </Link>
      <Link
        href={`/writing/${slug}`}
        target="_blank"
        className="btn"
        style={{ fontSize: 11, padding: "4px 8px" }}
        title="预览"
      >
        ↗
      </Link>
      <button
        className="btn"
        style={{
          fontSize: 11,
          padding: "4px 8px",
          color: pinned ? "var(--accent)" : undefined,
          borderColor: pinned ? "var(--accent)" : undefined,
        }}
        onClick={() => start(() => setPinned(id, !pinned))}
        disabled={pending}
        title={pinned ? "取消置顶" : "置顶"}
      >
        ★
      </button>
      {status !== "published" && (
        <button
          className="btn"
          style={{ fontSize: 11, padding: "4px 8px" }}
          onClick={() => start(() => quickPublish(id))}
          disabled={pending}
          title="立即发布"
        >
          ▶
        </button>
      )}
      <button
        className="btn"
        style={{
          fontSize: 11,
          padding: "4px 8px",
          color: "#DC2626",
          borderColor: "rgba(220,38,38,.3)",
        }}
        onClick={() => {
          if (confirm("确定删除？此操作不可撤销")) {
            start(() => deletePost(id));
          }
        }}
        disabled={pending}
        title="删除"
      >
        🗑
      </button>
    </div>
  );
}
