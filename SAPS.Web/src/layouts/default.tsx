
import { useAuth } from "@/services/auth/AuthContext";
import { ParkingLotOwnerLayout } from "./ParkingLotOwnerLayout";
import { AdminLayout } from "./AdminLayout";
import { OWNER_ROLE } from "@/config/base";

// import { useNavigate } from "react-router-dom";

export default function DefaultLayout({
  children,
  title = "",
  className = "",
  description = ""
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
  description?: string;
}) {
  const { getRole } = useAuth();

  if (getRole() === OWNER_ROLE) {
    return <ParkingLotOwnerLayout title={title} className={className} description={description}>
      {children}
    </ParkingLotOwnerLayout>
  } else {
    return <AdminLayout title={title} className={className}>
      {children}
    </AdminLayout>
  }

}
 