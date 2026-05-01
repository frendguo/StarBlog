import { expect, test } from "@playwright/test";
import { STORAGE_STATE_PATH } from "../fixtures/test-data";

test.use({ storageState: STORAGE_STATE_PATH });

test.describe("admin comments moderation @P2", () => {
  test("submit pending comment, approve in admin, see on public", async ({
    page,
  }) => {
    const authorTag = `[E2E] mod-${Date.now()}`;
    const contentTag = `[E2E] body-${Date.now()}`;
    const slug = "e2e-fixture-cpp";

    // 1. Submit a guest comment on a fixture article
    await page.goto(`/writing/${slug}`);
    await expect(page.locator("h1.article-title")).toBeVisible();

    const authorInput = page.getByPlaceholder("昵称 *");
    const contentTextarea = page.getByPlaceholder(/说点什么/);
    await authorInput.click();
    await authorInput.pressSequentially(authorTag, { delay: 5 });
    await contentTextarea.click();
    await contentTextarea.pressSequentially(contentTag, { delay: 5 });
    await page.getByRole("button", { name: /^提交\s*→/ }).click();
    await expect(page.locator("body")).toContainText(/已收到/, { timeout: 10_000 });

    // 2. Find the row in admin/comments and approve it
    await page.goto("/admin/comments");
    const row = page.locator("tr").filter({ hasText: authorTag });
    await expect(row).toBeVisible({ timeout: 5_000 });
    await expect(row.locator(".status-pill")).toContainText("pending");
    await row.getByRole("button", { name: /通过/ }).click();
    await expect(row.locator(".status-pill")).toContainText("approved", {
      timeout: 5_000,
    });

    // 3. Approved comment should now render on the public detail page
    await page.goto(`/writing/${slug}`);
    await expect(page.locator("body")).toContainText(contentTag, {
      timeout: 5_000,
    });
  });
});
