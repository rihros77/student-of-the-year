// src/components/common/NotificationBell.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  
  // Get the token and user role from your context
  const { token, user } = useAuth();
  
  // Check if the current user is an admin
  const isAdmin = user?.role === 'admin'; 

  // Fetch participation logs from backend
  const fetchNotifications = async () => {
    
    // Check if token exists AND user is an admin before making the request
    if (!token || !isAdmin) {
        return; 
    }
    
    try {
      // 🌟 FIX APPLIED HERE 🌟: Correctly using the full API path: /api/events/participation_logs
      const res = await axios.get("http://localhost:8000/api/events/participation_logs", {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

      setNotifications(res.data);
    } catch (err) {
      console.error("❌ Error fetching logs:", err.response?.status || err.message);
    }
  };

  // Initial fetch and polling every 10 seconds
  useEffect(() => {
    fetchNotifications(); 
    
    if (token && isAdmin) {
      const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
      return () => clearInterval(interval); // cleanup on unmount
    }
    return;
  }, [token, isAdmin]);

  // Do not render the bell at all if the user is not an Admin
  if (!isAdmin) {
    return null; 
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="hover:bg-gray-100 p-2 rounded-full transition duration-150 relative"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
              {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-2 border border-gray-200 z-10">
          <h4 className="font-semibold text-gray-700 mb-2">Recent Participations</h4>

          {notifications.length === 0 && (
            <p className="text-sm text-gray-400">No new alerts</p>
          )}

          {notifications.slice(0, 10).map((n, i) => (
            <div key={i} className="text-sm text-gray-600 border-b py-1">
              <b>{n.student_name}</b> participated in <b>{n.event_title}</b>
              <div className="text-xs text-gray-400">
                {n.timestamp !== "—" ? new Date(n.timestamp).toLocaleString() : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
