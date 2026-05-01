import { expect, test } from "@playwright/test";

test.describe("admin middleware @P0", () => {
  test("anonymous request to /admin redirects to login with from=", async ({
    page,
  }) => {
    const response = await page.goto("/admin");
    expect(page.url()).toMatch(/\/admin\/login\?.*from=%2Fadmin/);
    expect(response?.status()).toBeLessThan(500);
  });

  test("anonymous request to /admin/posts redirects with from preserved", async ({
    page,
  }) => {
    await page.goto("/admin/posts");
    expect(page.url()).toMatch(/\/admin\/login\?.*from=%2Fadmin%2Fposts/);
  });

  test("forged session cookie is rejected and redirects to login", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "starblog_session",
        value: "definitely.not.a.valid.jwt",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await page.goto("/admin");
    expect(page.url()).toMatch(/\/admin\/login/);
    // Middleware should have deleted the bad cookie.
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "starblog_session")).toBeUndefined();
  });
});
