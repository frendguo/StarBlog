import { and, desc, eq, sql } from "drizzle-orm";
import { cache } from "react";
import { getDbAsync } from "@/db";
import { posts, projects, tags } from "@/db/schema";

export interface PostRow {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tagId: string;
  tagLabel: string;
  tagHint: string;
  series: string | null;
  status: string;
  pinned: boolean;
  words: number;
  readTime: number;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagRow {
  id: string;
  label: string;
  hint: string;
  color: string;
  sort: number;
  count: number;
}

interface QueryOptions {
  status?: "published" | "draft" | "scheduled" | "any";
  tagId?: string;
  limit?: number;
}

function rowToPost(r: {
  posts: typeof posts.$inferSelect;
  tags: typeof tags.$inferSelect;
}): PostRow {
  return {
    id: r.posts.id,
    slug: r.posts.slug,
    title: r.posts.title,
    excerpt: r.posts.excerpt,
    body: r.posts.body,
    tagId: r.posts.tagId,
    tagLabel: r.tags.label,
    tagHint: r.tags.hint,
    series: r.posts.series,
    status: r.posts.status,
    pinned: r.posts.pinned,
    words: r.posts.words,
    readTime: r.posts.readTime,
    publishedAt: r.posts.publishedAt,
    scheduledAt: r.posts.scheduledAt,
    createdAt: r.posts.createdAt,
    updatedAt: r.posts.updatedAt,
  };
}

export const getAllPosts = cache(async (opts: QueryOptions = {}): Promise<PostRow[]> => {
  const db = await getDbAsync();
  const where =
    opts.status && opts.status !== "any"
      ? eq(posts.status, opts.status)
      : undefined;
  const tagFilter = opts.tagId ? eq(posts.tagId, opts.tagId) : undefined;

  const rows = await db
    .select({ posts, tags })
    .from(posts)
    .innerJoin(tags, eq(posts.tagId, tags.id))
    .where(and(where, tagFilter))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
    .limit(opts.limit ?? 1000);

  return rows.map(rowToPost);
});

export const getPostBySlug = cache(async (slug: string): Promise<PostRow | null> => {
  const db = await getDbAsync();
  const rows = await db
    .select({ posts, tags })
    .from(posts)
    .innerJoin(tags, eq(posts.tagId, tags.id))
    .where(eq(posts.slug, slug))
    .limit(1);
  return rows[0] ? rowToPost(rows[0]) : null;
});

export const getAllTags = cache(async (): Promise<TagRow[]> => {
  const db = await getDbAsync();
  const rows = await db
    .select({
      id: tags.id,
      label: tags.label,
      hint: tags.hint,
      color: tags.color,
      sort: tags.sort,
      count: sql<number>`COUNT(${posts.id})`,
    })
    .from(tags)
    .leftJoin(
      posts,
      and(eq(posts.tagId, tags.id), eq(posts.status, "published"))
    )
    .groupBy(tags.id)
    .orderBy(tags.sort);
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    hint: r.hint,
    color: r.color,
    sort: r.sort,
    count: Number(r.count) || 0,
  }));
});

export const getAllProjects = cache(async () => {
  const db = await getDbAsync();
  return db.select().from(projects).orderBy(projects.sort);
});

export const getStats = cache(async () => {
  const all = await getAllPosts({ status: "published" });
  const totalWords = all.reduce((s, p) => s + p.words, 0);
  return {
    posts: all.length,
    words: totalWords,
  };
});
