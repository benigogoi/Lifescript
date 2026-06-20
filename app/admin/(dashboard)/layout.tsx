import Link from "next/link";
import { logoutAction } from "../actions";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="wordmark">
          Life<span>Script</span>
        </div>
        <nav className="admin-nav" aria-label="Admin">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/orders">Orders</Link>
          <Link href="/admin/settings">Settings</Link>
        </nav>
        <form action={logoutAction} style={{ marginTop: "auto" }}>
          <button type="submit" className="admin-logout">
            Log out
          </button>
        </form>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
