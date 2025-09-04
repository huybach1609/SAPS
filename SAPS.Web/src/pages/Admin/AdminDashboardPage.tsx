import React from "react";
import { Card, CardBody } from "@heroui/react";
import {
  Users,
  Building2,
  FileText,
  Package,
  Camera,
  ChartColumnBig,
  Lock,
  Zap,
  Settings,
  Shield,
  CreditCard,
  BarChart3,
} from "lucide-react";
import logoImage from "../../assets/Logo/logo.svg";

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="bg-blue-100 p-8 rounded-3xl shadow-lg inline-flex justify-center items-center">
              <img
                src={logoImage}
                alt="SAPLS Logo"
                className="w-24 h-24 object-cover"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            Welcome to SAPLS
          </h1>
          <h2 className="text-xl text-gray-600 mb-4">
            Admin Management Dashboard
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Comprehensive admin management tools for user accounts, parking lot
            owners, subscription oversight, and system administration for your
            parking facility.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Account Management */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardBody className="text-center p-8">
              <div className="bg-white/20 p-4 rounded-2xl mb-4 inline-flex justify-center items-center">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Account Management</h3>
              <p className="text-blue-100 text-sm">
                Manage user/admin accounts
              </p>
            </CardBody>
          </Card>

          {/* Parking Lot Owners */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardBody className="text-center p-8">
              <div className="bg-white/20 p-4 rounded-2xl mb-4 inline-flex justify-center items-center">
                <Building2 size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Parking Lot Owners</h3>
              <p className="text-green-100 text-sm">Owner management</p>
            </CardBody>
          </Card>

          {/* Request Management */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardBody className="text-center p-8">
              <div className="bg-white/20 p-4 rounded-2xl mb-4 inline-flex justify-center items-center">
                <FileText size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Request Management</h3>
              <p className="text-orange-100 text-sm">Handle system requests</p>
            </CardBody>
          </Card>

          {/* Subscriptions */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardBody className="text-center p-8">
              <div className="bg-white/20 p-4 rounded-2xl mb-4 inline-flex justify-center items-center">
                <Package size={32} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Subscriptions</h3>
              <p className="text-purple-100 text-sm">
                Manage subscription plans
              </p>
            </CardBody>
          </Card>
        </div>

        {/* System Features Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
            System Features
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {/* AI Recognition */}
            <div className="flex flex-col items-center p-4">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 rounded-2xl mb-3 shadow-lg">
                <Camera size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                AI Recognition
              </span>
              <span className="text-xs text-gray-500 text-center">
                License plate detection
              </span>
            </div>

            {/* Analytics */}
            <div className="flex flex-col items-center p-4">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl mb-3 shadow-lg">
                <ChartColumnBig size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                Analytics
              </span>
              <span className="text-xs text-gray-500 text-center">
                Real-time insights
              </span>
            </div>

            {/* Payments */}
            <div className="flex flex-col items-center p-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl mb-3 shadow-lg">
                <CreditCard size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                Payments
              </span>
              <span className="text-xs text-gray-500 text-center">
                Seamless processing
              </span>
            </div>

            {/* Security */}
            <div className="flex flex-col items-center p-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl mb-3 shadow-lg">
                <Lock size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                Security
              </span>
              <span className="text-xs text-gray-500 text-center">
                Enterprise-grade
              </span>
            </div>

            {/* Performance */}
            <div className="flex flex-col items-center p-4">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-2xl mb-3 shadow-lg">
                <Zap size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                Performance
              </span>
              <span className="text-xs text-gray-500 text-center">
                Lightning fast
              </span>
            </div>

            {/* Reports */}
            <div className="flex flex-col items-center p-4">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-4 rounded-2xl mb-3 shadow-lg">
                <BarChart3 size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                Reports
              </span>
              <span className="text-xs text-gray-500 text-center">
                Detailed analytics
              </span>
            </div>

            {/* Settings */}
            <div className="flex flex-col items-center p-4">
              <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-4 rounded-2xl mb-3 shadow-lg">
                <Settings size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                Settings
              </span>
              <span className="text-xs text-gray-500 text-center">
                System configuration
              </span>
            </div>

            {/* Admin Tools */}
            <div className="flex flex-col items-center p-4">
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-4 rounded-2xl mb-3 shadow-lg">
                <Shield size={24} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">
                Admin Tools
              </span>
              <span className="text-xs text-gray-500 text-center">
                Advanced controls
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
