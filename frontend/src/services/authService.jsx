import api from "@/services/api";

const TOKEN_KEY = "token";
const STUDENT_ID_KEY = "studentId";

// ✅ Save JWT token
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// ✅ Get JWT token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// ✅ Remove token & student ID
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STUDENT_ID_KEY);
}

// ✅ Login API
export async function login(username, password) {
  const res = await api.post("/auth/login", { username, password });
  saveToken(res.data.access_token);

  // Save student ID only if it exists (students only)
  if (res.data.student_id) {
    localStorage.setItem(STUDENT_ID_KEY, res.data.student_id);
  } else {
    localStorage.removeItem(STUDENT_ID_KEY); // remove if admin
  }

  return res.data; // { access_token, username, role, [student_id] }
}

// ✅ Register API
export async function register(userData) {
  const res = await api.post("/auth/register", userData);
  return res.data;
}

// ✅ Get numeric student ID from localStorage
export function getStudentId() {
  const id = localStorage.getItem(STUDENT_ID_KEY);
  return id ? Number(id) : null;
}
