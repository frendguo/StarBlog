import { expect, test } from "@playwright/test";

/**
 * Article detail regression suite — guards G1/G2/G3 fixes:
 *   - G1: TOC must render in exactly one place (desktop list XOR mobile drawer).
 *   - G2: prose body must never start at <h1> (article title is the only h1).
 *   - G3: every <img> in prose must carry a non-empty alt (rehypeImgAltFallback).
 *
 * The suite navigates from /writing → first article so it works against
 * whatever fixture posts global.setup.ts inserted (currently three e2e-fixture-*
 * posts that start at h2 with no images — image alt is asserted vacuously when
 * no <img> is present, which still fails closed if a future fixture adds one
 * without an alt).
 */

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 375, height: 812 };

async function gotoFirstArticle(page: import("@playwright/test").Page) {
  await page.goto("/writing");
  const firstArticle = page.locator(".writing-row").first();
  await firstArticle.scrollIntoViewIfNeeded();
  await firstArticle.click();
  await expect(page.locator("h1.article-title")).toBeVisible();
}

test.describe("article detail @P1", () => {
  test("article body has exactly one <h1> and prose never starts at h1 @P0", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await gotoFirstArticle(page);

    // The page title is the only h1 on the page.
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
    await expect(page.locator("h1")).toHaveClass(/article-title/);

    // No h1 anywhere inside the rendered prose body.
    const proseH1 = page.locator(".prose h1");
    await expect(proseH1).toHaveCount(0);

    // Sanity: prose's first heading (if any) must be h2 or deeper.
    const firstHeading = page
      .locator(".prose :is(h1, h2, h3, h4, h5, h6)")
      .first();
    if ((await firstHeading.count()) > 0) {
      const tag = await firstHeading.evaluate((el) => el.tagName.toLowerCase());
      expect(tag).not.toBe("h1");
    }
  });

  test("desktop renders only the desktop TOC list @P0", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await gotoFirstArticle(page);

    const desktop = page.locator(".toc-desktop-list").first();
    const mobileToggle = page.locator(".toc-mobile-toggle").first();
    const mobilePanel = page.locator(".toc-mobile-panel").first();

    // If this article had no headings, TOC is omitted entirely — skip.
    if ((await desktop.count()) === 0 && (await mobileToggle.count()) === 0) {
      test.skip(true, "Article has no TOC (no h2/h3 headings)");
    }

    await expect(desktop).toBeVisible();
    await expect(mobileToggle).toBeHidden();
    await expect(mobilePanel).toBeHidden();
  });

  test("mobile shows toggle, hides desktop list, drawer opens to flex @P0", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await gotoFirstArticle(page);

    const desktop = page.locator(".toc-desktop-list").first();
    const mobileToggle = page.locator(".toc-mobile-toggle").first();
    const mobilePanel = page.locator(".toc-mobile-panel").first();

    if ((await desktop.count()) === 0 && (await mobileToggle.count()) === 0) {
      test.skip(true, "Article has no TOC (no h2/h3 headings)");
    }

    await expect(mobileToggle).toBeVisible();
    await expect(desktop).toBeHidden();
    await expect(mobilePanel).toBeHidden();

    await mobileToggle.click();
    await expect(mobilePanel).toHaveClass(/\bopen\b/);
    // Mobile panel becomes visible (CSS flips display: none → flex on .open).
    await expect(mobilePanel).toBeVisible();
    const display = await mobilePanel.evaluate(
      (el) => getComputedStyle(el).display
    );
    expect(display).toBe("flex");
  });

  test("inline TOC anchors all resolve to existing ids in the body @P0", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await gotoFirstArticle(page);

    const inlineLinks = page.locator(".article-toc-inline-list a");
    const count = await inlineLinks.count();
    if (count === 0) {
      test.skip(true, "Article has no inline TOC");
    }

    const hrefs = await inlineLinks.evaluateAll((nodes) =>
      nodes.map((n) => (n as HTMLAnchorElement).getAttribute("href"))
    );

    for (const href of hrefs) {
      expect(href, "TOC link href").toMatch(/^#/);
      const id = href!.slice(1);
      // Verify rehypeShiftHeadings (runs before rehypeSlug) didn't desync ids
      // from the slugs extractToc emitted.
      const target = page.locator(`#${CSS.escape(id)}`);
      await expect(
        target,
        `TOC anchor #${id} must resolve to a node in the document`
      ).toHaveCount(1);
    }
  });

  test("every prose <img> has a non-empty alt @P1", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await gotoFirstArticle(page);

    const imgs = page.locator(".prose img");
    const count = await imgs.count();
    if (count === 0) {
      // Vacuously passes when fixture has no images. The assertion still
      // guards the regression: any future image without a fallback alt fails.
      return;
    }

    const alts = await imgs.evaluateAll((nodes) =>
      nodes.map((n) => (n as HTMLImageElement).getAttribute("alt"))
    );
    for (const alt of alts) {
      expect(alt, "img alt").not.toBeNull();
      expect((alt ?? "").trim().length, "img alt length").toBeGreaterThan(0);
    }
  });
});
