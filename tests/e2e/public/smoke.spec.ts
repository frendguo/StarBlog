import { expect, test } from "@playwright/test";

// Note: /now is intentionally omitted — it's data-driven (renders post slug='now')
// and 404s when seed data lacks it. Treat /now as a content test, not a route smoke.
const PUBLIC_ROUTES: Array<{ path: string; mustContain: RegExp | string }> = [
  { path: "/", mustContain: /写代码|读源码/ },
  { path: "/about", mustContain: /About|关于/i },
  { path: "/projects", mustContain: /Projects|项目/i },
  { path: "/writing", mustContain: "Writing" },
  { path: "/admin/login", mustContain: /登录|Admin Studio/ },
];

test.describe("public smoke @P0", () => {
  for (const { path, mustContain } of PUBLIC_ROUTES) {
    test(`GET ${path} returns 200 and contains expected text`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).toContainText(mustContain);
    });
  }

  test("GET /feed.xml returns 200 with xml content-type", async ({ request }) => {
    const r = await request.get("/feed.xml");
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"] ?? "").toMatch(/xml/);
    const body = await r.text();
    expect(body).toMatch(/^<\?xml/);
    expect(body).toContain("<rss");
    expect(body).toContain("<channel>");
  });
});
