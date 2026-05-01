import { expect, test } from "@playwright/test";

test.describe("home page @P1", () => {
  test("hero shows title, primary CTAs and footer year", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1.hero-title")).toBeVisible();
    await expect(page.getByRole("link", { name: /浏览所有文章/ })).toHaveAttribute(
      "href",
      "/writing"
    );
    await expect(page.getByRole("link", { name: /关于我/ })).toHaveAttribute(
      "href",
      "/about"
    );
    await expect(page.locator(".home-footer")).toContainText(
      String(new Date().getFullYear())
    );
  });

  test("featured card links to a valid /writing/<slug>", async ({ page }) => {
    await page.goto("/");
    const featured = page.locator(".home-feature-card").first();
    await expect(featured).toBeVisible();
    const href = await featured.getAttribute("href");
    expect(href).toMatch(/^\/writing\/[\w-]+/);
    if (href) {
      const r = await page.request.get(href);
      expect(r.status()).toBe(200);
    }
  });

  test("topic tag link carries ?tag= query string", async ({ page }) => {
    await page.goto("/");
    const tagLink = page.locator(".home-feature-tags a.tag").first();
    await expect(tagLink).toBeVisible();
    const href = await tagLink.getAttribute("href");
    expect(href).toMatch(/^\/writing\?tag=/);
  });

  test("newsletter form submits and shows success or duplicate message", async ({
    page,
  }) => {
    await page.goto("/");
    const email = `e2e-${Date.now()}@e2e.test`;
    const emailInput = page
      .locator(".newsletter-band input[type='email']")
      .first();
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.fill(email);
    await page.locator(".newsletter-band button[type='submit']").click();
    await expect(page.locator(".newsletter-band")).toContainText(/已订阅/, {
      timeout: 5_000,
    });
  });
});
