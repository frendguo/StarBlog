"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDbAsync } from "@/db";
import { posts } from "@/db/schema";
import { analyzeBody } from "@/lib/format";

interface SavePostInput {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tagId: string;
  series: string | null;
  status: "draft" | "published" | "scheduled";
  pinned: boolean;
  scheduledAt: Date | null;
}

export async function savePost(input: SavePostInput) {
  const { words, readTime } = analyzeBody(input.body);
  const db = await getDbAsync();
  const now = new Date();

  if (input.id) {
    await db
      .update(posts)
      .set({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        body: input.body,
        tagId: input.tagId,
        series: input.series,
        status: input.status,
        pinned: input.pinned,
        words,
        readTime,
        publishedAt:
          input.status === "published"
            ? now
            : input.status === "scheduled"
              ? input.scheduledAt
              : null,
        scheduledAt: input.status === "scheduled" ? input.scheduledAt : null,
        updatedAt: now,
      })
      .where(eq(posts.id, input.id));
    revalidatePath("/");
    revalidatePath("/writing");
    revalidatePath(`/writing/${input.slug}`);
    revalidatePath("/admin/posts");
    revalidatePath(`/admin/posts/${input.id}`);
    return { ok: true, id: input.id };
  }

  const [inserted] = await db
    .insert(posts)
    .values({
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      tagId: input.tagId,
      series: input.series,
      status: input.status,
      pinned: input.pinned,
      words,
      readTime,
      publishedAt:
        input.status === "published"
          ? now
          : input.status === "scheduled"
            ? input.scheduledAt
            : null,
      scheduledAt: input.status === "scheduled" ? input.scheduledAt : null,
    })
    .returning({ id: posts.id });
  revalidatePath("/");
  revalidatePath("/writing");
  revalidatePath("/admin/posts");
  return { ok: true, id: inserted!.id };
}

export async function deletePost(id: number) {
  const db = await getDbAsync();
  const [row] = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/");
  revalidatePath("/writing");
  if (row?.slug) revalidatePath(`/writing/${row.slug}`);
  revalidatePath("/admin/posts");
}

export async function setPinned(id: number, pinned: boolean) {
  const db = await getDbAsync();
  if (pinned) {
    await db.update(posts).set({ pinned: false });
  }
  await db.update(posts).set({ pinned, updatedAt: new Date() }).where(eq(posts.id, id));
  revalidatePath("/");
  revalidatePath("/admin/posts");
}

export async function quickPublish(id: number) {
  const db = await getDbAsync();
  await db
    .update(posts)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(posts.id, id));
  revalidatePath("/");
  revalidatePath("/writing");
  revalidatePath("/admin/posts");
}

export async function createDraftAndEdit() {
  const db = await getDbAsync();
  const slug = `draft-${Math.random().toString(36).slice(2, 8)}`;
  const [inserted] = await db
    .insert(posts)
    .values({
      slug,
      title: "未命名草稿",
      excerpt: "",
      body: "## 引子\n\n开始写吧。",
      tagId: "note",
      status: "draft",
      pinned: false,
    })
    .returning({ id: posts.id });
  redirect(`/admin/posts/${inserted!.id}`);
}
