import { getAllTags } from "@/lib/posts";
import { TagsClient } from "./TagsClient";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await getAllTags();
  return <TagsClient initialTags={tags} />;
}
