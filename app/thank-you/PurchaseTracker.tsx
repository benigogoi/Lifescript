"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics";

/**
 * Fires the GA4 `purchase` + Meta `Purchase` conversion for a confirmed order.
 *
 * Only rendered by the thank-you page when it has a real order id — which the
 * order form only passes along after /api/checkout/verify confirmed the
 * Razorpay signature, saved the paid order, and started report generation.
 * trackPurchase() itself guards against refires (localStorage per order id),
 * so refreshing or revisiting this page never double-counts revenue.
 */
export function PurchaseTracker({ orderId }: { orderId: string }) {
  useEffect(() => {
    trackPurchase(orderId);
  }, [orderId]);
  return null;
}
