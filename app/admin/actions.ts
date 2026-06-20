"use server";

import { revalidatePath } from "next/cache";
import { getOrder, updateOrder } from "@/lib/orders";
import { deliverScheduledOrder } from "@/lib/generate";

/** Pull a 'scheduled' order out of the auto-send queue for manual review. */
export async function holdOrder(id: string) {
  await updateOrder(id, { status: "held" });
  revalidatePath("/admin/orders");
}

/** Put a held order back into the delivery queue, sending it immediately. */
export async function releaseOrder(id: string) {
  const order = await getOrder(id);
  if (!order) return;
  await sendNowAction(order.id);
}

/** Send a 'scheduled' or 'held' order's report right now, bypassing the delay. */
export async function sendNowAction(id: string) {
  const order = await getOrder(id);
  if (!order) return;
  await deliverScheduledOrder(order);
  revalidatePath("/admin/orders");
}
