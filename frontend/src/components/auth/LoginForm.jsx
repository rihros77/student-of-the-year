import { useState } from "react";
import { login as loginApi } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // context function to save token

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!username.trim() || !password.trim()) {
      alert("Please enter both username and password");
      return;
    }

    try {
      // Call backend login endpoint
      const res = await loginApi(username.trim(), password.trim());

      // Save JWT token in context
      login(res.token);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md" // Changed to max-w-md
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 mb-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}