// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { getToken, logout as logoutService } from "@/services/authService";
import { jwtDecode } from "jwt-decode"; // Fixed import

// Create context
const AuthContext = createContext();

// Hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Helper function to decode and extract user data (role, username, etc.)
const decodeToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // Ensure your JWT payload includes 'role' and 'username'
    return {
      role: decoded.role,
      username: decoded.username,
      // You can add student_id, email, etc., here too
    };
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

// Provider component
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // State for user data

  // Load token and user data from localStorage on mount
  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      setToken(savedToken);
      // Decode and set user data
      setUser(decodeToken(savedToken));
    }
  }, []);

  // Save token to localStorage and state
  const login = (newToken) => {
    if (!newToken) return;

    localStorage.setItem("token", newToken);
    setToken(newToken);

    // Decode and store user data on login
    setUser(decodeToken(newToken));
  };

  // Logout user
  const logout = () => {
    logoutService();
    localStorage.removeItem("token");
    setToken(null);
    setUser(null); // Clear user data on logout
  };

  // Expose 'user' data in the context value
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
