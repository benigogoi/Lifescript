import { listOrders } from "@/lib/orders";
import { listExpenses, totalExpenses } from "@/lib/expenses";
import { dailyRevenue, totalRevenue } from "@/lib/dashboard-stats";
import { RevenueChart } from "./RevenueChart";
import { addExpenseAction, deleteExpenseAction } from "../actions";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
}

export default async function AdminDashboard() {
  const [orders, expenses, expenseTotal] = await Promise.all([listOrders(), listExpenses(10), totalExpenses()]);

  const todayStr = new Date().toDateString();
  const ordersToday = orders.filter((o) => new Date(o.created_at).toDateString() === todayStr);
  const revenueToday = ordersToday
    .filter((o) => o.status !== "created")
    .reduce((sum, o) => sum + o.amount_inr, 0);
  const delivered = orders.filter((o) => o.status === "sent").length;
  const pending = orders.filter((o) => o.status === "created").length;
  const awaitingSend = orders.filter((o) => o.status === "scheduled" || o.status === "held").length;

  const revenue = totalRevenue(orders);
  const netProfit = revenue - expenseTotal;
  const chartData = dailyRevenue(orders, 14);

  const stats = [
    { label: "Orders today", value: String(ordersToday.length) },
    { label: "Revenue today", value: `₹${revenueToday}` },
    { label: "Reports delivered", value: String(delivered) },
    { label: "Awaiting send", value: String(awaitingSend) },
    { label: "Total revenue", value: `₹${revenue}` },
    { label: "Total expenses", value: `₹${expenseTotal}` },
    { label: "Net profit", value: `₹${netProfit}` },
    { label: "Pending payments", value: String(pending) },
  ];

  return (
    <>
      <div className="admin-topbar">
        <h1>Dashboard</h1>
        <span className="admin-pill admin-pill-live">Live</span>
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
        <h2>Revenue, last 14 days</h2>
        <RevenueChart data={chartData} />
      </div>

      <div className="admin-grid-2">
        <div className="admin-panel">
          <h2>Recent orders</h2>
          {orders.length === 0 ? (
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
                {orders.slice(0, 6).map((o) => (
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

        <div className="admin-panel">
          <h2>Expenses</h2>
          <form action={addExpenseAction} className="admin-inline-form">
            <input name="category" placeholder="Category (e.g. Claude API)" required />
            <input name="description" placeholder="Note (optional)" />
            <input name="amountInr" type="number" min="1" step="1" placeholder="₹ amount" required />
            <input name="spentOn" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            <button type="submit" className="admin-action admin-action-add">Add</button>
          </form>

          {expenses.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 12 }}>No expenses logged yet.</p>
          ) : (
            <table className="admin-table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td>{formatDate(e.spent_on)}</td>
                    <td>
                      {e.category}
                      {e.description ? (
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{e.description}</div>
                      ) : null}
                    </td>
                    <td>₹{e.amount_inr}</td>
                    <td>
                      <form action={deleteExpenseAction.bind(null, e.id)}>
                        <button type="submit" className="admin-action">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
