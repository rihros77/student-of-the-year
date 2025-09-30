import React, { useState, useEffect } from "react";
import { BookOpen, Dumbbell, Music, Code, Users, Star, Loader2, AlertTriangle } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000/api";
const PLACEHOLDER_STUDENT_ID = 1;

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") return {};
  return response.json();
}

const CATEGORY_MAP = [
  { key: "academics_points", label: "Academics", icon: BookOpen, color: "bg-blue-500" },
  { key: "sports_points", label: "Sports", icon: Dumbbell, color: "bg-green-500" },
  { key: "cultural_points", label: "Cultural", icon: Music, color: "bg-purple-500" },
  { key: "technical_points", label: "Technical", icon: Code, color: "bg-red-500" },
  { key: "social_points", label: "Social/Community", icon: Users, color: "bg-yellow-500" },
];

const PointBar = ({ value, maxValue, color }) => {
  const width = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
        style={{ width: `${width}%` }}
        title={`${value} points (${width.toFixed(1)}%)`}
      ></div>
    </div>
  );
};

export default function PointBreakdown() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`${API_BASE_URL}/students/${PLACEHOLDER_STUDENT_ID}`);
      setStudent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!student || !student.total) return <NoData />;

  const totals = student.total;
  const allCategoryPoints = CATEGORY_MAP.map((c) => totals[c.key] || 0);
  const maxCategoryPoints = Math.max(...allCategoryPoints, 1);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
        {student.name}'s Point Breakdown
      </h1>

      <div className="mb-8 p-6 bg-indigo-600 text-white rounded-xl shadow-2xl flex justify-between items-center transform transition duration-500 hover:scale-[1.01]">
        <div>
          <p className="text-sm font-medium opacity-80">Total Composite Score</p>
          <p className="text-5xl font-bold mt-1 tracking-tight">{totals.composite_points}</p>
        </div>
        <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Points by Category</h2>
        <div className="space-y-4">
          {CATEGORY_MAP.map((category) => {
            const points = totals[category.key] || 0;
            return (
              <div
                key={category.key}
                className="p-4 border border-gray-100 rounded-lg transition duration-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <category.icon
                      className={`w-6 h-6 ${category.color} p-1 rounded-full text-white mr-3`}
                    />
                    <span className="text-lg font-medium text-gray-700">{category.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{points}</span>
                </div>
                <PointBar value={points} maxValue={maxCategoryPoints} color={category.color} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 p-4 bg-white rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Student Information</h3>
        <p>
          <strong>Student Roll:</strong> {student.student_id}
        </p>
        <p>
          <strong>Department:</strong> {student.department?.name || "N/A"}
        </p>
        <p>
          <strong>Academic Year:</strong> {student.year}
        </p>
      </div>
    </div>
  );
}

// --- Loading / Error / No Data Components ---
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="animate-spin text-indigo-600 h-8 w-8" />
    <span className="ml-3 text-lg text-gray-600">Loading Student Points...</span>
  </div>
);

const Error = ({ message }) => (
  <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl shadow-lg m-4">
    <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
    <h2 className="text-xl font-semibold text-red-700">Error Loading Data</h2>
    <p className="text-red-600 mt-2">{message}</p>
  </div>
);

const NoData = () => (
  <div className="p-8 text-center bg-yellow-50 border border-yellow-200 rounded-xl shadow-lg m-4">
    <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
    <h2 className="text-xl font-semibold text-yellow-700">No Data Found</h2>
  </div>
);
