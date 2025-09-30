// src/components/common/Layout.jsx

import React from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext"; // Import the useAuth hook

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
                {/* Header - PASSES THE DYNAMIC USERNAME */}
                <Header activePage={activePage} userName={userName} /> 
                
                {/* Page-specific content area */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}

/**
 * Header component, updated to use a dynamic username.
 */
function Header({ activePage, userName = "User" }) {
  return (
    <header className="flex justify-between items-center bg-white border-b border-gray-300 px-6 py-4">

      {/* Left part: Dynamic Welcome message for dashboard */}
      <div className="text-xl font-semibold">
        {activePage === "Dashboard" && `Welcome Back, ${userName}!`}
      </div>

      {/* Right part: avatar and bell */}
      <div className="flex items-center gap-4">
        <button className="hover:bg-gray-100 p-2 rounded-full transition duration-150">
          🔔
        </button>

        <img
          src="https://i.pravatar.cc/39" 
          alt="Profile"
          className="h-10 w-10 rounded-full object-cover"
        />
      </div>
    </header>
  );
}