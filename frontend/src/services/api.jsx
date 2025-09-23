import axios from "axios";
import { getToken } from "@/services/authService";

// ✅ Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
