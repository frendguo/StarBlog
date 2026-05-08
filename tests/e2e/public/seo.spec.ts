import { expect, test, type Page } from "@playwright/test";
import { siteConfig } from "../../../src/lib/site-config";

const SITE_ORIGIN = siteConfig.url.replace(/\/+$/, "");
const FIXTURE_POST = {
  slug: "e2e-fixture-cpp",
  title: "[E2E] Fixture C++ coroutines",
  excerpt: "e2e fixture excerpt one",
  tagLabel: "C++",
  words: 200,
  readTime: 2,
} as const;

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

async function metaContent(page: Page, selector: string): Promise<string> {
  const content = await page.locator(selector).getAttribute("content");
  expect(content, `${selector} content`).toBeTruthy();
  return content!;
}

async function findJsonLd(
  page: Page,
  schemaType: string
): Promise<Record<string, unknown>> {
  const payloads = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) => {
      return nodes
        .map((node) => node.textContent?.trim() ?? "")
        .filter(Boolean)
        .flatMap((raw) => {
          const parsed = JSON.parse(raw) as
            | Record<string, unknown>
            | Record<string, unknown>[];
          if (Array.isArray(parsed)) return parsed;
          const graph = parsed["@graph"];
          return Array.isArray(graph)
            ? (graph as Record<string, unknown>[])
            : [parsed];
        });
    });

  const payload = payloads.find((candidate) => candidate["@type"] === schemaType);
  if (!payload) {
    throw new Error(`Missing JSON-LD payload for schema type "${schemaType}"`);
  }
  return payload;
}

function expectOgImagePath(url: string): URL {
  const parsed = new URL(url);
  expect(parsed.pathname).toBe("/opengraph-image");
  return parsed;
}

test.describe("public seo metadata @P1", () => {
  test("robots.txt and sitemap.xml expose crawl entrypoints", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(robots.headers()["content-type"] ?? "").toMatch(/text\/plain/);
    expect(await robots.text()).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(sitemap.headers()["content-type"] ?? "").toMatch(/xml/);

    const xml = await sitemap.text();
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/</loc>`);
    expect(xml).toContain(`<loc>${SITE_ORIGIN}/writing</loc>`);
    expect(xml).toContain(
      `<loc>${SITE_ORIGIN}/writing/${FIXTURE_POST.slug}</loc>`
    );
  });

  test("default opengraph image route returns a PNG and home references it", async ({
    page,
    request,
  }) => {
    const image = await request.get("/opengraph-image");
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"] ?? "").toMatch(/image\/png/);
    expect((await image.body()).byteLength).toBeGreaterThan(512);

    await page.goto("/");
    await expect(page.locator("h1.hero-title")).toBeVisible();

    const ogImage = await metaContent(page, 'meta[property="og:image"]');
    expectOgImagePath(ogImage);
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      "content",
      /frendguo/
    );
    expect(await metaContent(page, 'meta[name="twitter:image"]')).toBe(ogImage);
  });

  test("home page keeps canonical and website JSON-LD aligned", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1.hero-title")).toBeVisible();

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBeTruthy();
    expect(normalizeUrl(canonical!)).toBe(SITE_ORIGIN);

    const website = await findJsonLd(page, "WebSite");
    expect(website.name).toBe(siteConfig.author.name);
    expect(website.description).toBe(siteConfig.description);
    expect(normalizeUrl(String(website.url))).toBe(SITE_ORIGIN);

    const publisher = website.publisher as Record<string, unknown>;
    expect(publisher["@type"]).toBe("Person");
    expect(publisher.name).toBe(siteConfig.author.realName);
    expect(publisher.url).toBe(`${SITE_ORIGIN}/about`);
  });

  test("article page emits canonical, og/twitter image, and BlogPosting JSON-LD", async ({
    page,
  }) => {
    const articleUrl = `${SITE_ORIGIN}/writing/${FIXTURE_POST.slug}`;

    await page.goto(`/writing/${FIXTURE_POST.slug}`);
    await expect(page.locator("h1.article-title")).toHaveText(FIXTURE_POST.title);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBe(articleUrl);
    expect(await metaContent(page, 'meta[property="og:type"]')).toBe("article");
    expect(await metaContent(page, 'meta[property="og:title"]')).toBe(
      FIXTURE_POST.title
    );
    expect(await metaContent(page, 'meta[property="og:url"]')).toBe(articleUrl);

    const ogImage = await metaContent(page, 'meta[property="og:image"]');
    expectOgImagePath(ogImage);
    expect(await metaContent(page, 'meta[name="twitter:image"]')).toBe(ogImage);

    const blogPosting = await findJsonLd(page, "BlogPosting");
    expect(blogPosting.headline).toBe(FIXTURE_POST.title);
    expect(blogPosting.description).toBe(FIXTURE_POST.excerpt);
    expect(blogPosting.url).toBe(articleUrl);

    const mainEntity = blogPosting.mainEntityOfPage as Record<string, unknown>;
    expect(mainEntity["@id"]).toBe(articleUrl);

    const image = blogPosting.image as unknown[];
    expect(Array.isArray(image)).toBe(true);
    expect(normalizeUrl(String(image[0]))).toBe(`${SITE_ORIGIN}/opengraph-image`);

    const keywords = blogPosting.keywords as unknown[];
    expect(Array.isArray(keywords)).toBe(true);
    expect(keywords).toContain(FIXTURE_POST.tagLabel);
    expect(blogPosting.wordCount).toBe(FIXTURE_POST.words);
    expect(blogPosting.timeRequired).toBe(`PT${FIXTURE_POST.readTime}M`);
  });
});
