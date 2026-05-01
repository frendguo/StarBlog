import { cleanAllE2EData } from "./fixtures/db";

export default async function globalTeardown(): Promise<void> {
  try {
    cleanAllE2EData();
    console.log("[e2e] teardown: cleaned e2e-* rows");
  } catch (e) {
    console.warn(`[e2e] teardown cleanup failed (non-fatal): ${(e as Error).message}`);
  }
}
