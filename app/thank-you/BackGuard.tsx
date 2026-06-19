"use client";

import { useEffect } from "react";

/**
 * Traps the browser Back button on the terminal status page: pushes a history
 * entry on mount and re-pushes on every popstate, so Back can't navigate the
 * user back into the payment flow. They leave via the "Back to Home" button.
 */
export function BackGuard() {
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const onPop = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return null;
}
