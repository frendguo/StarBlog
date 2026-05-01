import { test as base, expect, type Page } from "@playwright/test";
import { ADMIN_PASSWORD, ADMIN_USERNAME } from "./test-data";

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.locator("input[name='username']").fill(ADMIN_USERNAME);
  await page.locator("input[name='password']").fill(ADMIN_PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/admin/login"), {
      timeout: 10_000,
    }),
    page.locator("button[type='submit']").click(),
  ]);
  await expect(page).not.toHaveURL(/\/admin\/login/);
}

export const test = base.extend<object>({});
export { expect };
