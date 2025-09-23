import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="font-bold text-lg">Student of the Year</h1>
      <nav className="space-x-4">
        {token ? (
          <>
            <Link
              to="/dashboard"
              className="hover:underline transition"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline transition">
              Login
            </Link>
            <Link to="/register" className="hover:underline transition">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
