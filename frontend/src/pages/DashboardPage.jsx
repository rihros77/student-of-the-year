import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getStudentProfile } from "@/services/api";
import { getStudentId } from "@/services/authService";

// Helper component for statistics cards
function StatCard({ title, value, progress }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-xl font-semibold mt-1">{value}</p>
      <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(to right, #5B5B87, #9F9FED)",
          }}
        ></div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentId = getStudentId();

  // ✅ Fetch student profile
  const fetchStudent = async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getStudentProfile(studentId);
      console.log("✅ Full Student API response:", data);
      setStudent(data);
    } catch (err) {
      console.error("❌ Failed to fetch student data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial fetch + auto refresh every 10s
  useEffect(() => {
    fetchStudent();
    const interval = setInterval(fetchStudent, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [studentId]);

  if (loading) return <LoadingSpinner />;

  if (!student && !studentId) {
    return (
      <p className="text-center mt-6 text-gray-700">
        Welcome, Admin! Student-specific data is not available.
      </p>
    );
  }

  if (!student) {
    return (
      <p className="text-red-500 text-center mt-6">
        Failed to load student data.
      </p>
    );
  }

  // ✅ Extract totals safely
  const totals =
    student.total || {
      academics_points: student.academics_points || 0,
      sports_points: student.sports_points || 0,
      cultural_points: student.cultural_points || 0,
      technical_points: student.technical_points || 0,
      social_points: student.social_points || 0,
      composite_points:
        student.composite_points || student.total_points || 0,
    };

  const badges = student.badges || [];
  
  // ⭐️ CRITICAL FIX: Use 'point_transactions' property from the API
  const activities = student.point_transactions || []; 

  // ✅ Count unique events participated
  const uniqueEventIds = new Set(
    activities
      .map((a) => a.event_id)
      .filter((id) => id !== null && id !== undefined) // Ensure we only count transactions linked to an event
  );
  const eventCount = uniqueEventIds.size;

  const pointsData = [
    { category: "Academics", points: totals.academics_points },
    { category: "Sports", points: totals.sports_points },
    { category: "Cultural", points: totals.cultural_points },
    { category: "Technical", points: totals.technical_points },
    { category: "Social", points: totals.social_points },
  ];

  return (
    <>
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Points"
          value={totals.composite_points}
          progress={Math.min(
            Math.round((totals.composite_points / 1000) * 100),
            100
          )}
        />
        <StatCard
          title="Badges Earned"
          value={badges.length}
          progress={Math.min(Math.round((badges.length / 10) * 100), 100)}
        />
        <StatCard
          title="Events Participated"
          value={eventCount} 
          progress={Math.min(Math.round((eventCount / 12) * 100), 100)}
        />
      </div>

      {/* Charts + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Points Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-4 col-span-2">
          <h2 className="text-sm font-medium mb-4">Your Points Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pointsData}>
              <defs>
                <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9F9FED" stopOpacity={1} />
                  <stop offset="100%" stopColor="#5B5B87" stopOpacity={1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="category" />
              <YAxis domain={[0, 100]} ticks={[20, 40, 60, 80]} />
              <Tooltip />
              <Bar
                dataKey="points"
                fill="url(#pointsGradient)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-medium mb-4">Recent Activity</h2>
          {activities.length > 0 ? (
            <ul className="space-y-4">
              {/* Activities are already sorted by the backend query */}
              {activities
                .slice(0, 10)
                .map((a) => (
                  <li key={a.id} className="flex flex-col text-sm">
                    <span>
                      {a.icon || "📌"} {a.reason}{" "}
                      {/* Assuming event_title can be populated via SQLAlchemy if needed, 
                          but using reason as fallback */}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleString()
                        : "No date"}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p>No recent activity yet.</p>
          )}

          {/* Badges Section */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Badges Earned</h3>
            {badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-blue-100 px-2 py-1 rounded flex items-center gap-1"
                  >
                    {badge.icon_url && (
                      <img
                        src={badge.icon_url}
                        alt={badge.name}
                        className="w-5 h-5"
                      />
                    )}
                    <span className="text-xs font-semibold">{badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No badges earned yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}