import axios from "axios";

// Locally this is http://localhost:8080. On Vercel we set VITE_API_URL to the Render backend address.
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${baseUrl}/api`,
});

// Attach the saved login token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;