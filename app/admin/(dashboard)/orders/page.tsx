import Link from "next/link";
import { listOrders } from "@/lib/orders";
import { holdOrder, releaseOrder, sendNowAction, retryOrderAction, sendSelectedAction } from "../../actions";
import { SubmitButton } from "../../SubmitButton";
import { SelectAllCheckbox } from "../../SelectAllCheckbox";

export const dynamic = "force-dynamic";
// "Send now"/"Retry" run the full PDF-download+email (or Claude+Puppeteer) pipeline
// as a server action POSTed back to this route — give it the same budget as the
// checkout routes instead of the platform's 10s default, which can kill it mid-send.
export const maxDuration = 60;

const STUCK_GENERATING_MS = 5 * 60 * 1000;
// Approximate USD→INR rate for displaying AI cost; not a live exchange rate.
const USD_TO_INR = 88;

function formatAiCost(costUsd: number | null) {
  if (costUsd == null) return "—";
  return `₹${(costUsd * USD_TO_INR).toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unsent", label: "Unsent" },
  { key: "sent", label: "Sent" },
  { key: "failed", label: "Failed" },
] as const;

function matchesFilter(status: string, filter: string) {
  if (filter === "unsent") return status === "scheduled" || status === "held";
  if (filter === "sent") return status === "sent";
  if (filter === "failed") return status === "failed";
  return true;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const [allOrders, params] = await Promise.all([listOrders(), searchParams]);
  const now = Date.now();
  const filter = params.filter ?? "all";
  const orders = allOrders.filter((o) => matchesFilter(o.status, filter));

  return (
    <>
      <div className="admin-topbar">
        <h1>Orders</h1>
        <span className="admin-pill">{orders.length} total</span>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filter-tabs">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/admin/orders" : `/admin/orders?filter=${f.key}`}
              className={`admin-filter-tab ${filter === f.key ? "active" : ""}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <form id="bulk-send-form" action={sendSelectedAction}>
          <SubmitButton pendingLabel="Sending…" className="admin-action admin-action-add">
            Send selected
          </SubmitButton>
        </form>
      </div>

      <div className="admin-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <SelectAllCheckbox />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>AI Cost</th>
              <th>Created</th>
              <th>Scheduled for</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const stuckGenerating =
                o.status === "generating" && now - new Date(o.updated_at).getTime() > STUCK_GENERATING_MS;
              const selectable = o.status === "scheduled" || o.status === "held";

              return (
                <tr key={o.id}>
                  <td>
                    {selectable && (
                      <input type="checkbox" name="orderIds" value={o.id} form="bulk-send-form" aria-label={`Select order for ${o.full_name}`} />
                    )}
                  </td>
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
                  <td>{formatAiCost(o.claude_cost_usd)}</td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>{o.scheduled_at ? formatDate(o.scheduled_at) : "—"}</td>
                  <td>
                    {o.pdf_path && (
                      <a
                        href={`/admin/orders/${o.id}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginRight: 8 }}
                      >
                        View
                      </a>
                    )}
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
                <td colSpan={8} style={{ textAlign: "center", color: "var(--muted)" }}>
                  No orders match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
