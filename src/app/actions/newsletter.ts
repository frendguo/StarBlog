"use server";

import { getDbAsync } from "@/db";
import { subscribers } from "@/db/schema";

export async function subscribe(
  email: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: "邮箱格式不对" };
  }
  try {
    const db = await getDbAsync();
    await db
      .insert(subscribers)
      .values({ email: trimmed })
      .onConflictDoNothing();
    return { ok: true };
  } catch {
    return { ok: false, error: "订阅失败，请稍后再试" };
  }
}
