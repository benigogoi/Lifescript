import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const orders = await listOrders();

  const todayStr = new Date().toDateString();
  const ordersToday = orders.filter((o) => new Date(o.created_at).toDateString() === todayStr);
  const revenueToday = ordersToday
    .filter((o) => o.status !== "created")
    .reduce((sum, o) => sum + o.amount_inr, 0);
  const delivered = orders.filter((o) => o.status === "sent").length;
  const pending = orders.filter((o) => o.status === "created").length;

  const stats = [
    { label: "Orders today", value: String(ordersToday.length) },
    { label: "Revenue today", value: `₹${revenueToday}` },
    { label: "Reports delivered", value: String(delivered) },
    { label: "Pending payments", value: String(pending) },
  ];

  const recent = orders.slice(0, 5);

  return (
    <>
      <div className="admin-topbar">
        <h1>Dashboard</h1>
        <span className="admin-pill">Live</span>
      </div>

      <div className="admin-stats">
        {stats.map((s) => (
          <div className="admin-stat-card" key={s.label}>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <h2>Recent orders</h2>
        {recent.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13 }}>No orders yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>{o.full_name}</td>
                  <td>
                    <span className={`admin-status ${o.status}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 12 }}>
          See <a href="/admin/orders" style={{ color: "var(--gold)" }}>Orders</a> for the full list and actions.
        </p>
      </div>
    </>
  );
}
