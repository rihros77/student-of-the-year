// src/components/common/Layout.jsx

import React from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext"; // Import the useAuth hook
import NotificationBell from "@/components/common/NotificationBell";

/**
 * Main application layout component that wraps all protected pages.
 */
export default function Layout({ children, activePage }) {
    // 1. Get user data from the AuthContext
    const { user } = useAuth(); 
    
    // Determine the role for the Sidebar. Default to 'student' if context is not ready.
    const role = user?.role || 'student'; 
    
    // Determine the username for the Header.
    const userName = user?.username;

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar - PASSES THE DYNAMIC ROLE */}
            <Sidebar activePage={activePage} role={role} /> 

            {/* Main content container */}
            <div className="flex-1 flex flex-col">
                {/* Header - PASSES THE DYNAMIC USERNAME AND ACTIVE PAGE */}
                <Header activePage={activePage} userName={userName} /> 
                
                {/* Page-specific content area */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}

/**
 * Header component, updated to display the specific page title.
 */
function Header({ activePage, userName = "User" }) {
    // Define the map of page names to their titles in the header
    const pageTitles = {
        "Dashboard": `Welcome Back, ${userName}!`,
        "Manage Events": "Event Management Dashboard", // <-- Added the specific title here
        // Add other page titles as needed
    };

    // Use the specific title if available, otherwise use a fallback or the active page name
    const headerContent = pageTitles[activePage] || activePage; 

    return (
        <header className="flex justify-between items-center bg-white border-b border-gray-300 px-6 py-4">

            {/* Left part: Dynamic Welcome message or Page Title */}
            <div className="text-xl font-bold text-gray-800">
                {headerContent}
            </div>

            {/* Right part: avatar and bell */}
            <div className="flex items-center gap-4">
  <NotificationBell /> {/* <-- Add this here */}
  <img
    src="https://i.pravatar.cc/39"
    alt="Profile"
    className="h-10 w-10 rounded-full object-cover"
  />
</div>

        </header>
    );
}