import { expect, test } from "@playwright/test";

test.describe("RSS feed @P1", () => {
  test("/feed.xml is well-formed RSS 2.0 with at least one item", async ({
    request,
  }) => {
    const r = await request.get("/feed.xml");
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toMatch(/application\/xml/);

    const xml = await r.text();
    expect(xml).toMatch(/^<\?xml\s+version="1\.0"/);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<channel>");
    expect(xml).toContain("</channel>");
    expect(xml).toContain("</rss>");

    // At least one item with required RSS fields
    const itemBlock = xml.match(/<item>[\s\S]*?<\/item>/);
    expect(itemBlock).not.toBeNull();
    if (itemBlock) {
      expect(itemBlock[0]).toContain("<title>");
      expect(itemBlock[0]).toContain("<link>");
      expect(itemBlock[0]).toContain("<guid");
      expect(itemBlock[0]).toContain("<pubDate>");
    }
  });

  test("/feed.xml advertises self atom link", async ({ request }) => {
    const r = await request.get("/feed.xml");
    const xml = await r.text();
    expect(xml).toMatch(/<atom:link[^>]+rel="self"[^>]+type="application\/rss\+xml"/);
  });
});
