import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        logout();
      } else {
        setError("Could not load groups.");
      }
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createGroup(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/groups", { name });
      setName("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the group.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "sans-serif", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Hi, {localStorage.getItem("userName")}</h2>
        <button onClick={logout}>Log out</button>
      </div>

      <form onSubmit={createGroup} style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          style={{ flex: 1 }}
          placeholder="New group name (e.g. Goa Trip)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <h3>Your groups</h3>
      {groups.length === 0 && <p>No groups yet. Create one above.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {groups.map((g) => (
          <li
            key={g.id}
            onClick={() => navigate(`/groups/${g.id}`)}
            style={{ padding: 12, border: "1px solid #888", borderRadius: 8, marginBottom: 8, cursor: "pointer" }}
          >
            <strong>{g.name}</strong>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {g.members.map((m) => m.name).join(", ")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}