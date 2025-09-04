import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/services/auth/AuthContext";
import {
  ParkingLotProvider,
  useParkingLot,
} from "@/pages/ParkingLotOwner/ParkingLotContext";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import ErrorPage from "@/pages/ErrorPage";
import LoginPage from "./pages/Auth/Login";
import ChangePassword from "./pages/Auth/ChangePassword";
import OwnerDashboard from "./pages/ParkingLotOwner/Home/OwnerDashboard";
import { WhitelistManagement } from "./pages/ParkingLotOwner/Whitelist/WhiteListManagement";
import DefaultLayout from "./layouts/default";
import IncidentReports from "./pages/ParkingLotOwner/IncidentReports/IncidentReports";
import ParkingHistory from "./pages/ParkingLotOwner/ParkingHistory/HistoryManagement/ParkingHistory";
import StaffManagement from "./pages/ParkingLotOwner/StaffManagement/StaffManagement";
import ParkingLotInfo from "./pages/ParkingLotOwner/ParkingInfo/ParkingLotInfo";
import AdminAccountList from "./pages/Admin/Accounts/AdminAccounts/AdminAccountList";
import AdminRequestList from "./pages/Admin/Requests/AdminRequestList";
// import { ADMIN_ROLE, OWNER_ROLE } from "./config/base";
import ParkingFeeManagement from "./pages/ParkingLotOwner/ParkingFee/ParkingFeeManagement";
import AccountListSelector from "./pages/Admin/Accounts/AccountListSelector";
import UserAccountList from "./pages/Admin/Accounts/UserAccounts/UserAccountList";
import AdminAccountDetails from "./pages/Admin/Accounts/AdminAccounts/AdminAccountDetails";
import UserDetail from "./pages/Admin/Accounts/UserAccounts/UserDetail";
import StaffDetailScreen from "./pages/ParkingLotOwner/StaffManagement/StaffDetail";
import ParkingLotOwnerList from "./pages/Admin/ParkingLotOwner/ParkingLotOwnerList";
import ParkingLotOwnerDetails from "./pages/Admin/ParkingLotOwner/ParkingLotOwnerDetails";
import SubscriptionList from "./pages/Admin/Subscriptions/SubscriptionList";
import RequestDetails from "./pages/Admin/Requests/RequestDetails";
import UploadFile from "./pages/ParkingLotOwner/UploadFile";
import ParkingHistoryDetail from "./pages/ParkingLotOwner/ParkingHistory/HistoryManagement/ParkingHistoryDetail";
import IncidentDetail from "./pages/ParkingLotOwner/IncidentReports/IncidentDetail";
import SubscriptionPricingSelect from "./pages/ParkingLotOwner/Subscription/SubscriptionPricingSelect";
import StaffShiftManagement from "./pages/ParkingLotOwner/StaffShift/StaffShiftManagement";
import PaymentSubscriptionComponent from "./pages/ParkingLotOwner/Subscription/PaymentSubscriptionComponent";
import { useTranslation } from "react-i18next";
// import AdminRequestList from "@/pages/Admin/Requests/AdminRequestList.tsx";
// import DefaultLayout from "@/layouts/default.tsx";

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "parkinglotowner";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, loading, getUserRole } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <div>{t("loading")}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const userRole = getUserRole();

  // If requiredRole is specified, check if user has that role
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Active Route Component for parking lot status check
interface ActiveRouteProps {
  children: React.ReactNode;
  requireActive?: boolean;
}

const ActiveRoute: React.FC<ActiveRouteProps> = ({
  children,
  requireActive = true,
}) => {
  const { selectedParkingLot, loading } = useParkingLot();

  if (loading) {
    return <div>Loading...</div>;
  }
  // console.log("selectedParkingLot", selectedParkingLot);

  // If requireActive is true, check if parking lot is active
  if (requireActive && selectedParkingLot?.isExpired) {
    return <Navigate to="/owner/subscription" replace />;
  }

  // If requireActive is false, check if parking lot is inactive
  if (!requireActive && selectedParkingLot?.isExpired) {
    return <Navigate to="/owner/parking-info" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, getUserRole } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <div>{t("loading")}</div>; // Or your loading component
  }

  if (isAuthenticated) {
    const role = getUserRole();
    // const adminRole = getAdminRole();

    if (role === "admin") {
      return <Navigate to="/admin/requests" replace />;
    } else if (role === "parkinglotowner") {
      return <Navigate to="/owner/parking-info" replace />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

const RoleBasedRedirect: React.FC = () => {
  const { isAuthenticated, loading, getUserRole } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const role = getUserRole();
  // const adminRole = getAdminRole();

  // Kiểm tra role và AdminRole để điều hướng đúng
  if (role === "admin") {
    return <Navigate to="/admin/requests" replace />;
  } else if (role === "parkinglotowner") {
    return <Navigate to="/owner/parking-info" replace />;
  } else {
    return <Navigate to="/unauthorized" replace />;
  }
};

const OwnerParkingLotProviderWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || "";
  return <ParkingLotProvider userId={userId}>{children}</ParkingLotProvider>;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
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
            <ProtectedRoute requiredRole="admin">
              <DefaultLayout title="SAPLS Admin Dashboard">
                <Outlet />
              </DefaultLayout>
            </ProtectedRoute>
          }
        >
          {/* Account Management Routes */}
          <Route path="accounts" element={<AccountListSelector />} />
          <Route path="accounts/users" element={<UserAccountList />} />
          <Route path="accounts/users/:id" element={<UserDetail />} />
          <Route path="accounts/admins" element={<AdminAccountList />} />
          <Route path="accounts/admins/:id" element={<AdminAccountDetails />} />
          <Route path="parking-owners" element={<ParkingLotOwnerList />} />
          <Route
            path="parking-owners/:id"
            element={<ParkingLotOwnerDetails />}
          />
          <Route path="requests" element={<AdminRequestList />} />
          <Route path="requests/details/:id" element={<RequestDetails />} />
          <Route path="subscriptions" element={<SubscriptionList />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* Owner Routes */}
        <Route
          path="/owner/*"
          element={
            <ProtectedRoute requiredRole="parkinglotowner">
              <OwnerParkingLotProviderWrapper>
                {/* <DefaultLayout title="SAPLS Parking Lot Management"> */}
                  <Outlet />
                {/* </DefaultLayout> */}
              </OwnerParkingLotProviderWrapper>
            </ProtectedRoute>
          }
        >
          <Route path="home" element={<OwnerDashboard />} />
          <Route path="parking-info" element={<ParkingLotInfo />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route
            path="staff/:staffId"
            element={<StaffDetailScreen />}
          />
          <Route path="history" element={<ParkingHistory />} />
          <Route path="history/:sessionId" element={<ParkingHistoryDetail />} />
          <Route
            path="incidents"
            element={
              <ActiveRoute requireActive={true}>
                <IncidentReports />
              </ActiveRoute>
            }
          />
          <Route
            path="incidents/:incidentId"
            element={
              <ActiveRoute requireActive={true}>
                <IncidentDetail />
              </ActiveRoute>
            }
          />
          <Route
            path="whitelist"
            element={
              <ActiveRoute requireActive={true}>
                <WhitelistManagement />
              </ActiveRoute>
            }
          />
          <Route
            path="parking-fee"
            element={
              <ActiveRoute requireActive={true}>
                <ParkingFeeManagement />
              </ActiveRoute>
            }
          />
          <Route path="upload-file" element={<UploadFile />} />
          <Route
            path="subscription"
            element={
              // <ActiveRoute requireActive={false}>
              <SubscriptionPricingSelect />
              // </ActiveRoute>
            }
          />
          <Route
            path="staff-shift"
            element={
              <ActiveRoute requireActive={true}>
                <StaffShiftManagement />
              </ActiveRoute>
            }
          />
          <Route
            path="subscription/payment/:subscriptionId"
            element={<PaymentSubscriptionComponent />}
          />
          <Route path="change-password" element={<ChangePassword />} />
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
