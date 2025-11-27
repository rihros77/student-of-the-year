import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  // ------------------------
  // Fetch notifications
  // ------------------------
  const fetchNotifications = async () => {
    if (!token || !isAdmin) return;

    console.log("Fetching notifications with token:", token);
    console.log("User:", user);
    console.log("Is admin?", isAdmin);

    try {
      const res = await axios.get(
        "http://localhost:8000/api/events/participation_logs",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const logs = res.data;
      setNotifications(logs);

      const count = logs.filter((n) => !n.seen).length;
      setUnreadCount(count);

      console.log("Notifications fetched:", logs);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // ------------------------
  // Mark notifications as seen
  // ------------------------
  const markSeen = async () => {
    if (!token) return;

    console.log("Marking notifications as seen with token:", token);

    try {
      const res = await axios.patch(
        "http://localhost:8000/api/events/notifications/mark_seen",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUnreadCount(0);
      console.log("Notifications marked as seen:", res.data);
    } catch (err) {
      console.error("Error marking notifications as seen:", err);
    }
  };

  // ------------------------
  // Auto-refresh
  // ------------------------
  useEffect(() => {
    fetchNotifications();
    if (token && isAdmin) {
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [token, isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) markSeen(); // mark seen when opening dropdown
        }}
        className="hover:bg-gray-100 p-2 rounded-full transition duration-150 relative"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-2 border border-gray-200 z-10">
          <h4 className="font-semibold text-gray-700 mb-2">
            Recent Participations
          </h4>

          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400">No new alerts</p>
          ) : (
            notifications.slice(0, 10).map((n, i) => (
              <div key={i} className="text-sm text-gray-600 border-b py-1">
                <b>{n.student_name}</b> participated in <b>{n.event_title}</b>
                <div className="text-xs text-gray-400">
                  {n.timestamp !== "—"
                    ? new Date(n.timestamp).toLocaleString()
                    : ""}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
