import React from "react";
import { Users, ShieldCheck, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccountListSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center mb-2 mt-0">
        <Users className="mr-3 text-indigo-900" size={30} />
        <h1 className="text-3xl font-bold text-indigo-900">
          Account Management
        </h1>
      </div>
      <p className="text-gray-500 mb-6">
        Manage user accounts and administrative accounts
      </p>

      {/* Card Container with Border */}
      <div className="border border-gray-200 rounded-lg shadow-sm p-6">
        {/* Select Account Type Section */}
        <div className="border-l-4 border-indigo-600 pl-4 mb-6">
          <div className="flex items-center">
            <Target className="text-indigo-600 mr-2" size={24} />
            <h2 className="text-xl font-bold text-indigo-900">
              Select Account Type
            </h2>
          </div>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Accounts Card */}
          <div
            className="bg-[#0077B6] text-white p-8 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-shadow border border-[#0066a0]"
            onClick={() => navigate("/admin/accounts/users")}
          >
            <div className="text-center">
              <Users size={56} className="mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">User Accounts</h3>
              <p className="text-gray-200">Manage customer accounts</p>
            </div>
          </div>

          {/* Admin Accounts Card */}
          <div
            className="bg-[#48CAE4] text-white p-8 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-shadow border border-[#3bb9d3]"
            onClick={() => navigate("/admin/accounts/admins")}
          >
            <div className="text-center">
              <ShieldCheck size={56} className="mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Admin Accounts</h3>
              <p className="text-gray-100">Manage administrator accounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountListSelector;
