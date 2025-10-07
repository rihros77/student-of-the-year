import React, { useState, useEffect, useMemo } from "react";
import Confetti from "react-confetti";
import { Award, Trophy } from 'lucide-react';

const API_BASE_URL = "http://127.0.0.1:8000/api"; // Centralize base URL

export default function CountdownReveal() {
    const [count, setCount] = useState(3);
    const [winner, setWinner] = useState(null);
    const [showWinner, setShowWinner] = useState(false);
    const [confettiActive, setConfettiActive] = useState(false);
    const [status, setStatus] = useState('initial'); // 'initial', 'loading', 'counting', 'revealed', 'error'

    // NOTE: This fetch requires an Admin token in the header, 
    // which should be handled by an auth context or service in a real app.
    // We are currently omitting the header for simplicity but it will fail RBAC in the backend.
    const fetchWinner = async () => {
        setStatus('loading');
        try {
            // CORRECTED ENDPOINT: Added '/api' prefix to match main.py configuration
            const res = await fetch(`${API_BASE_URL}/reveal/`, { 
                method: "POST",
                headers: {
                    'Authorization': 'Bearer mock_admin_token' // Required for get_current_admin_user dependency
                }
            });
            const data = await res.json();
            
            if (!res.ok) {
                // Handle 404/500/403 errors returned as JSON
                throw new Error(data.detail || `HTTP Error: ${res.status}`);
            }

            console.log("Winner fetched:", data);
            
            // Assuming the successful response model (StudentResponse) has the student name
            return data.name || "Mystery Student"; 
        } catch (err) {
            console.error("Error fetching winner:", err);
            setStatus('error');
            // If the error is 'Not Found', it's likely a missing snapshot or backend issue
            return `Error: ${err.message}`; 
        }
    };

    useEffect(() => {
        const startCountdown = async () => {
            const winnerData = await fetchWinner();
            
            if (status === 'error') return;
            
            setStatus('counting');

            const interval = setInterval(() => {
                setCount((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setWinner(winnerData);
                        setShowWinner(true);
                        setConfettiActive(true);
                        setStatus('revealed');
                        
                        // Stop confetti after a few seconds
                        setTimeout(() => setConfettiActive(false), 8000); 

                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            return () => clearInterval(interval);
        };

        if (status === 'initial') {
             // Delay the start slightly for a better visual effect
            setTimeout(startCountdown, 500); 
        }
        
    }, [status]); // Depend on status to control the flow

    const CountdownDisplay = useMemo(() => {
        if (status === 'loading') {
            return (
                <div className="text-4xl text-yellow-300 font-medium animate-pulse flex items-center gap-2">
                    <Award className="animate-spin" size={32}/> Preparing the Reveal...
                </div>
            );
        }
        if (status === 'error') {
             return (
                <div className="text-3xl text-red-500 font-medium p-4 bg-red-900 bg-opacity-30 rounded-lg">
                    {winner}
                </div>
            );
        }
        
        if (!showWinner && count > 0) {
            return (
                <>
                    <h1 className="text-4xl font-light mb-6">Revealing Winner in:</h1>
                    <div className="text-[12rem] font-extrabold animate-pulse text-yellow-400 drop-shadow-lg">
                        {count}
                    </div>
                </>
            );
        }
        
        if (showWinner) {
            return (
                <div className="flex flex-col items-center space-y-6 bg-white bg-opacity-10 p-10 rounded-3xl shadow-2xl backdrop-blur-md border border-yellow-400">
                    <Trophy size={80} className="text-yellow-400 animate-bounce"/>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white text-shadow-glow">
                        STUDENT OF THE YEAR
                    </h1>
                    <h2 className="text-5xl md:text-6xl font-black text-yellow-300 tracking-wider p-4 rounded-xl">
                        {winner}
                    </h2>
                    <p className="text-xl text-gray-200 mt-4">Congratulations!</p>
                </div>
            );
        }
        return null;
    }, [count, showWinner, winner, status]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 
                      bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
            
            {confettiActive && <Confetti numberOfPieces={700} recycle={false} gravity={0.3} />}

            <div className="text-center">
                {CountdownDisplay}
            </div>
            
            <div className="absolute bottom-4 left-4 text-xs text-gray-400">
                Endpoint: {API_BASE_URL}/reveal/ (POST)
            </div>
        </div>
    );
}
