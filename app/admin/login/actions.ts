"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminLogin } from "@/lib/admin-auth";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SEC } from "@/lib/session";

export async function login(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin");

  const ok = username && password && (await verifyAdminLogin(username, password));
  if (!ok) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = await createSessionToken(username);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });

  redirect(next.startsWith("/admin") ? next : "/admin");
}
