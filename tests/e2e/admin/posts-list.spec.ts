import { expect, test } from "@playwright/test";
import { STORAGE_STATE_PATH } from "../fixtures/test-data";

test.use({ storageState: STORAGE_STATE_PATH });

test.describe("admin posts list @P2", () => {
  test("status filter pill changes URL query", async ({ page }) => {
    await page.goto("/admin/posts");
    await expect(page.locator(".admin-table")).toBeVisible();

    await page.getByRole("link", { name: /^draft/ }).first().click();
    await expect(page).toHaveURL(/status=draft/);
  });

  test("search box submits q via GET form", async ({ page }) => {
    await page.goto("/admin/posts");
    await page.locator("input[name='q']").fill("zzz-no-such-post-zzz");
    await page.getByRole("button", { name: "搜索" }).click();
    await expect(page).toHaveURL(/q=zzz-no-such-post-zzz/);
    await expect(page.locator(".admin-table")).toContainText(/没有匹配的文章/);
  });

  test("dashboard renders KPIs and recent posts list", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator(".kpi").first()).toBeVisible();
    await expect(page.locator("h1.admin-title")).toBeVisible();
    await expect(page.getByRole("link", { name: /新建文章/ }).first()).toBeVisible();
  });
});
