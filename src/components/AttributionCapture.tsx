"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Records where the visitor came from (UTM/gclid/fbclid/referrer) on first
 * paint. Mounted once in the root layout; renders nothing.
 * Reads window.location directly instead of useSearchParams so the root
 * layout needs no Suspense boundary.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
