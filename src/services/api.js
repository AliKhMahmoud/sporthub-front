import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true, // هذه هي الأساس والأهم لتنتقل الـ Cookies تلقائياً بين Vercel و Render
});

export default api;