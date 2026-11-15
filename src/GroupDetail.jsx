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
  const [notice, setNotice] = useState("");
  const [memberEmail, setMemberEmail] = useState("");

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
    setNotice("");
    try {
      await api.post(`/groups/${id}/payments`, {
        toUserId: s.toUserId,
        amount: Number(s.amount),
      });
      load();
    } catch (err) {
      setNotice("Could not record the payment.");
    }
  }

  async function addMember(e) {
    e.preventDefault();
    setNotice("");
    try {
      await api.post(`/groups/${id}/members`, { email: memberEmail });
      setMemberEmail("");
      load();
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) setNotice("No user with that email. Ask them to register first.");
      else if (status === 409) setNotice("That person is already in the group.");
      else if (status === 403) setNotice("Only the group creator can add members.");
      else setNotice("Could not add the member.");
    }
  }

  async function deleteExpense(x) {
    if (!window.confirm(`Delete "${x.description}"?`)) return;
    setNotice("");
    try {
      await api.delete(`/groups/${id}/expenses/${x.id}`);
      load();
    } catch (err) {
      if (err.response?.status === 403) setNotice("Only the payer or the group creator can delete this expense.");
      else setNotice("Could not delete the expense.");
    }
  }

  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!group || !balances) return <p>Loading...</p>;

  const myEmail = localStorage.getItem("userEmail");
  const me = group.members.find((m) => m.email === myEmail);

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", fontFamily: "sans-serif", textAlign: "left" }}>
      <button onClick={() => navigate("/groups")}>Back</button>
      <h2>{group.name}</h2>
      <p style={{ opacity: 0.7 }}>{group.members.map((m) => m.name).join(", ")}</p>

      {notice && <p style={{ color: "var(--danger)" }}>{notice}</p>}

      <form onSubmit={addMember} style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input
          style={{ flex: 1 }}
          type="email"
          placeholder="Add a member by email"
          value={memberEmail}
          onChange={(e) => setMemberEmail(e.target.value)}
          required
        />
        <button type="submit">Add member</button>
      </form>

      <h3>Balances</h3>
      {balances.balances.map((b) => (
        <div key={b.userId}>
          {b.name}:{" "}
          <strong style={{ color: Number(b.net) >= 0 ? "var(--success)" : "var(--danger)" }}>
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
        <div
          key={x.id}
          style={{
            padding: 10,
            border: "1px solid var(--border-strong)",
            background: "var(--card)",
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              <strong>{x.description}</strong> ₹{Number(x.amount).toFixed(2)}
            </span>
            <button onClick={() => deleteExpense(x)}>Delete</button>
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>
            Paid by {x.paidByName} · {x.splitType} · {x.expenseDate}
          </div>
        </div>
      ))}
    </div>
  );
}
