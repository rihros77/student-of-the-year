import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit3, Trash2, X, AlertTriangle, CheckCircle, Loader2, Calendar, List } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const DEFAULT_EVENT_DATA = {
    title: '',
    category: 'academics',
    date: new Date().toISOString().substring(0, 10), // YYYY-MM-DD
    participation_points: 10,
    winner_points: 50,
    description: '',
};

const CATEGORIES = [
    { value: 'academics', label: 'Academics' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'technical', label: 'Technical' },
    { value: 'social', label: 'Social' },
];

/** Utility for API calls with readable errors */
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
            const errorData = await response.json().catch(() => ({}));
            const message =
                errorData.detail ||
                (errorData.errors ? JSON.stringify(errorData.errors) : null) ||
                JSON.stringify(errorData) ||
                `HTTP error ${response.status}`;
            throw new Error(message);
        }
        if (response.status === 204) return null;
        return response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
}

/** Toast hook */
function useToast() {
    const [toast, setToast] = useState(null);
    const showToast = useCallback((message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    }, []);
    return { toast, showToast, setToast };
}

/** Event Modal */
const EventFormModal = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState(initialData || DEFAULT_EVENT_DATA);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            const dateStr = initialData.date ? initialData.date.substring(0, 10) : new Date().toISOString().substring(0, 10);
            setFormData({ 
                ...DEFAULT_EVENT_DATA,
                ...initialData,
                date: dateStr,
                title: initialData.title || '',
                description: initialData.description || '',
            });
        } else {
            setFormData(DEFAULT_EVENT_DATA);
        }
    }, [initialData]);

    if (!isOpen) return null;
    const isEditMode = initialData && initialData.id;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            title: formData.title.trim(),
            category: formData.category || 'academics',
            date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
            participation_points: Number(formData.participation_points) || 0,
            winner_points: Number(formData.winner_points) || 0,
            description: formData.description || '',
        };
        if (isEditMode && formData.id) payload.id = formData.id;

        try {
            await onSave(payload, isEditMode);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Event' : 'Create New Event'}</h3>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Event Name (Required)</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Annual Sports Day"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                                disabled={loading}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="participation_points" className="block text-sm font-medium text-gray-700 mb-1">Participation Points</label>
                            <input
                                type="number"
                                id="participation_points"
                                name="participation_points"
                                min="0"
                                value={formData.participation_points}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="winner_points" className="block text-sm font-medium text-gray-700 mb-1">Winner/Bonus Points</label>
                            <input
                                type="number"
                                id="winner_points"
                                name="winner_points"
                                min="0"
                                value={formData.winner_points}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Brief summary of the event."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !formData.title.trim() || formData.participation_points === null}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition transform active:scale-95"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : (isEditMode ? <Edit3 size={20} /> : <Plus size={20} />)}
                        {loading ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
                    </button>
                </form>
            </div>
        </div>
    );
};

/** Main Component */
export default function ManageEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const { toast, showToast, setToast } = useToast();

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`${API_BASE_URL}/events/`);
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setEvents(data);
        } catch (error) {
            showToast(`Failed to load events: ${error.message}`, 'error');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const handleOpenCreate = () => { setCurrentEvent(null); setIsModalOpen(true); };
    const handleOpenEdit = (event) => { setCurrentEvent(event); setIsModalOpen(true); };

    const handleSave = async (payload, isEditMode) => {
        try {
            if (isEditMode) {
                await apiFetch(`${API_BASE_URL}/events/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
                showToast(`Event '${payload.title}' updated successfully!`, 'success');
            } else {
                const newEvent = await apiFetch(`${API_BASE_URL}/events/`, { method: 'POST', body: JSON.stringify(payload) });
                showToast(`Event '${newEvent.title}' created successfully!`, 'success');
            }
            fetchEvents();
        } catch (error) {
            console.error("Event save failed:", error);
            showToast(`Failed to save event: ${error.message}`, 'error');
            throw error;
        }
    };

    const handleDelete = async (eventId, eventTitle) => {
        if (!window.confirm(`Are you sure you want to delete the event: "${eventTitle}"? This will also remove all associated point transactions.`)) return;
        try {
            await apiFetch(`${API_BASE_URL}/events/${eventId}`, { method: 'DELETE' });
            showToast(`Event '${eventTitle}' deleted.`, 'success');
            fetchEvents();
        } catch (error) {
            showToast(`Failed to delete event: ${error.message}`, 'error');
        }
    };

    const ToastMessage = useMemo(() => {
        if (!toast) return null;
        const Icon = toast.type === 'success' ? CheckCircle : (toast.type === 'error' ? AlertTriangle : List);
        const color = toast.type === 'success' ? 'bg-green-500' : (toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500');
        return (
            <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg text-white shadow-xl flex items-center gap-3 transition-all duration-300 transform ${color}`}>
                <Icon size={20} />
                <span>{toast.message}</span>
                <button onClick={() => setToast(null)} className="ml-4 opacity-75 hover:opacity-100"><X size={16} /></button>
            </div>
        );
    }, [toast, setToast]);

    const formatPoints = (points) => (points > 0 ? `+${points}` : '0');
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch { return dateString.substring(0, 10); }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter']">
            {ToastMessage}
            <div className="max-w-6xl mx-auto">
                {/* Title removed from here to be placed in the Header component */}
                
                <div className="flex justify-end mb-6">
                    <button onClick={handleOpenCreate} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 transition transform active:scale-95">
                        <Plus size={20} /> Add New Event
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-indigo-500 flex justify-center items-center gap-2">
                            <Loader2 size={24} className="animate-spin" /> Loading Events...
                        </div>
                    ) : events.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <AlertTriangle size={36} className="mx-auto mb-3 text-yellow-500" />
                            <p className="text-xl font-semibold">No Events Found</p>
                            <p>Click "Add New Event" to start tracking achievements!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points (Part/Win)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {events.map((event) => (
                                        <tr key={event.id} className="hover:bg-indigo-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                                <div className="text-xs text-gray-500 md:hidden">ID: {event.id} | {event.category}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                                <span className="capitalize px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{event.category}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                                <div className="flex items-center"><Calendar size={14} className="mr-1 text-gray-400" />{formatDate(event.date)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                                <span className="text-green-600">{formatPoints(event.participation_points)}</span> / <span className="text-indigo-600">{formatPoints(event.winner_points)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleOpenEdit(event)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-gray-100 transition" title="Edit Event">
                                                    <Edit3 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(event.id, event.title)} className="ml-2 text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-gray-100 transition" title="Delete Event">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <EventFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={currentEvent}
                onSave={handleSave}
            />
        </div>
    );
}