import { expect, test } from "@playwright/test";

test.describe("comments submit @P2", () => {
  test("guest can submit a comment which goes to pending moderation", async ({
    page,
  }) => {
    await page.goto("/writing");
    await page.locator(".writing-row").first().click();
    await expect(page.locator("h1.article-title")).toBeVisible();

    const author = `[E2E] guest-${Date.now()}`;
    const content = `[E2E] hello comment ${Date.now()}`;

    const authorInput = page.getByPlaceholder("昵称 *");
    const contentTextarea = page.getByPlaceholder(/说点什么/);
    const submit = page.getByRole("button", { name: /^提交\s*→/ });

    await authorInput.scrollIntoViewIfNeeded();
    await authorInput.click();
    await authorInput.pressSequentially(author, { delay: 5 });
    await contentTextarea.click();
    await contentTextarea.pressSequentially(content, { delay: 5 });

    // sanity: values landed in the controlled inputs
    await expect(authorInput).toHaveValue(author);
    await expect(contentTextarea).toHaveValue(content);

    await submit.click();

    // Either the success line appears, or the inline error replaces the default hint.
    const statusLine = page.locator("section >> :text-matches('提交后由管理员|已收到|失败|不对|需要')").first();
    await expect(statusLine).toContainText(/已收到/, { timeout: 15_000 });
  });
});
