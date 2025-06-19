import { Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "@/layouts/AdminLayout";

// Admin pages
import AdminDashboard from "@/pages/Admin/AdminDashboardPage";
import AdminLogin from "@/pages/Admin/Auth/LoginPage";
import UserAccountList from "@/pages/Admin/Accounts/UserAccounts/UserAccountList";
import AdminAccountList from "@/pages/Admin/Accounts/AdminAccounts/AdminAccountList";
import UserAccountDetails from "@/pages/Admin/Accounts/UserAccounts/UserAccountDetails";
import AdminAccountDetails from "@/pages/Admin/Accounts/AdminAccounts/AdminAccountDetails";
import ParkingLotOwnerList from "@/pages/Admin/ParkingLotOwner/ParkingLotOwnerList";
import ParkingLotOwnerDetails from "@/pages/Admin/ParkingLotOwner/ParkingLotOwnerDetails";
import RequestList from "@/pages/Admin/Requests/RequestList";
import RequestDetails from "@/pages/Admin/Requests/RequestDetails";

function App() {
  return (
    <Routes>
      {/* Redirect root to admin dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Account Management */}
        <Route path="accounts/users" element={<UserAccountList />} />
        <Route path="accounts/users/:id" element={<UserAccountDetails />} />
        <Route path="accounts/admins" element={<AdminAccountList />} />
        <Route path="accounts/admins/:id" element={<AdminAccountDetails />} />

        {/* Parking Lot Owner Management */}
        <Route path="parking-owners" element={<ParkingLotOwnerList />} />
        <Route path="parking-owners/:id" element={<ParkingLotOwnerDetails />} />

        {/* Request Management */}
        <Route path="requests" element={<RequestList />} />
        <Route path="requests/:id" element={<RequestDetails />} />
      </Route>
    </Routes>
  );
}

export default App;
