import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, BookOpen, Dumbbell, Music, Code, Users, Loader2, AlertTriangle } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
// NOTE: Using a placeholder ID (e.g., 1) for demonstration purposes.
const PLACEHOLDER_STUDENT_ID = 1;

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

    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {};
    }

    return response.json();
}

// Map point categories to visual icons and colors
const CATEGORY_ICONS = {
    academics: { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    sports: { icon: Dumbbell, color: 'text-green-600', bg: 'bg-green-100' },
    cultural: { icon: Music, color: 'text-purple-600', bg: 'bg-purple-100' },
    technical: { icon: Code, color: 'text-red-600', bg: 'bg-red-100' },
    social: { icon: Users, color: 'text-yellow-600', bg: 'bg-yellow-100' },
};

// Component to display a single transaction item in a timeline
const TransactionItem = ({ transaction, isLast }) => {
    const { points, category, reason, timestamp, event } = transaction;
    const categoryInfo = CATEGORY_ICONS[category.toLowerCase()] || { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' };
    const Icon = categoryInfo.icon;
    
    // Determine the type of transaction (award or deduction)
    const isPositive = points >= 0;
    const pointStyle = isPositive ? 'text-green-600' : 'text-red-600';
    const PointIcon = isPositive ? TrendingUp : TrendingDown;
    const formattedPoints = `${isPositive ? '+' : ''}${points}`;
    
    // Format the timestamp
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="relative pl-8 sm:pl-10 pb-8">
            {/* Vertical Line */}
            {!isLast && (
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            )}
            
            {/* Icon Circle */}
            <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${categoryInfo.bg}`}>
                <Icon className={`w-4 h-4 ${categoryInfo.color}`} />
            </div>

            {/* Content Card */}
            <div className="bg-white p-4 rounded-xl shadow-md transition duration-300 hover:shadow-lg border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                    {/* Points and Category */}
                    <div className="flex flex-col">
                        <span className={`text-xl font-bold ${pointStyle} flex items-center`}>
                            <PointIcon className="w-5 h-5 mr-1" />
                            {formattedPoints} Points
                        </span>
                        <span className="text-sm font-medium text-gray-500 capitalize">
                            Category: {category}
                        </span>
                    </div>

                    {/* Date and Time */}
                    <div className="text-right text-gray-400 text-sm">
                        <div className="font-semibold">{formattedDate}</div>
                        <div>{formattedTime}</div>
                    </div>
                </div>

                {/* Event/Reason Details */}
                <p className="text-gray-700 mt-2">
                    <strong className="text-gray-900">Event: </strong>
                    {event?.name || 'Manual Award/Deduction'}
                </p>
                {reason && (
                    <p className="text-sm text-gray-600 mt-1 italic border-l-2 pl-2 border-indigo-200">
                        {reason}
                    </p>
                )}
            </div>
        </div>
    );
};


export default function PointTimeline() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTimelineData = async () => {
        setLoading(true);
        setError(null);
        try {
            // NOTE: The endpoint should return a list of PointTransactionResponse objects
            const data = await apiFetch(`${API_BASE_URL}/students/${PLACEHOLDER_STUDENT_ID}/timeline`);
            setTransactions(data);
        } catch (err) {
            console.error("Failed to fetch timeline data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimelineData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-indigo-600 h-8 w-8" />
                <span className="ml-3 text-lg text-gray-600">Loading Point Timeline...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl shadow-lg m-4">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-red-700">Error Loading Data</h2>
                <p className="text-red-600 mt-2">Could not fetch the student's point history. Is the backend running? ({error})</p>
                <p className="text-sm text-red-500 mt-1">Attempted to fetch data for student ID: {PLACEHOLDER_STUDENT_ID}</p>
                <button
                    onClick={fetchTimelineData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Retry
                </button>
            </div>
        );
    }
    
    if (transactions.length === 0) {
        return (
            <div className="p-8 text-center bg-yellow-50 border border-yellow-200 rounded-xl shadow-lg m-4">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-yellow-700">No Point History</h2>
                <p className="text-yellow-600 mt-2">
                    This student has not yet been awarded or deducted any points.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-2 flex items-center">
                    <Clock className="w-8 h-8 text-indigo-600 mr-2" />
                    Point Transaction History
                </h1>
                
                {/* Timeline Container */}
                <div className="relative">
                    {transactions.map((transaction, index) => (
                        <TransactionItem 
                            key={transaction.id} 
                            transaction={transaction} 
                            isLast={index === transactions.length - 1} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
