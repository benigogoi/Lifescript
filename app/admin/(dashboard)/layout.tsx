import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "../actions";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Image src="/logo.png" alt="Mystic Digits" width={56} height={56} className="admin-logo-img" priority />
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
