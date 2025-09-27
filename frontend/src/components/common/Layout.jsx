// src/components/common/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children, activePage }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activePage={activePage} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header activePage={activePage} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

/* Header component */
function Header({ activePage }) {
  return (
    <header className="flex justify-between items-center bg-white border-b border-gray-300 px-6 py-4">

      {/* Left part: Welcome message only for dashboard */}
      <div className="text-xl font-semibold">
        {activePage === "Dashboard" && "Welcome Back, Rihana!"}
      </div>

      {/* Right part: avatar and bell */}
      <div className="flex items-center gap-4">
        <button className="hover:bg-gray-100">
  🔔
</button>

        <img
          src="https://i.pravatar.cc/39"
          alt="Profile"
          className="h-10 w-10 rounded-full"
        />
      </div>
    </header>
  );
}
