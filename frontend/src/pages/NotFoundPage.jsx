// src/pages/NotFoundPage.jsx
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-lg text-gray-700 mb-6">
        Oops! The page you are looking for doesn’t exist.
      </p>
      <Link
        to="/"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
