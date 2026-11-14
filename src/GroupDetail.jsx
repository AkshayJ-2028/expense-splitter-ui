import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "./api";
import AddExpense from "./AddExpense";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [g, e, b] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/expenses`),
        api.get(`/groups/${id}/balances`),
      ]);
      setGroup(g.data);
      setExpenses(e.data);
      setBalances(b.data);
      setError("");
    } catch (err) {
      setError("Could not load this group.");
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function settle(s) {
    try {
      await api.post(`/groups/${id}/payments`, {
        toUserId: s.toUserId,
        amount: Number(s.amount),
      });
      load();
    } catch (err) {
      setError("Could not record the payment.");
    }
  }

  if (error) return <p style={{ color: "crimson" }}>{error}</p>;
  if (!group || !balances) return <p>Loading...</p>;

  const myEmail = localStorage.getItem("userEmail");
  const me = group.members.find((m) => m.email === myEmail);

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", fontFamily: "sans-serif", textAlign: "left" }}>
      <button onClick={() => navigate("/groups")}>Back</button>
      <h2>{group.name}</h2>
      <p style={{ opacity: 0.7 }}>{group.members.map((m) => m.name).join(", ")}</p>

      <h3>Balances</h3>
      {balances.balances.map((b) => (
        <div key={b.userId}>
          {b.name}:{" "}
          <strong style={{ color: Number(b.net) >= 0 ? "seagreen" : "crimson" }}>
            {Number(b.net) >= 0 ? "is owed" : "owes"} ₹{Math.abs(Number(b.net)).toFixed(2)}
          </strong>
        </div>
      ))}

      <h3>Who pays whom</h3>
      {balances.settlements.length === 0 && <p>All settled up.</p>}
      {balances.settlements.map((s, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          {s.fromName} pays {s.toName} ₹{Number(s.amount).toFixed(2)}{" "}
          {me && me.userId === s.fromUserId && (
            <button onClick={() => settle(s)}>Mark as paid</button>
          )}
        </div>
      ))}

      <h3>Add an expense</h3>
      <AddExpense group={group} onAdded={load} />

      <h3>Expenses</h3>
      {expenses.length === 0 && <p>No expenses yet.</p>}
      {expenses.map((x) => (
        <div key={x.id} style={{ padding: 10, border: "1px solid #888", borderRadius: 8, marginBottom: 8 }}>
          <strong>{x.description}</strong> ₹{Number(x.amount).toFixed(2)}
          <div style={{ fontSize: 13, opacity: 0.7 }}>
            Paid by {x.paidByName} · {x.splitType} · {x.expenseDate}
          </div>
        </div>
      ))}
    </div>
  );
}