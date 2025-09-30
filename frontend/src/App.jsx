import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AwardPoints from "@/pages/admin/AwardPoints";
import PointBreakdown from "@/pages/student/PointBreakdown";
import Layout from "@/components/common/Layout"; // <-- Import Layout

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout activePage="Dashboard">
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Student Point Breakdown */}
        <Route
          path="/student/point-breakdown"
          element={
            <ProtectedRoute>
              <Layout activePage="Breakdown">
                <PointBreakdown />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Award Points */}
        <Route
          path="/admin/award-points"
          element={
            <ProtectedRoute>
              <Layout activePage="AwardPoints">
                <AwardPoints />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
