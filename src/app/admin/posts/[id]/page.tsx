import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDbAsync } from "@/db";
import { posts, tags } from "@/db/schema";
import { PostEditor } from "../../_components/PostEditor";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Params) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const db = await getDbAsync();
  const [post] = await db.select().from(posts).where(eq(posts.id, numericId)).limit(1);
  if (!post) notFound();
  const allTags = await db.select().from(tags).orderBy(tags.sort);

  return (
    <PostEditor
      mode="edit"
      tags={allTags.map((t) => ({ id: t.id, label: t.label }))}
      initial={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        tagId: post.tagId,
        series: post.series ?? "",
        status: post.status as "draft" | "published" | "scheduled",
        pinned: post.pinned,
        scheduledAt: post.scheduledAt
          ? post.scheduledAt.toISOString().slice(0, 16)
          : "",
      }}
    />
  );
}
