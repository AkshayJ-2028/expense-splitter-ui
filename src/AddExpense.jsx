import { useState } from "react";
import api from "./api";

export default function AddExpense({ group, onAdded }) {
  const allIds = group.members.map((m) => m.userId);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paidBy, setPaidBy] = useState(group.members[0].userId);
  const [splitType, setSplitType] = useState("EQUAL");
  const [values, setValues] = useState({});
  const [selected, setSelected] = useState(allIds);
  const [error, setError] = useState("");

  // AI helper
  const [aiText, setAiText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  function setValue(userId, v) {
    setValues({ ...values, [userId]: v });
  }

  function toggle(userId) {
    setSelected(selected.includes(userId) ? selected.filter((id) => id !== userId) : [...selected, userId]);
  }

  async function fillWithAi() {
    if (!aiText.trim()) return;
    setAiBusy(true);
    setAiMessage("");
    setError("");
    try {
      const { data } = await api.post(`/groups/${group.id}/ai/parse-expense`, { text: aiText });
      setDescription(data.description);
      setAmount(String(data.amount));
      setCategory(data.category || "");
      setPaidBy(data.paidBy);
      setSplitType("EQUAL");
      setValues({});
      setSelected(data.participantIds);
      const missing = data.unmatchedNames?.length ? ` Could not find: ${data.unmatchedNames.join(", ")}.` : "";
      setAiMessage("Filled in by AI. Please check the details, then click Add expense." + missing);
    } catch (err) {
      setAiMessage(err.response?.data?.message || "The AI could not help right now. Please fill the form manually.");
    } finally {
      setAiBusy(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (selected.length === 0) {
      setError("Pick at least one person to split with.");
      return;
    }
    const splits = group.members
      .filter((m) => selected.includes(m.userId))
      .map((m) => ({
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
      setSelected(allIds);
      setAiText("");
      setAiMessage("");
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add the expense. Check that the split adds up.");
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, margin: "12px 0" }}>
      <div style={{ display: "grid", gap: 6, padding: 10, border: "1px dashed #999", borderRadius: 8 }}>
        <strong>✨ Describe it in a sentence</strong>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            style={{ flex: 1 }}
            placeholder="e.g. Dinner 1200 paid by me, split with Rahul"
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                fillWithAi();
              }
            }}
          />
          <button type="button" onClick={fillWithAi} disabled={aiBusy}>
            {aiBusy ? "Thinking..." : "Fill with AI"}
          </button>
        </div>
        {aiMessage && <small>{aiMessage}</small>}
      </div>

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
      <fieldset style={{ border: "1px solid #ccc", borderRadius: 6 }}>
        <legend>Split between</legend>
        {group.members.map((m) => (
          <label key={m.userId} style={{ marginRight: 12 }}>
            <input type="checkbox" checked={selected.includes(m.userId)} onChange={() => toggle(m.userId)} /> {m.name}
          </label>
        ))}
      </fieldset>
      <label>
        Split{" "}
        <select value={splitType} onChange={(e) => setSplitType(e.target.value)}>
          <option value="EQUAL">Equally</option>
          <option value="PERCENT">By percent</option>
          <option value="EXACT">By exact amount</option>
        </select>
      </label>
      {splitType !== "EQUAL" &&
        group.members
          .filter((m) => selected.includes(m.userId))
          .map((m) => (
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