import { expect, test } from "@playwright/test";
import { ADMIN_PASSWORD, ADMIN_USERNAME } from "../fixtures/test-data";

test.describe.configure({ mode: "serial" });

test.describe("admin auth @P0", () => {
  test("login form rejects wrong password and shows err=bad", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("input[name='username']").fill(ADMIN_USERNAME);
    await page.locator("input[name='password']").fill("wrong-password-totally");
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/\/admin\/login\?err=bad/);
    await expect(page.locator("body")).toContainText(/用户名或密码不对/);
  });

  test("login form rejects empty password and shows err=empty", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("input[name='username']").fill(ADMIN_USERNAME);
    // Force-submit with empty password by removing the required attribute first.
    await page.evaluate(() => {
      const el = document.querySelector("input[name='password']") as HTMLInputElement | null;
      el?.removeAttribute("required");
    });
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/\/admin\/login\?err=empty/);
    await expect(page.locator("body")).toContainText(/请填写用户名和密码/);
  });

  test("login success redirects to from= target and sets session cookie", async ({
    page,
    context,
  }) => {
    await page.goto("/admin/login?from=%2Fadmin%2Fposts");
    await page.locator("input[name='username']").fill(ADMIN_USERNAME);
    await page.locator("input[name='password']").fill(ADMIN_PASSWORD);
    await Promise.all([
      page.waitForURL(/\/admin\/posts/, { timeout: 10_000 }),
      page.locator("button[type='submit']").click(),
    ]);
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "starblog_session")).toBeTruthy();
  });

  test("err=config message renders when query param present", async ({ page }) => {
    await page.goto("/admin/login?err=config");
    await expect(page.locator("body")).toContainText(/服务端缺少环境变量/);
  });
});
