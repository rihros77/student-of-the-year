import { createContext, useContext, useState, useEffect } from "react";
import { getToken, logout as logoutService } from "@/services/authService";

// Create context
const AuthContext = createContext();

// Hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Save token to localStorage and state
  const login = (newToken) => {
    if (!newToken) return;
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // Logout user
  const logout = () => {
    logoutService(); // optional API call to invalidate token
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
