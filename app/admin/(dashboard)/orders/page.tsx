import { listOrders } from "@/lib/orders";
import { holdOrder, releaseOrder, sendNowAction, retryOrderAction } from "../../actions";
import { SubmitButton } from "../../SubmitButton";

export const dynamic = "force-dynamic";

const STUCK_GENERATING_MS = 5 * 60 * 1000;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  const now = Date.now();

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
            {orders.map((o) => {
              const stuckGenerating =
                o.status === "generating" && now - new Date(o.updated_at).getTime() > STUCK_GENERATING_MS;

              return (
                <tr key={o.id}>
                  <td>{o.full_name}</td>
                  <td>{o.email}</td>
                  <td>
                    <span className={`admin-status ${o.status}`}>{o.status}</span>
                    {o.status === "failed" && o.error ? (
                      <div style={{ fontSize: 11, color: "#c96", marginTop: 4 }}>{o.error}</div>
                    ) : null}
                    {stuckGenerating && (
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                        Stuck since {formatDate(o.updated_at)} — retry below.
                      </div>
                    )}
                  </td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>{o.scheduled_at ? formatDate(o.scheduled_at) : "—"}</td>
                  <td>
                    {o.status === "scheduled" && (
                      <>
                        <form action={sendNowAction.bind(null, o.id)} style={{ display: "inline" }}>
                          <SubmitButton pendingLabel="Sending…">Send now</SubmitButton>
                        </form>
                        <form action={holdOrder.bind(null, o.id)} style={{ display: "inline" }}>
                          <SubmitButton pendingLabel="Holding…">Hold</SubmitButton>
                        </form>
                      </>
                    )}
                    {o.status === "held" && (
                      <form action={releaseOrder.bind(null, o.id)} style={{ display: "inline" }}>
                        <SubmitButton pendingLabel="Sending…">Release &amp; send</SubmitButton>
                      </form>
                    )}
                    {o.status === "sent" && o.sent_at && (
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>Sent {formatDate(o.sent_at)}</span>
                    )}
                    {(o.status === "failed" || stuckGenerating) && (
                      <form action={retryOrderAction.bind(null, o.id)} style={{ display: "inline" }}>
                        <SubmitButton pendingLabel="Retrying… (~15s)">Retry</SubmitButton>
                      </form>
                    )}
                    {(o.status === "created" || o.status === "paid" || (o.status === "generating" && !stuckGenerating)) && (
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>
                        {o.status === "created" ? "Awaiting payment" : "In progress…"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
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
