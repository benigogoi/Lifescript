"use client";

import { useFormStatus } from "react-dom";

/**
 * Sign-in button with a spinner that stays up from submit until the dashboard
 * has rendered — the form action's pending state covers the login action, the
 * redirect, and the /admin page render, since they all run in one transition.
 */
export function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="cta"
      style={{ width: "100%", marginTop: 8 }}
      disabled={pending}
      aria-busy={pending}
    >
      {pending && <span className="btn-spinner" aria-hidden="true" />}
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
