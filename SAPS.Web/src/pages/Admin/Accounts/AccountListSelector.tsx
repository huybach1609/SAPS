import React from "react";
import { Users, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const AccountListSelector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.includes("admins");
  const isUser = location.pathname.includes("users");

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-[#023E8A]">
        Select Account List
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button
          className={`flex flex-col items-center justify-center p-8 border-2 rounded-lg transition-colors ${
            isUser
              ? "bg-[#023E8A] text-white border-[#023E8A]"
              : "bg-white text-[#023E8A] border-[#023E8A]"
          }`}
          onClick={() => navigate("/admin/accounts/users")}
        >
          <Users size={48} className="mb-2" />
          <span className="text-lg font-semibold">User Account List</span>
          <span className="text-sm text-gray-500 mt-2">
            View and manage all users
          </span>
        </button>
        <button
          className={`flex flex-col items-center justify-center p-8 border-2 rounded-lg transition-colors ${
            isAdmin
              ? "bg-[#023E8A] text-white border-[#023E8A]"
              : "bg-white text-[#023E8A] border-[#023E8A]"
          }`}
          onClick={() => navigate("/admin/accounts/admins")}
        >
          <ShieldCheck size={48} className="mb-2" />
          <span className="text-lg font-semibold">Admin Account List</span>
          <span className="text-sm text-gray-500 mt-2">
            View and manage all admins
          </span>
        </button>
      </div>
    </div>
  );
};

export default AccountListSelector;
