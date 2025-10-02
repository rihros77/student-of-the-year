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

export default function DashboardPage() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentId = getStudentId(); // may be null for admins

  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) {
        setLoading(false); // nothing to fetch for admin
        return;
      }

      try {
        const data = await getStudentProfile(studentId);
        console.log("✅ Full Student API response:", data); // Debug
        setStudent(data);
      } catch (err) {
        console.error("❌ Failed to fetch student data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  if (loading) return <LoadingSpinner />;

  // Admin view (no student data)
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

  // ✅ Handle both cases: student has totals nested, or flat fields
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
  const activities = student.transactions?.slice(0, 10) || [];

  const pointsData = [
    { category: "Academics", points: totals.academics_points },
    { category: "Sports", points: totals.sports_points },
    { category: "Cultural", points: totals.cultural_points },
    { category: "Technical", points: totals.technical_points },
    { category: "Social", points: totals.social_points },
  ];

  return (
    <>
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
          value={activities.length}
          progress={Math.min(Math.round((activities.length / 12) * 100), 100)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-medium mb-4">Recent Activity</h2>
          {activities.length > 0 ? (
            <ul className="space-y-4">
              {activities.map((a) => (
                <li key={a.id} className="flex flex-col text-sm">
                  <span>
                    {a.icon || "📌"} {a.reason}{" "}
                    {a.event_title ? `- ${a.event_title}` : ""}
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

