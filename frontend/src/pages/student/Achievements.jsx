import React, { useState } from "react";
import { Award, Trophy } from "lucide-react";

const Achievements = ({ achievements = [] }) => {
  const [filter, setFilter] = useState("all"); // 'events', 'certificates', 'milestones', 'all'

  // Filtered achievements
  const filteredAchievements =
    filter === "all"
      ? achievements
      : achievements.filter(
          (a) => a.category?.toLowerCase() === filter
        );

  // Helper for active button class
  const getButtonClass = (f) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      filter === f
        ? "bg-[#736CED] text-white shadow-md hover:bg-[#635BDB]"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div className="p-6 md:p-10 min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <Award className="text-[#736CED]" size={28} /> My Achievements
          </h1>
        </div> */}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {["all", "events", "certificates", "milestones"].map((f) => (
            <button
              key={f}
              className={getButtonClass(f)}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievements List */}
        {filteredAchievements.length === 0 ? (
          <div className="text-center p-16 bg-white rounded-xl shadow-inner border border-dashed border-gray-300">
            <Trophy className="mx-auto text-gray-400" size={48} />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">
              No Achievements Yet
            </h2>
            <p className="text-gray-500">
              Achievements will appear here when available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAchievements.map((ach) => (
              <div
                key={ach.id}
                className="bg-white border border-gray-200 p-5 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg text-gray-800 line-clamp-2">
                    {ach.title || "Untitled Achievement"}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E5E7EB] text-gray-600">
                    {ach.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {ach.description || "No description provided."}
                </p>

                <div className="mt-4 pt-3 border-t border-dashed border-gray-100 space-y-1">
                  {ach.points && ach.points > 0 && (
                    <p className="text-sm text-green-600 font-semibold">
                      🌟 {ach.points} Points Awarded
                    </p>
                  )}
                  {ach.position && ach.position !== "N/A" && (
                    <p className="text-sm text-amber-600 font-semibold">
                      🏆 Position: {ach.position}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Date Earned:{" "}
                    {ach.date ? new Date(ach.date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
