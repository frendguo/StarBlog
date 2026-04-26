"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTag, upsertTag } from "@/app/actions/tags";
import type { TagRow } from "@/lib/posts";

const COLORS = [
  { id: "cpp", label: "C++ 紫" },
  { id: "win", label: "Windows 蓝" },
  { id: "ai", label: "AI 粉" },
  { id: "note", label: "随笔 黄" },
  { id: "tool", label: "工具 绿" },
];

interface TagFormValue {
  id: string;
  label: string;
  hint: string;
  color: string;
  sort: number;
}

export function TagsClient({ initialTags }: { initialTags: TagRow[] }) {
  const router = useRouter();
  const [tags] = useState(initialTags);
  const [draft, setDraft] = useState<TagFormValue>({
    id: "",
    label: "",
    hint: "",
    color: "note",
    sort: tags.length + 1,
  });
  const [editing, setEditing] = useState<TagFormValue | null>(null);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const onCreate = () => {
    setErr(null);
    start(async () => {
      const r = await upsertTag(draft);
      if (!r.ok) setErr(r.error ?? "创建失败");
      else {
        setDraft({
          id: "",
          label: "",
          hint: "",
          color: "note",
          sort: tags.length + 1,
        });
        router.refresh();
      }
    });
  };

  const onUpdate = (t: TagFormValue) => {
    setErr(null);
    start(async () => {
      const r = await upsertTag(t);
      if (!r.ok) setErr(r.error ?? "保存失败");
      else {
        setEditing(null);
        router.refresh();
      }
    });
  };

  const onDelete = (id: string) => {
    if (!confirm(`删除标签 #${id}？`)) return;
    setErr(null);
    start(async () => {
      const r = await deleteTag(id);
      if (!r.ok) setErr(r.error ?? "删除失败");
      else router.refresh();
    });
  };

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--ink-4)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Tags
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            标签 · {tags.length}
          </div>
        </div>
      </div>

      <div className="admin-content">
        {err && (
          <div
            style={{
              marginBottom: 16,
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(220, 38, 38, .08)",
              border: "1px solid rgba(220, 38, 38, .25)",
              color: "#DC2626",
              fontFamily: "var(--mono)",
              fontSize: 12,
            }}
          >
            {err}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
            marginBottom: 32,
          }}
        >
          {tags.map((t) =>
            editing && editing.id === t.id ? (
              <TagForm
                key={t.id}
                value={editing}
                onChange={(v) => setEditing(v)}
                onCancel={() => setEditing(null)}
                onSave={() => onUpdate(editing)}
                pending={pending}
                editing
              />
            ) : (
              <div key={t.id} className="card" style={{ padding: 18 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span className={`tag ${t.color}`} style={{ fontSize: 13 }}>
                    #{t.label}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      color: "var(--ink-4)",
                    }}
                  >
                    {t.count} {t.count === 1 ? "post" : "posts"}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 13.5,
                    color: "var(--ink-3)",
                    lineHeight: 1.5,
                    marginBottom: 12,
                  }}
                >
                  {t.hint || <em style={{ color: "var(--ink-4)" }}>(无简介)</em>}
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: 11, padding: "4px 10px" }}
                    onClick={() =>
                      setEditing({
                        id: t.id,
                        label: t.label,
                        hint: t.hint,
                        color: t.color,
                        sort: t.sort,
                      })
                    }
                  >
                    ✎ 编辑
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      fontSize: 11,
                      padding: "4px 10px",
                      color: "#DC2626",
                      borderColor: "rgba(220,38,38,.3)",
                    }}
                    onClick={() => onDelete(t.id)}
                    disabled={pending || t.count > 0}
                  >
                    删除
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        <div className="section-label">
          <span>＋</span> 新建标签
        </div>
        <TagForm
          value={draft}
          onChange={(v) => setDraft(v)}
          onSave={onCreate}
          pending={pending}
        />
      </div>
    </>
  );
}

interface TagFormProps {
  value: TagFormValue;
  onChange: (v: TagFormValue) => void;
  onSave: () => void;
  onCancel?: () => void;
  pending: boolean;
  editing?: boolean;
}

function TagForm({ value, onChange, onSave, onCancel, pending, editing }: TagFormProps) {
  return (
    <div
      className="card"
      style={{ padding: 18, display: "grid", gap: 10 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input
          className="input mono"
          placeholder="id (cpp / win / ai)"
          value={value.id}
          onChange={(e) => onChange({ ...value, id: e.target.value })}
          disabled={!!editing}
        />
        <input
          className="input"
          placeholder="显示名（C++ / Windows）"
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
        />
      </div>
      <input
        className="input"
        placeholder="一句话简介"
        value={value.hint}
        onChange={(e) => onChange({ ...value, hint: e.target.value })}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 10 }}>
        <select
          className="input"
          value={value.color}
          onChange={(e) => onChange({ ...value, color: e.target.value })}
        >
          {COLORS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          className="input mono"
          type="number"
          placeholder="sort"
          value={value.sort}
          onChange={(e) =>
            onChange({ ...value, sort: Number(e.target.value) || 0 })
          }
        />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {onCancel && (
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            style={{ fontSize: 12 }}
          >
            取消
          </button>
        )}
        <span style={{ flex: 1 }} />
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSave}
          disabled={pending}
          style={{ fontSize: 12 }}
        >
          {editing ? "保存" : "创建"}
        </button>
      </div>
    </div>
  );
}
