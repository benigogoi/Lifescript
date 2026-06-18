import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin — LifeScript",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="wordmark">
          Life<span>Script</span>
        </div>
        <nav className="admin-nav" aria-label="Admin">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/orders">Orders</Link>
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
