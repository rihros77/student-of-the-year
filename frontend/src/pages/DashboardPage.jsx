import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard 🎉</h1>
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
