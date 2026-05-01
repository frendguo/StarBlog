import { chromium, type FullConfig } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { loginAsAdmin } from "./fixtures/auth";
import { cleanAllE2EData, ensureSeed, seedFixturePosts } from "./fixtures/db";
import { ADMIN_PASSWORD, ADMIN_USERNAME, STORAGE_STATE_PATH } from "./fixtures/test-data";

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3000";

  console.log("[e2e] applying seed.sql to local D1…");
  ensureSeed();
  console.log("[e2e] cleaning leftover e2e-* rows…");
  cleanAllE2EData();
  console.log("[e2e] inserting fixture posts…");
  seedFixturePosts();

  console.log("[e2e] verifying admin login…");
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  try {
    await loginAsAdmin(page);
  } catch (e) {
    await browser.close();
    throw new Error(
      `[e2e] admin login failed. ` +
        `Make sure .dev.vars has:\n` +
        `  ADMIN_USERNAME=${ADMIN_USERNAME}\n` +
        `  ADMIN_PASSWORD_HASH=<hash of "${ADMIN_PASSWORD}", run: pnpm hash ${ADMIN_PASSWORD}>\n` +
        `  AUTH_SECRET=<any long random string>\n\n` +
        `Underlying error: ${(e as Error).message}`
    );
  }

  await mkdir(dirname(STORAGE_STATE_PATH), { recursive: true });
  await context.storageState({ path: STORAGE_STATE_PATH });
  await browser.close();
  console.log(`[e2e] storage state saved to ${STORAGE_STATE_PATH}`);
}
