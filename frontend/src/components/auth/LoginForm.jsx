import { useState } from "react";
import { login as loginApi } from "@/services/authService";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/zoopla.png"; // import your logo

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const res = await loginApi(username.trim(), password.trim());
      login(res.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Logo + Heading */}
      <div className="text-center mb-8">
        <img
          src={logo}
          alt="Logo"
          className="h-16 w-28 sm:h-20 sm:w-40 object-contain mx-auto mb-4"
        />
        <h2 className="text-xl sm:text-2xl font-semibold">
          Login to <span className="font-bold">Student of the Year</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9F9FED]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9F9FED]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right mt-1">
            <Link
              to="/forgot-password"
              className="text-sm text-[#9F9FED] hover:text-[#736CED]"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#9F9FED] hover:bg-[#736CED] text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Log in
        </button>
      </form>

      {/* Sign Up */}
      <p className="mt-6 text-center text-sm">
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-[#9F9FED] hover:text-[#736CED] font-medium"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
