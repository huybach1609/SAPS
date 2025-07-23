import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/services/auth/AuthContext";
import { ParkingLotProvider } from "@/pages/ParkingLotOwner/ParkingLotContext";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import ErrorPage from "@/pages/ErrorPage";
import LoginPage from "./pages/Auth/Login";
import OwnerDashboard from "./pages/ParkingLotOwner/Home/OwnerDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import { WhitelistManagement } from "./pages/ParkingLotOwner/Whitelist/WhiteListManagement";
import IncidentReports from "./pages/ParkingLotOwner/IncidentReports/IncidentReports";
import ParkingHistory from "./pages/ParkingLotOwner/ParkingHistory/HistoryManagement/ParkingHistory";
import StaffManagement from "./pages/ParkingLotOwner/StaffManagement/StaffManagement";
import ParkingLotInfo from "./pages/ParkingLotOwner/ParkingInfo/ParkingLotInfo";
import AdminAccountList from "./pages/Admin/AdminAccounts/AdminAccountList";
import AdminParkingLotOwnerList from "./pages/Admin/ParkingLotOwnerAccounts/AdminParkingLotOwnerList";
import AdminRequestList from "./pages/Admin/Requests/AdminRequestList";
import { ADMIN_ROLE, OWNER_ROLE } from "./config/base";
import ParkingFeeManagement from "./pages/ParkingLotOwner/ParkingFee/ParkingFeeManagement";
import StaffDetailScreen from "./pages/ParkingLotOwner/StaffManagement/StaffDetail";
import UploadFile from "./pages/ParkingLotOwner/UploadFile";
import ParkingHistoryDetail from "./pages/ParkingLotOwner/ParkingHistory/HistoryManagement/ParkingHistoryDetail";
import IncidentDetail from "./pages/ParkingLotOwner/IncidentReports/IncidentDetail";

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'parkinglotowner';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (isAuthenticated) {
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/home" replace />;
      case 'parkinglotowner':
        return <Navigate to="/owner/parking-info" replace />;
      default:
        return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

const RoleBasedRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin/home" replace />;
    case 'parkinglotowner':
      return <Navigate to="/owner/parking-info" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

const OwnerParkingLotProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // You may need to adjust this if the parkingLotId is stored elsewhere
  const userId = user?.id || "1"; // fallback to '1' if not available
  return (
    <ParkingLotProvider userId={userId}>
      {children}
    </ParkingLotProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Auth Routes */}
        <Route
          path="/auth/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Public landing page - only for unauthenticated users */}
        <Route
          path="/landing"
          element={
            <PublicRoute>
              <IndexPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={ADMIN_ROLE}>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<AdminDashboard />} />
          <Route path="accounts" element={<AdminAccountList />} />
          <Route path="parking-owners" element={<AdminParkingLotOwnerList />} />
          <Route path="requests" element={<AdminRequestList />} />
        </Route>

        {/* Owner Routes */}
        <Route
          path="/owner/*"
          element={
            <ProtectedRoute requiredRole={OWNER_ROLE}>
              <OwnerParkingLotProviderWrapper>
                <Outlet />
              </OwnerParkingLotProviderWrapper>
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<OwnerDashboard />} />
          <Route path="parking-info" element={<ParkingLotInfo />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="staff/:parkingLotId/:staffId" element={<StaffDetailScreen  />} />
          <Route path="history" element={<ParkingHistory />} />
          <Route path="history/:parkingLotId/:sessionId" element={<ParkingHistoryDetail />} />
          <Route path="incidents" element={<IncidentReports />} />
          <Route path="incidents/:parkingLotId/:incidentId" element={<IncidentDetail />} />
          <Route path="whitelist" element={<WhitelistManagement />} />
          <Route path="parking-fee" element={<ParkingFeeManagement />} />
          <Route path="upload-file" element={<UploadFile />} />
        </Route>

        {/* Dashboard redirect route */}
        <Route path="/dashboard" element={<RoleBasedRedirect />} />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<ErrorPage statusCode={401} />} />
        <Route path="*" element={<ErrorPage statusCode={404} />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;