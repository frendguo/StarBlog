"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_TTL,
  signSession,
  verifyPassword,
} from "@/lib/auth";

export async function login(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  const expectedUser = process.env.ADMIN_USERNAME ?? "admin";
  const stored = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.AUTH_SECRET;

  if (!stored || !secret) {
    redirect("/admin/login?err=config");
  }
  if (!username || !password) {
    redirect("/admin/login?err=empty");
  }
  if (username !== expectedUser) {
    redirect("/admin/login?err=bad");
  }
  const ok = await verifyPassword(password, stored);
  if (!ok) {
    redirect("/admin/login?err=bad");
  }

  const token = await signSession(username, secret);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL,
  });
  redirect(from || "/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
