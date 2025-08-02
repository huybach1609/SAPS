import React from "react";
import { Card } from "@heroui/react";
import { Users, Building2, FileText, AlertTriangle } from "lucide-react";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}> = ({ title, value, icon, trend }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-default-600">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && (
          <p
            className={`text-sm mt-2 ${
              trend.isPositive ? "text-success" : "text-danger"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last
            month
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg bg-primary/10">{icon}</div>
    </div>
  </Card>
);

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      title: "Total Users",
      value: "12,345",
      icon: <Users className="text-primary" size={24} />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Active Parking Lots",
      value: "48",
      icon: <Building2 className="text-primary" size={24} />,
      trend: { value: 5, isPositive: true },
    },
    {
      title: "Pending Requests",
      value: "23",
      icon: <FileText className="text-primary" size={24} />,
      trend: { value: 8, isPositive: false },
    },
    {
      title: "Active Incidents",
      value: "7",
      icon: <AlertTriangle className="text-primary" size={24} />,
      trend: { value: 15, isPositive: false },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-default-600">Welcome back, Admin!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Additional dashboard sections can be added here */}
    </div>
  );
};

export default AdminDashboard;
