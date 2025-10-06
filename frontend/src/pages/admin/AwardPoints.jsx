import React, { useState, useEffect, useCallback } from 'react';
import { Search, Send, X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
// Fallback for app ID
const userId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; 

/**
 * Utility function to handle API calls with fetch and error handling.
 */
async function apiFetch(url, options = {}) {
  const token = "mock_admin_token";
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Server Error: ${response.status}`);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }
    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
}

const CATEGORIES = [
  { value: 'academics', label: 'Academics' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'technical', label: 'Technical' },
  { value: 'social', label: 'Social' },
];

function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);
  return { toast, showToast, setToast };
}

export default function AwardPoints() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [events, setEvents] = useState([]);
  const [awardData, setAwardData] = useState({
    student_id: null,
    event_id: '',
    points: 10,
    category: CATEGORIES[0].value,
    reason: '',
  });

  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { toast, showToast, setToast } = useToast();

  // Fetch events on load
  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await apiFetch(`${API_BASE_URL}/events/`);
        const mapped = data.map(ev => ({
          ...ev,
          title: ev.title || ev.name, // Map name → title
          participation_points: ev.participation_points || ev.points_awarded // Map points_awarded
        }));
        setEvents(mapped);
      } catch (error) {
        showToast(`Failed to load events: ${error.message}`, 'error');
      }
    }
    fetchEvents();
  }, [showToast]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setAwardData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  // -------------------- Student Search --------------------
  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSelectedStudent(null);
      return;
    }
    setSearchLoading(true);
    try {
      const data = await apiFetch(`${API_BASE_URL}/students/${encodeURIComponent(searchTerm.trim())}`);
      if (data.id) setSearchResults([data]);
      else if (Array.isArray(data) && data.length) setSearchResults(data);
      else setSearchResults([]);
    } catch (error) {
      if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
        setSearchResults([]);
        setSelectedStudent(null);
        showToast(`No student found: ${searchTerm}`, 'info');
      } else {
        showToast(`Search failed: ${error.message}`, 'error');
      }
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm, showToast]);

  const selectStudent = useCallback((student) => {
    setSelectedStudent(student);
    setAwardData(prev => ({ ...prev, student_id: student.id }));
    setSearchResults([]);
    setSearchTerm(student.student_id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedStudent(null);
    setSearchTerm('');
    setAwardData(prev => ({ ...prev, student_id: null, reason: '', points: 10, event_id: '' }));
  }, []);

  // -------------------- Submit --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || loading) return;

    setLoading(true);
    setToast(null);

    const payload = {
      student_id: awardData.student_id,
      event_id: parseInt(awardData.event_id), // Ensure number
      points: awardData.points,
      category: awardData.category,
      reason: awardData.reason.trim() || `Points awarded for event ID ${awardData.event_id}`,
    };

    if (payload.points <= 0 || !payload.event_id) {
      setLoading(false);
      showToast('Please enter a positive point value and select an event.', 'error');
      return;
    }

    try {
      await apiFetch(`${API_BASE_URL}/events/award_points`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showToast(`Awarded ${payload.points} points to ${selectedStudent.name} (${selectedStudent.student_id})!`, 'success');
      clearSelection();
    } catch (error) {
      showToast(`Point award failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const ToastMessage = () => {
    if (!toast) return null;
    const Icon = toast.type === 'success' ? CheckCircle : (toast.type === 'error' ? AlertTriangle : Search);
    const color = toast.type === 'success' ? 'bg-green-500' : (toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500');
    return (
      <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg text-white shadow-xl flex items-center gap-3 transition-all duration-300 transform ${color}`}>
        <Icon size={20} />
        <span>{toast.message}</span>
        <button onClick={() => setToast(null)} className="ml-4 opacity-75 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    );
  };

  const selectedEvent = events.find(e => e.id === parseInt(awardData.event_id));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <ToastMessage />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Admin Point Award Center</h1>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100">

          {/* Student Search */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
              <Search size={24} className="mr-2"/> 1. Select Student
            </h2>

            {!selectedStudent ? (
              <form onSubmit={handleSearch} className="flex gap-2 mb-4 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter Student ID or Roll Number"
                  className="flex-grow p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={searchLoading}
                />
                <button
                  type="submit"
                  disabled={searchLoading || !searchTerm.trim()}
                  className="px-4 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center min-w-[100px]"
                >
                  {searchLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                </button>

                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 border border-gray-300 rounded-lg max-h-48 overflow-y-auto shadow-lg mt-1 z-10 bg-white">
                    {searchResults.map(student => (
                      <div key={student.id} onClick={() => selectStudent(student)}
                        className="p-3 border-b border-gray-100 cursor-pointer hover:bg-indigo-50 transition">
                        <p className="font-semibold text-gray-800">{student.name} ({student.student_id})</p>
                        <p className="text-sm text-gray-500">{student.department?.name || 'N/A'}, Year {student.year}</p>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            ) : (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex justify-between items-center shadow-md">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">Student Selected:</p>
                  <p className="text-lg font-bold text-gray-900">{selectedStudent.name}</p>
                  <p className="text-sm text-gray-600">{selectedStudent.student_id} | Year {selectedStudent.year} | {selectedStudent.department?.name || 'N/A'}</p>
                </div>
                <button onClick={clearSelection} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition" aria-label="Clear selection">
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Award Points Form */}
          <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
            <Send size={24} className="mr-2"/> 2. Award Points
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Dropdown */}
              <div>
                <label htmlFor="event_id" className="block text-sm font-medium text-gray-700 mb-1">Select Event (Required)</label>
                <select
                  id="event_id"
                  name="event_id"
                  value={awardData.event_id}
                  onChange={(e) => setAwardData(prev => ({ ...prev, event_id: Number(e.target.value) }))}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-white"
                  required
                  disabled={!selectedStudent || events.length === 0}
                >
                  <option value="" disabled>-- Choose an Event --</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title} (ID: {event.id})
                    </option>
                  ))}
                </select>
                {selectedEvent && (
                  <p className="text-xs text-gray-500 mt-1">Default participation points: {selectedEvent.participation_points}</p>
                )}
                {events.length === 0 && <p className="text-sm text-red-500 mt-2">No events available. Please create one in the backend.</p>}
              </div>

              {/* Points Input */}
              <div>
                <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">Points to Award (Required)</label>
                <input
                  type="number"
                  id="points"
                  name="points"
                  min="1"
                  value={awardData.points}
                  onChange={handleChange}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={!selectedStudent}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Point Category</label>
              <select
                id="category"
                name="category"
                value={awardData.category}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-white"
                disabled={!selectedStudent}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason / Description</label>
              <textarea
                id="reason"
                name="reason"
                value={awardData.reason}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 resize-none"
                disabled={!selectedStudent}
              />
            </div>

            <button
              type="submit"
              disabled={!selectedStudent || loading || !awardData.points || !awardData.event_id}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition transform hover:scale-[1.01] active:scale-95"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              {loading ? 'Processing...' : `Award ${awardData.points || 0} Points`}
            </button>

            {!selectedStudent && (
              <p className="text-center text-red-500 font-medium pt-2">
                Please search for and select a student above to enable the award form.
              </p>
            )}
          </form>
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          User ID: {userId} (Simulated)
        </p>
      </div>
    </div>
  );
}
