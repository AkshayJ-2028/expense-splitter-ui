import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { wakeServer } from "./api";

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);

  // Wake the backend as soon as the page opens
  useEffect(() => {
    wakeServer();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSlow(false);
    // If the server has not answered after 2 seconds, tell the user it is starting up
    const timer = setTimeout(() => setSlow(true), 2000);
    try {
      const path = isRegister ? "/auth/register" : "/auth/login";
      const body = isRegister ? { name, email, password } : { email, password };
      const res = await api.post(path, body);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.name);
      localStorage.setItem("userEmail", res.data.email);
      navigate("/groups");
    } catch (err) {
      if (!err.response) {
        setError("The server did not respond. It may still be starting up. Please wait a minute and try again.");
      } else {
        setError(err.response?.data?.message || "Something went wrong. Check your details.");
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setSlow(false);
    }
  }

  const buttonText = loading
    ? slow
      ? "Please wait, server is starting..."
      : "Please wait..."
    : isRegister
    ? "Register"
    : "Log in";

  return (
    <div style={{ maxWidth: 360, background: "var(--card)", padding: 24, borderRadius: 12, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2>{isRegister ? "Create account" : "Log in"}</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        {isRegister && (
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} style={{ cursor: loading ? "wait" : "pointer" }}>
          {buttonText}
        </button>
      </form>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <p>
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          disabled={loading}
          style={{ background: "none", border: "none", color: "var(--link)", cursor: "pointer", padding: 0 }}
        >
          {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </p>
    </div>
  );
}
