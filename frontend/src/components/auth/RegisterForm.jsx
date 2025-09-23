import { useState } from "react";
import { register } from "@/services/authService";

export default function RegisterForm() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = formData;

    if (!username.trim() || !password.trim()) {
      setMessage("❌ Please fill in both username and password.");
      return;
    }

    try {
      const res = await register({ username: username.trim(), password: password.trim() });

      if (res?.id) {
        setMessage("✅ Registered successfully! You can now login.");
        setFormData({ username: "", password: "" });
      } else {
        setMessage("❌ Registration failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto p-6 bg-white shadow-md rounded-xl space-y-4"
    >
      <h2 className="text-xl font-bold text-center">Register</h2>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
      >
        Register
      </button>
      {message && <p className="text-center mt-2">{message}</p>}
    </form>
  );
}
