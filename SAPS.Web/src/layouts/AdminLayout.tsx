import { useState } from "react";
import { Outlet } from "react-router-dom";
// No unused imports
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#023E8A] shadow-md">
          <div className="mx-auto px-4 py-4">
            <h1 className="text-xl font-semibold text-white">
              SAPLS Admin Dashboard
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-[#023E8A] text-white py-4 px-6">
          <div className="text-center text-sm">
            © {new Date().getFullYear()} SAPLS Admin. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
