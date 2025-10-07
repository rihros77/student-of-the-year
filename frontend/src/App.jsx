import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AwardPoints from "@/pages/admin/AwardPoints";
import ManageEvents from "@/pages/admin/ManageEvents";
import RevealPage from "@/pages/admin/RevealPage"; // <-- New Reveal page
import PointBreakdown from "@/pages/student/PointBreakdown";
import PointTimeline from "@/pages/student/PointTimeline";
import Layout from "@/components/common/Layout";

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

        {/* Student Point Timeline */}
        <Route
          path="/student/point-timeline"
          element={
            <ProtectedRoute>
              <Layout activePage="Timeline">
                <PointTimeline />
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

        {/* Admin Manage Events */}
        <Route
          path="/admin/manage-events"
          element={
            <ProtectedRoute>
              <Layout activePage="AdminEvents">
                <ManageEvents />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Big-Screen Reveal */}
        <Route
          path="/admin/reveal"
          element={
            <ProtectedRoute>
              <Layout activePage="Reveal">
                <RevealPage />
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
