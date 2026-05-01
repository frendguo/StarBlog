import { expect, test } from "@playwright/test";
import { e2eSlug, E2E_TITLE_PREFIX, STORAGE_STATE_PATH } from "../fixtures/test-data";

test.use({ storageState: STORAGE_STATE_PATH });

test.describe("admin post CRUD @P0", () => {
  test("create draft, edit, publish, see on public, delete, 404", async ({
    page,
  }) => {
    const slug = e2eSlug("crud");
    const title = `${E2E_TITLE_PREFIX}CRUD smoke ${slug}`;
    const excerpt = "e2e excerpt for crud smoke";
    const bodyMarker = `e2e-body-${Date.now()}`;

    // 1. Open new post page and fill the form.
    await page.goto("/admin/posts/new");
    await page.locator("input[placeholder*='文章标题']").fill(title);
    await page.locator("input[placeholder*='摘要']").fill(excerpt);
    await page.locator("input[placeholder='my-post-slug']").fill(slug);
    await page
      .locator("#body-textarea")
      .fill(`## ${bodyMarker}\n\n这是 e2e 创建的正文。\n`);

    // 2. Save as draft → router.replace(`/admin/posts/${id}`)
    await page.getByRole("button", { name: "存为草稿" }).click();
    await page.waitForURL(/\/admin\/posts\/\d+/, { timeout: 10_000 });
    const editUrl = page.url();
    const postId = editUrl.match(/\/admin\/posts\/(\d+)/)?.[1];
    expect(postId).toBeTruthy();

    // 3. Publish.
    await page.getByRole("button", { name: /^(发布|更新)/ }).click();
    await expect(page.locator("body")).toContainText(/已保存/, { timeout: 5_000 });

    // 4. Public detail should now render.
    await page.goto(`/writing/${slug}`);
    await expect(page.locator("h1.article-title")).toHaveText(title);
    await expect(page.locator(".prose")).toContainText(bodyMarker);

    // 5. Go back to the edit page directly via id.
    await page.goto(`/admin/posts/${postId}`);
    await expect(page.locator("input[placeholder='my-post-slug']")).toHaveValue(slug);

    // 6. Delete — accept the confirm() dialog.
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "删除这篇文章" }).click();
    await page.waitForURL(/\/admin\/posts(\?|$)/, { timeout: 10_000 });

    // 7. Public detail should now 404.
    const r = await page.request.get(`/writing/${slug}`);
    expect(r.status()).toBe(404);
  });
});
