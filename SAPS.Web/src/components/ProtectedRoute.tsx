import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/services/auth/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component for role-based access control
 * Allows access only if user has one of the required roles
 * Redirects to login page or unauthorized page otherwise
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Redirect to unauthorized page if lacking required role
  if (!hasPermission(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children if user has permission
  return <>{children}</>;
};

export default ProtectedRoute;
