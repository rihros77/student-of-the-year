import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, AlertTriangle, Calendar, TrendingUp, TrendingDown, X } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const PLACEHOLDER_STUDENT_ID = 1;

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);
  return { toast, showToast, setToast };
}

export default function PointTimeline() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast, setToast } = useToast();

  const fetchTimelineData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`${API_BASE_URL}/students/${PLACEHOLDER_STUDENT_ID}/timeline`);
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTimeline(data);
    } catch (error) {
      showToast(`Failed to load timeline: ${error.message}`, 'error');
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchTimelineData(); }, [fetchTimelineData]);

  const ToastMessage = useMemo(() => {
    if (!toast) return null;
    const color = toast.type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
      <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg text-white shadow-xl flex items-center gap-3 ${color}`}>
        <span>{toast.message}</span>
        <button onClick={() => setToast(null)} className="ml-4 opacity-75 hover:opacity-100"><X size={16} /></button>
      </div>
    );
  }, [toast, setToast]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateString.substring(0, 10); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {ToastMessage}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[20px] border border-gray-300 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-indigo-500 flex justify-center items-center gap-2">
              <Loader2 size={24} className="animate-spin" /> Loading Timeline...
            </div>
          ) : timeline.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <AlertTriangle size={36} className="mx-auto mb-3 text-yellow-500" />
              <p className="text-xl font-semibold">No Timeline Records</p>
              <p>Recent activities will appear here once points are awarded.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-[20px] overflow-hidden">
                <thead className="bg-[#F0F0F0]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeline.map((item) => (
                    <tr key={item.id} className="hover:bg-indigo-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center"><Calendar size={14} className="mr-1 text-gray-400" />{formatDate(item.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.event?.title || "Unnamed Event"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="capitalize px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        {item.points >= 0 ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <TrendingUp size={14} /> +{item.points}
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <TrendingDown size={14} /> {item.points}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
