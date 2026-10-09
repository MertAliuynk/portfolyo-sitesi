"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "~/env";
import {
  createSessionToken,
  safeEqual,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "~/server/session";

export interface LoginState {
  error: string | null;
}

/* tiny in-memory brute-force brake: 5 misses → 5 minute pause per IP */
const attempts = new Map<string, { misses: number; until: number }>();

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin") && !next.startsWith("//") && !next.startsWith("/admin/giris")
    ? next
    : "/admin";
}

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "local";
  const now = Date.now();
  const record = attempts.get(ip);

  if (record && record.until > now) {
    const mins = Math.ceil((record.until - now) / 60000);
    return { error: `Çok fazla deneme. ${mins} dakika sonra tekrar dene.` };
  }

  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  // a little latency on every attempt makes guessing slower
  await new Promise((r) => setTimeout(r, 350));

  if (!safeEqual(password, env.ADMIN_PASSWORD)) {
    const misses = (record?.misses ?? 0) + 1;
    attempts.set(ip, { misses: misses >= 5 ? 0 : misses, until: misses >= 5 ? now + 5 * 60000 : 0 });
    return { error: "Şifre yanlış." };
  }

  attempts.delete(ip);
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/giris");
}
