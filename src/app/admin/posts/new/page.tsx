import { getDbAsync } from "@/db";
import { tags } from "@/db/schema";
import { PostEditor } from "../../_components/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const db = await getDbAsync();
  const allTags = await db.select().from(tags).orderBy(tags.sort);

  return (
    <PostEditor
      mode="new"
      tags={allTags.map((t) => ({ id: t.id, label: t.label }))}
      initial={{
        slug: "",
        title: "",
        excerpt: "",
        body: "## 引子\n\n这里是文章正文。\n\n",
        tagId: allTags[0]?.id ?? "note",
        series: "",
        status: "draft",
        pinned: false,
        scheduledAt: "",
      }}
    />
  );
}
