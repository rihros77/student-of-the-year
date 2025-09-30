import React, { useState, useEffect, useCallback } from 'react';
import { Search, Send, X, AlertTriangle, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
 // Adjust if your backend URL changes

/**
 * Utility function to handle API calls with fetch and error handling.
 */
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

const CATEGORIES = [
    { value: 'academics', label: 'Academics' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'technical', label: 'Technical' },
    { value: 'social', label: 'Social' },
];

export default function AwardPoints() {
    // Form States
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [events, setEvents] = useState([]);
    const [awardData, setAwardData] = useState({
        student_id: '',
        event_id: '',
        points: '',
        category: CATEGORIES[0].value,
        reason: '',
    });

    // UI/API States
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '...' }

    // --- Data Fetching ---

    const fetchEvents = useCallback(async () => {
        try {
            const data = await apiFetch(`${API_BASE_URL}/events`);
            setEvents(data);
            if (data.length > 0) {
                setAwardData(prev => ({ ...prev, event_id: data[0].id }));
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Failed to load events: ${error.message}` });
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // --- Search Logic ---

    const handleSearch = async (e) => {
        e.preventDefault();
        const studentIdToSearch = awardData.student_id;
        if (!studentIdToSearch) return;

        setLoading(true);
        setMessage(null);
        setSelectedStudent(null);

        try {
            // Note: Assuming you have a GET /api/students/{student_id} endpoint that takes the internal DB ID.
            // If it takes the college-roll number, you must adjust the backend router.
            const student = await apiFetch(`${API_BASE_URL}/students/${studentIdToSearch}`);
            setSelectedStudent(student);
            setMessage({ type: 'success', text: `Student found: ${student.name}` });
        } catch (error) {
            setMessage({ type: 'error', text: `Student not found with ID ${studentIdToSearch}.` });
        } finally {
            setLoading(false);
        }
    };

    // --- Submission Logic ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent || loading) return;

        setLoading(true);
        setMessage(null);

        const payload = {
            ...awardData,
            student_id: selectedStudent.id, // Use the actual DB ID from the selected student object
            event_id: parseInt(awardData.event_id),
            points: parseInt(awardData.points),
        };
        
        try {
            const result = await apiFetch(`${API_BASE_URL}/events/award_points`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            
            setMessage({ 
                type: 'success', 
                text: `Successfully awarded ${result.points} points to ${selectedStudent.name}. Transaction ID: ${result.id}` 
            });
            // Clear form fields after successful award
            setAwardData(prev => ({ ...prev, points: '', reason: '' })); 

        } catch (error) {
            setMessage({ type: 'error', text: `Failed to award points: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAwardData(prev => ({ ...prev, [name]: value }));
    };


    // --- UI Rendering ---

    return (
        <div className="min-h-full p-8 bg-gray-50">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Award Points Console</h1>
            <p className="text-gray-500 mb-8">Log achievement points to a student, which automatically updates the leaderboards.</p>
            
            {/* Status Message Display */}
            {message && (
                <div 
                    className={`p-4 rounded-lg flex items-center mb-6 shadow-md transition-opacity duration-300 ${
                        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                >
                    {message.type === 'success' ? <CheckCircle size={20} className="mr-3" /> : <AlertTriangle size={20} className="mr-3" />}
                    <span className="font-medium flex-grow">{message.text}</span>
                    <button onClick={() => setMessage(null)} className="ml-4 text-gray-600 hover:text-gray-900">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Student Search Panel */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-full">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">1. Find Student</h2>
                    
                    <form onSubmit={handleSearch} className="space-y-4">
                        <label htmlFor="student_id_search" className="block text-sm font-medium text-gray-700">Student ID (DB ID or Roll Number)</label>
                        <div className="flex">
                            <input
                                id="student_id_search"
                                type="text"
                                name="student_id"
                                value={awardData.student_id}
                                onChange={handleChange}
                                required
                                placeholder="Enter Student ID"
                                className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-3 bg-[#736CED] text-white font-medium rounded-r-lg hover:bg-indigo-600 disabled:opacity-50 transition"
                            >
                                {loading ? 'Searching...' : <Search size={20} />}
                            </button>
                        </div>
                    </form>

                    {selectedStudent && (
                        <div className="mt-6 p-4 border-l-4 border-[#736CED] bg-[#F5F5FF] rounded-lg shadow-inner">
                            <h3 className="font-bold text-[#736CED] text-lg">{selectedStudent.name}</h3>
                            <p className="text-sm text-gray-600">ID: {selectedStudent.student_id}</p>
                            <p className="text-sm text-gray-600">Dept: {selectedStudent.department?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">Year: {selectedStudent.year}</p>
                            <p className="mt-2 text-xs font-semibold text-gray-500">
                                Ready to award points.
                            </p>
                        </div>
                    )}
                    {!selectedStudent && awardData.student_id && (
                        <p className="mt-6 text-sm text-gray-500">Search for a student to enable the point award form.</p>
                    )}
                </div>

                {/* 2. Award Form Panel */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">2. Award Details</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Event Selector */}
                        <div>
                            <label htmlFor="event_id" className="block text-sm font-medium text-gray-700">Select Event</label>
                            <select
                                id="event_id"
                                name="event_id"
                                value={awardData.event_id}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={!selectedStudent || events.length === 0}
                            >
                                {events.length === 0 ? (
                                    <option value="">No events available</option>
                                ) : (
                                    events.map(event => (
                                        <option key={event.id} value={event.id}>{event.title} (ID: {event.id})</option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Category Selector */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Point Category</label>
                            <select
                                id="category"
                                name="category"
                                value={awardData.category}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={!selectedStudent}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Points Input */}
                        <div>
                            <label htmlFor="points" className="block text-sm font-medium text-gray-700">Points Awarded</label>
                            <input
                                id="points"
                                type="number"
                                name="points"
                                value={awardData.points}
                                onChange={handleChange}
                                required
                                min="1"
                                placeholder="e.g., 50"
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={!selectedStudent}
                            />
                        </div>
                        
                        {/* Reason/Description */}
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason / Description (e.g., 1st Place - Robotics Competition)</label>
                            <textarea
                                id="reason"
                                name="reason"
                                value={awardData.reason}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Provide a brief reason for the point award."
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                disabled={!selectedStudent}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!selectedStudent || loading || !awardData.points}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition"
                        >
                            <Send size={20} />
                            {loading ? 'Processing...' : `Award ${awardData.points || 0} Points`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
