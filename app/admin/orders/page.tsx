const SAMPLE_ORDERS = [
  { name: "Ravi Kumar", email: "ravi@example.com", status: "paid", date: "—" },
  { name: "Priya Sharma", email: "priya@example.com", status: "pending", date: "—" },
];

export default function AdminOrdersPage() {
  return (
    <>
      <div className="admin-topbar">
        <h1>Orders</h1>
        <span className="admin-pill">Not connected</span>
      </div>

      <div className="admin-notice">
        Sample layout only — order data, resend, and refund actions will work once the database
        and payment gateway are connected.
      </div>

      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ORDERS.map((o) => (
              <tr key={o.email}>
                <td>{o.name}</td>
                <td>{o.email}</td>
                <td>
                  <span className={`admin-status ${o.status}`}>{o.status}</span>
                </td>
                <td>{o.date}</td>
                <td>
                  <button className="admin-action" disabled>View</button>
                  <button className="admin-action" disabled>Resend</button>
                  <button className="admin-action" disabled>Refund</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
