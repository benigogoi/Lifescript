import { listOrders } from "@/lib/orders";
import { holdOrder, releaseOrder, sendNowAction, retryOrderAction } from "../../actions";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <>
      <div className="admin-topbar">
        <h1>Orders</h1>
        <span className="admin-pill">{orders.length} total</span>
      </div>

      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
              <th>Scheduled for</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.full_name}</td>
                <td>{o.email}</td>
                <td>
                  <span className={`admin-status ${o.status}`}>{o.status}</span>
                  {o.status === "failed" && o.error ? (
                    <div style={{ fontSize: 11, color: "#c96", marginTop: 4 }}>{o.error}</div>
                  ) : null}
                </td>
                <td>{formatDate(o.created_at)}</td>
                <td>{o.scheduled_at ? formatDate(o.scheduled_at) : "—"}</td>
                <td>
                  {o.status === "scheduled" && (
                    <>
                      <form action={sendNowAction.bind(null, o.id)} style={{ display: "inline" }}>
                        <button className="admin-action" type="submit">Send now</button>
                      </form>
                      <form action={holdOrder.bind(null, o.id)} style={{ display: "inline" }}>
                        <button className="admin-action" type="submit">Hold</button>
                      </form>
                    </>
                  )}
                  {o.status === "held" && (
                    <form action={releaseOrder.bind(null, o.id)} style={{ display: "inline" }}>
                      <button className="admin-action" type="submit">Release &amp; send</button>
                    </form>
                  )}
                  {o.status === "sent" && o.sent_at && (
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>Sent {formatDate(o.sent_at)}</span>
                  )}
                  {o.status === "failed" && (
                    <form action={retryOrderAction.bind(null, o.id)} style={{ display: "inline" }}>
                      <button className="admin-action" type="submit">Retry</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
