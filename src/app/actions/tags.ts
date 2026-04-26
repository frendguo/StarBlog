"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDbAsync } from "@/db";
import { posts, tags } from "@/db/schema";

export async function upsertTag(input: {
  id: string;
  label: string;
  hint: string;
  color: string;
  sort: number;
}) {
  const db = await getDbAsync();
  const trimmedId = input.id.trim().toLowerCase();
  if (!/^[a-z0-9-]{1,32}$/.test(trimmedId)) {
    return { ok: false, error: "tag id 只能包含小写字母、数字、短横线" };
  }
  await db
    .insert(tags)
    .values({
      id: trimmedId,
      label: input.label.trim(),
      hint: input.hint.trim(),
      color: input.color || "note",
      sort: input.sort || 0,
    })
    .onConflictDoUpdate({
      target: tags.id,
      set: {
        label: input.label.trim(),
        hint: input.hint.trim(),
        color: input.color || "note",
        sort: input.sort || 0,
      },
    });
  revalidatePath("/");
  revalidatePath("/writing");
  revalidatePath("/admin/tags");
  return { ok: true };
}

export async function deleteTag(id: string) {
  const db = await getDbAsync();
  const [used] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.tagId, id))
    .limit(1);
  if (used) {
    return { ok: false, error: "还有文章使用该标签，请先迁移文章再删除" };
  }
  await db.delete(tags).where(eq(tags.id, id));
  revalidatePath("/admin/tags");
  return { ok: true };
}
