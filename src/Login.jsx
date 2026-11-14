import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const path = isRegister ? "/auth/register" : "/auth/login";
      const body = isRegister ? { name, email, password } : { email, password };
      const res = await api.post(path, body);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.name);
      localStorage.setItem("userEmail", res.data.email);
      navigate("/groups");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Check your details.");
    }
  }

  return (
    <div style={{ maxWidth: 360,background: "#fff", padding: 24, borderRadius: 12, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2>{isRegister ? "Create account" : "Log in"}</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        {isRegister && (
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{isRegister ? "Register" : "Log in"}</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <p>
        <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ background: "none", border: "none", color: "4f46e5", cursor: "pointer" }}>
          {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </p>
    </div>
  );
}