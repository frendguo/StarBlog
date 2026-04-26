#!/usr/bin/env node
/**
 * Hash a password using PBKDF2-SHA256 to put in ADMIN_PASSWORD_HASH.
 * Usage:  node scripts/hash-password.mjs <password>
 */

import { webcrypto as crypto } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const ITERATIONS = 100_000;
const HASH_LEN = 32;

function b64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

const salt = crypto.getRandomValues(new Uint8Array(16));
const enc = new TextEncoder();
const key = await crypto.subtle.importKey(
  "raw",
  enc.encode(password),
  { name: "PBKDF2" },
  false,
  ["deriveBits"]
);
const bits = await crypto.subtle.deriveBits(
  { name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS },
  key,
  HASH_LEN * 8
);
const hash = new Uint8Array(bits);

console.log(`pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(hash)}`);
