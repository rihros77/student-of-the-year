// src/pages/HomePage.jsx

import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="p-6 w-full text-center"> {/* Remove max-w-4xl mx-auto */}
      <h1 className="text-3xl font-bold mb-4">Welcome to Student of the Year 🎓</h1>
      <p className="mt-2 text-gray-600 mb-6">
        Please login or register to continue.
      </p>
      <div className="flex justify-center space-x-4">
        <Link
          to="/login"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}