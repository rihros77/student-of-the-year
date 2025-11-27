import React, { useState, useEffect } from "react";
import axios from "axios";
import { CalendarDays, Trophy, Loader2 } from "lucide-react";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [participated, setParticipated] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get student
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }
  const studentId = user?.id;

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/events/");
        setEvents(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 🔥 Fetch past participations so buttons stay disabled
  useEffect(() => {
    if (!studentId) return;

    const fetchParticipations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/events/participated/${studentId}`
        );

        const map = {};
        res.data.forEach((eventId) => (map[eventId] = true));
        setParticipated(map);
      } catch (err) {
        console.error("Error fetching participation list:", err);
      }
    };

    fetchParticipations();
  }, [studentId]);

  // Handle participation
  const handleParticipate = async (eventId) => {
    if (!studentId) {
      alert("❌ Student ID not found. Please log in.");
      return;
    }

    const payload = {
      student_id: Number(studentId),
      event_id: Number(eventId),
    };

    try {
      await axios.post("http://localhost:8000/api/events/participate", payload, {
        headers: { "Content-Type": "application/json" },
      });

      // 🚀 Update UI immediately
      setParticipated((prev) => ({
        ...prev,
        [eventId]: true,
      }));

      alert("✅ Participation registered!");
    } catch (err) {
      const message =
        err.response?.data?.detail || "Failed to register participation.";

      // If already participated → update UI
      if (message.includes("Already registered")) {
        setParticipated((prev) => ({
          ...prev,
          [eventId]: true,
        }));
      }

      alert(`❌ ${message}`);
    }
  };

  // Sort events
  const now = new Date();
  const pastEvents = events.filter((e) => new Date(e.date) < now);
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now);

  // Loading
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Loader2 className="animate-spin mb-3" size={40} />
        <p>Loading events...</p>
      </div>
    );

  // Error
  if (error)
    return (
      <div className="text-center p-8 bg-red-50 text-red-600 rounded-xl">
        {error}
      </div>
    );

  return (
    <div className="p-6 md:p-10 min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <CalendarDays className="text-[#736CED]" size={28} /> Events
          </h1>
        </div>

        {/* Upcoming Events */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Upcoming Events
          </h2>

          {upcomingEvents.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-xl shadow-inner border border-dashed border-gray-300">
              <Trophy className="mx-auto text-gray-400" size={48} />
              <h2 className="mt-4 text-xl font-semibold text-gray-700">
                No Upcoming Events
              </h2>
              <p className="text-gray-500">Check back soon for new events!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {upcomingEvents.map((e) => (
                <div
                  key={e.id}
                  className="bg-white border border-gray-200 p-5 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
                      {e.title}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E5E7EB] text-gray-600">
                      {e.category || "General"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {e.description || "No description available."}
                  </p>

                  <div className="border-t border-dashed border-gray-100 pt-2">
                    <p className="text-xs text-gray-500">
                      📅 {new Date(e.date).toLocaleDateString()}
                    </p>

                    <button
                      disabled={participated[e.id]}
                      onClick={() => handleParticipate(e.id)}
                      className={`mt-3 w-full px-4 py-2 rounded-md shadow-md transition
                        ${
                          participated[e.id]
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-[#736CED] text-white hover:bg-[#635BDB]"
                        }
                      `}
                    >
                      {participated[e.id] ? "Participated" : "Participate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Past Events
          </h2>

          {pastEvents.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-xl shadow-inner border border-dashed border-gray-300">
              <Trophy className="mx-auto text-gray-400" size={48} />
              <h2 className="mt-4 text-xl font-semibold text-gray-700">
                No Past Events
              </h2>
              <p className="text-gray-500">
                Once events finish, they’ll appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pastEvents.map((e) => (
                <div
                  key={e.id}
                  className="bg-white border border-gray-200 p-5 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
                      {e.title}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {e.category || "General"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {e.description || "No description provided."}
                  </p>

                  <div className="border-t border-dashed border-gray-100 pt-2">
                    <p className="text-xs text-gray-500">
                      📅 {new Date(e.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Completed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EventsPage;
