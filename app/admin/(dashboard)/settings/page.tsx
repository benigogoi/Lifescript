import { getAdminUsername } from "@/lib/admin-auth";
import { updateCredentialsAction } from "../../actions";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  "wrong-password": "Current password is incorrect.",
  invalid: "Username is required and the new password must be at least 8 characters.",
  mismatch: "New password and confirmation don't match.",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [username, params] = await Promise.all([getAdminUsername(), searchParams]);

  return (
    <>
      <div className="admin-topbar">
        <h1>Settings</h1>
      </div>

      <div className="admin-panel" style={{ maxWidth: 440 }}>
        <h2>Change login</h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
          Current username: <strong style={{ color: "var(--white)" }}>{username}</strong>
        </p>

        <form action={updateCredentialsAction}>
          <div className="field">
            <label htmlFor="currentPassword">Current password</label>
            <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
          </div>
          <div className="field">
            <label htmlFor="newUsername">New username</label>
            <input id="newUsername" name="newUsername" defaultValue={username} required autoComplete="username" />
          </div>
          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
          </div>

          {params.error && (
            <div className="field err" role="alert">
              {ERROR_MESSAGES[params.error] ?? "Something went wrong."}
            </div>
          )}

          <button type="submit" className="cta" style={{ marginTop: 8 }}>
            Save &amp; sign in again
          </button>
        </form>
      </div>
    </>
  );
}
