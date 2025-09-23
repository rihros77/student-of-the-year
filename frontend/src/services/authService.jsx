import api from "@/services/api";

const TOKEN_KEY = "token";

// ✅ Save token
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// ✅ Get token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// ✅ Remove token
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

// ✅ Login API
export async function login(username, password) {
  const res = await api.post("/auth/login", { username, password });
  saveToken(res.data.token);
  return res.data; // { token, user }
}

// ✅ Register API
export async function register(userData) {
  const res = await api.post("/auth/register", userData);
  return res.data;
}
