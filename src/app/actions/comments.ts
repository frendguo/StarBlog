"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDbAsync } from "@/db";
import { comments } from "@/db/schema";

export async function setCommentStatus(
  id: number,
  status: "approved" | "blocked" | "pending"
) {
  const db = await getDbAsync();
  await db.update(comments).set({ status }).where(eq(comments.id, id));
  revalidatePath("/admin/comments");
}

export async function deleteComment(id: number) {
  const db = await getDbAsync();
  await db.delete(comments).where(eq(comments.id, id));
  revalidatePath("/admin/comments");
}
