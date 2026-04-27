"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDbAsync } from "@/db";
import { comments, posts } from "@/db/schema";

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

interface AddCommentInput {
  postId: number;
  author: string;
  email?: string;
  content: string;
  // Honeypot — real visitors leave it empty.
  website?: string;
}

export async function addComment(
  input: AddCommentInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.website && input.website.trim() !== "") {
    // Bot. Pretend it succeeded so they don't retry.
    return { ok: true };
  }
  const author = input.author.trim();
  const content = input.content.trim();
  if (author.length < 1 || author.length > 60) {
    return { ok: false, error: "昵称需要 1~60 个字符" };
  }
  if (content.length < 2 || content.length > 1500) {
    return { ok: false, error: "评论内容需要 2~1500 个字符" };
  }

  const db = await getDbAsync();
  const [post] = await db
    .select({ id: posts.id, slug: posts.slug, status: posts.status })
    .from(posts)
    .where(eq(posts.id, input.postId))
    .limit(1);
  if (!post || post.status !== "published") {
    return { ok: false, error: "文章不存在或未发布" };
  }

  await db.insert(comments).values({
    postId: post.id,
    author,
    email: input.email?.trim() || null,
    content,
    status: "pending",
  });

  revalidatePath("/admin/comments");
  revalidatePath(`/writing/${post.slug}`);
  return { ok: true };
}
