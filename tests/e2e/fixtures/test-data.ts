export const ADMIN_USERNAME = process.env.E2E_USERNAME ?? "admin";
export const ADMIN_PASSWORD = process.env.E2E_PASSWORD ?? "e2e-test-pass";

export const STORAGE_STATE_PATH = "tests/e2e/.auth/admin.json";

export const E2E_SLUG_PREFIX = "e2e-";
export const E2E_TITLE_PREFIX = "[E2E] ";

export function e2eSlug(suffix: string): string {
  const safe = suffix.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  return `${E2E_SLUG_PREFIX}${Date.now()}-${safe}`;
}
