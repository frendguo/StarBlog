import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Tags / topics — fixed taxonomy with color tokens that map to CSS classes.
 */
export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  hint: text("hint").notNull().default(""),
  color: text("color").notNull().default("note"),
  sort: integer("sort").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Posts — primary blog content. Body is Markdown.
 */
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id),
  series: text("series"),
  status: text("status", { enum: ["draft", "published", "scheduled"] })
    .notNull()
    .default("draft"),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  words: integer("words").notNull().default(0),
  readTime: integer("read_time").notNull().default(0),
  views: integer("views").notNull().default(0),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Open-source projects displayed on /projects.
 */
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  language: text("language").notNull().default(""),
  stars: text("stars").notNull().default("—"),
  year: text("year").notNull().default(""),
  state: text("state", {
    enum: ["maintained", "wip", "paused", "live"],
  })
    .notNull()
    .default("maintained"),
  url: text("url"),
  sort: integer("sort").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Newsletter subscribers.
 */
export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  confirmedAt: integer("confirmed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Comments — moderated.
 */
export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  email: text("email"),
  content: text("content").notNull(),
  status: text("status", { enum: ["pending", "approved", "blocked"] })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Site-wide settings, stored as JSON values keyed by name.
 */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type Comment = typeof comments.$inferSelect;
