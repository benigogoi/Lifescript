const STATS = [
  { label: "Orders today", value: "—" },
  { label: "Revenue today", value: "—" },
  { label: "Reports delivered", value: "—" },
  { label: "Pending payments", value: "—" },
];

export default function AdminDashboard() {
  return (
    <>
      <div className="admin-topbar">
        <h1>Dashboard</h1>
        <span className="admin-pill">Not connected</span>
      </div>

      <div className="admin-notice">
        This admin panel is a preview of the layout only. It isn&apos;t connected to live data yet
        — once Supabase and payment keys are added, this dashboard will show real orders, revenue,
        and delivery status.
      </div>

      <div className="admin-stats">
        {STATS.map((s) => (
          <div className="admin-stat-card" key={s.label}>
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <h2>Recent orders</h2>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          See the <a href="/admin/orders" style={{ color: "var(--gold)" }}>Orders</a> page for the
          full order list once it&apos;s connected.
        </p>
      </div>
    </>
  );
}
