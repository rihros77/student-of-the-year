import axios from "axios";
import { getToken } from "@/services/authService";

// ✅ Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach JWT token if exists
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ API calls
export const getLeaderboard = async () => {
  try {
    const res = await API.get("/leaderboard/");
    return res.data;
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return [];
  }
};

export const getStudentProfile = async (studentId) => {
  try {
    const res = await API.get(`/students/${studentId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching student profile:", err);
    return null;
  }
};

export default API;
