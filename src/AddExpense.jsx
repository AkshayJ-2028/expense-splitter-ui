import { useState } from "react";
import api from "./api";

export default function AddExpense({ group, onAdded }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paidBy, setPaidBy] = useState(group.members[0].userId);
  const [splitType, setSplitType] = useState("EQUAL");
  const [values, setValues] = useState({});
  const [error, setError] = useState("");

  function setValue(userId, v) {
    setValues({ ...values, [userId]: v });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    const splits = group.members.map((m) => ({
      userId: m.userId,
      value: splitType === "EQUAL" ? null : Number(values[m.userId] || 0),
    }));
    try {
      await api.post(`/groups/${group.id}/expenses`, {
        description,
        amount: Number(amount),
        category: category || null,
        paidBy: Number(paidBy),
        splitType,
        splits,
      });
      setDescription("");
      setAmount("");
      setCategory("");
      setValues({});
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add the expense. Check that the split adds up.");
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, margin: "12px 0" }}>
      <input placeholder="Description (e.g. Dinner)" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <input type="number" step="0.01" min="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      <input placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} />
      <label>
        Paid by{" "}
        <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          {group.members.map((m) => (
            <option key={m.userId} value={m.userId}>{m.name}</option>
          ))}
        </select>
      </label>
      <label>
        Split{" "}
        <select value={splitType} onChange={(e) => setSplitType(e.target.value)}>
          <option value="EQUAL">Equally</option>
          <option value="PERCENT">By percent</option>
          <option value="EXACT">By exact amount</option>
        </select>
      </label>
      {splitType !== "EQUAL" &&
        group.members.map((m) => (
          <label key={m.userId}>
            {m.name} ({splitType === "PERCENT" ? "%" : "₹"}){" "}
            <input type="number" step="0.01" min="0" value={values[m.userId] || ""} onChange={(e) => setValue(m.userId, e.target.value)} />
          </label>
        ))}
      <button type="submit">Add expense</button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </form>
  );
}