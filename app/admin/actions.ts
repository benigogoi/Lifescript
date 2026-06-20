"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrder, updateOrder } from "@/lib/orders";
import { deliverScheduledOrder, processPaidOrder } from "@/lib/generate";
import { SESSION_COOKIE } from "@/lib/session";
import { setAdminCredentials, verifyCurrentPassword } from "@/lib/admin-auth";
import { addExpense, deleteExpense } from "@/lib/expenses";

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/** Pull a 'scheduled' order out of the auto-send queue for manual review. */
export async function holdOrder(id: string) {
  await updateOrder(id, { status: "held" });
  revalidatePath("/admin/orders");
}

/** Put a held order back into the delivery queue, sending it immediately. */
export async function releaseOrder(id: string) {
  await sendNowAction(id);
}

/** Send a 'scheduled' or 'held' order's report right now, bypassing the delay. */
export async function sendNowAction(id: string) {
  const order = await getOrder(id);
  if (!order) return;
  await deliverScheduledOrder(order);
  revalidatePath("/admin/orders");
}

/** Re-run generation for an order stuck in 'failed' (or 'generating'). */
export async function retryOrderAction(id: string) {
  const order = await getOrder(id);
  if (!order) return;
  await processPaidOrder(order);
  revalidatePath("/admin/orders");
}

export async function updateCredentialsAction(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword") || "");
  const newUsername = String(formData.get("newUsername") || "").trim();
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  const verified = await verifyCurrentPassword(currentPassword);
  if (!verified) {
    redirect("/admin/settings?error=wrong-password");
  }
  if (!newUsername || newPassword.length < 8) {
    redirect("/admin/settings?error=invalid");
  }
  if (newPassword !== confirmPassword) {
    redirect("/admin/settings?error=mismatch");
  }

  await setAdminCredentials(newUsername, newPassword);
  // Credentials changed — force re-login with the new password.
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login?next=%2Fadmin");
}

export async function addExpenseAction(formData: FormData) {
  const category = String(formData.get("category") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const amountInr = Number(formData.get("amountInr"));
  const spentOn = String(formData.get("spentOn") || "");

  if (!category || !Number.isFinite(amountInr) || amountInr <= 0) {
    return;
  }

  await addExpense({ category, description, amountInr: Math.round(amountInr), spentOn });
  revalidatePath("/admin");
}

export async function deleteExpenseAction(id: string) {
  await deleteExpense(id);
  revalidatePath("/admin");
}
