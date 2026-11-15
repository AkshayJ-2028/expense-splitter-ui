import axios from "axios";

// Locally this is http://localhost:8080. On Vercel we set VITE_API_URL to the Render backend address.
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${baseUrl}/api`,
  timeout: 90000, // free Render servers can take up to ~60s to wake up
});

// Attach the saved login token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fire-and-forget request that wakes a sleeping backend. Any response (even an error) means it is awake.
export function wakeServer() {
  api.get("/auth/login").catch(() => {});
}

export default api;