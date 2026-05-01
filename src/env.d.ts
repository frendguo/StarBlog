declare global {
  interface CloudflareEnv {
    ADMIN_USERNAME?: string;
    ADMIN_PASSWORD_HASH?: string;
    AUTH_SECRET?: string;
  }
}

export {};
