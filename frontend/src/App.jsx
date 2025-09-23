import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/common/Header";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        
        {/* Remove flex items-center justify-center to prevent centering */}
        <main className="flex-grow p-6 w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;