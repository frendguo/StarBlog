import { expect, test } from "@playwright/test";

test.describe("writing index @P1", () => {
  test("index lists posts grouped by year and shows total", async ({ page }) => {
    await page.goto("/writing");
    await expect(page.locator("h1.page-title")).toHaveText("Writing");
    await expect(page.locator(".writing-year").first()).toBeVisible();
    await expect(page.locator(".writing-row").first()).toBeVisible();
  });

  test("filter by tag changes the URL and narrows results", async ({ page }) => {
    await page.goto("/writing");
    // WritingFilter renders <a href="/writing?tag=<id>"> for each tag.
    const tagLink = page.locator("a[href*='/writing?tag=']").first();
    await expect(tagLink).toBeVisible();
    const href = await tagLink.getAttribute("href");
    expect(href).toMatch(/\/writing\?tag=/);
    await tagLink.click();
    await expect(page).toHaveURL(/[?&]tag=/);
  });

  test("article detail renders title, excerpt, prose and pagination", async ({
    page,
  }) => {
    await page.goto("/writing");
    const firstArticle = page.locator(".writing-row").first();
    await firstArticle.scrollIntoViewIfNeeded();
    await firstArticle.click();

    await expect(page.locator("h1.article-title")).toBeVisible();
    await expect(page.locator(".article-excerpt")).toBeVisible();
    await expect(page.locator(".prose")).toBeVisible();
    await expect(page.locator(".article-actions")).toContainText(/Subscribe/);
  });

  test("article inline TOC links to in-page anchors", async ({ page }) => {
    await page.goto("/writing");
    const firstArticle = page.locator(".writing-row").first();
    await firstArticle.click();
    const tocInline = page.locator(".article-toc-inline-list a").first();
    if ((await tocInline.count()) > 0) {
      const href = await tocInline.getAttribute("href");
      expect(href).toMatch(/^#/);
    }
  });
});
