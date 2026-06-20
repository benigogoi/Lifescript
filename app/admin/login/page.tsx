import type { Metadata } from "next";
import { login } from "./actions";

export const metadata: Metadata = {
  title: "Admin Login — LifeScript",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next || "/admin";

  return (
    <div className="admin-login-shell">
      <form className="admin-login-card" action={login}>
        <div className="wordmark" style={{ marginBottom: 8 }}>
          Life<span>Script</span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Admin sign in</p>

        <input type="hidden" name="next" value={next} />

        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" autoComplete="username" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>

        {params.error && (
          <div className="field err" role="alert">
            Incorrect username or password.
          </div>
        )}

        <button type="submit" className="cta" style={{ width: "100%", marginTop: 8 }}>
          Sign in
        </button>
      </form>
    </div>
  );
}
