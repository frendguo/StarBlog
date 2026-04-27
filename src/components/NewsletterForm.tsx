"use client";

import { useState, useTransition } from "react";
import { subscribe } from "@/app/actions/newsletter";

interface Props {
  subscriberCount: number;
}

export function NewsletterForm({ subscriberCount }: Props) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await subscribe(email);
      if (r.ok) {
        setMsg({ kind: "ok", text: "已订阅，谢谢！" });
        setEmail("");
      } else {
        setMsg({ kind: "err", text: r.error });
      }
    });
  };

  return (
    <form style={{ position: "relative" }} onSubmit={onSubmit}>
      <input
        className="input"
        type="email"
        required
        placeholder="you@domain.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          background: "rgba(255,255,255,.08)",
          border: "1px solid rgba(255,255,255,.15)",
          color: "#fff",
          marginBottom: 10,
        }}
      />
      <button
        type="submit"
        className="btn btn-accent"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={pending}
      >
        {pending ? "订阅中…" : "订阅 →"}
      </button>
      <p
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.625rem",
          color: msg?.kind === "err" ? "#FF8A5C" : "rgba(255,255,255,.5)",
          textAlign: "center",
          marginTop: 8,
        }}
      >
        {msg ? (
          msg.text
        ) : (
          <>
            已有 <span style={{ color: "var(--accent)" }}>{subscriberCount}</span> 位读者订阅
          </>
        )}
      </p>
    </form>
  );
}
