import { motion } from "framer-motion";
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Listbox,
  ListboxItem,
  Tooltip,
} from "@heroui/react";
import {
  EllipsisVertical,
  LogOut,
  Settings,
  Home,
  Users,
  Building2,
  FileText,
  AlertTriangle,
  ClipboardList,
  DollarSign,
  Package,
  CreditCard,
  CircleAlert,
  Clock,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { ThemeSwitch } from "../theme-switch";
import blankProfile from "../../assets/Default/blank-profile-picture.webp";

import { useAuth } from "@/services/auth/AuthContext";
import { OWNER_ROLE } from "@/config/base";
import { useParkingLot } from "@/pages/ParkingLotOwner/ParkingLotContext";

interface SidebarProps {
  isOpen: boolean;
  role?: "admin" | "parkinglotowner";
}

interface NavigationItem {
  icon: React.ReactNode;
  title: string;
  path: string;
  isActive?: boolean;
}

interface NavigationListProps {
  items: NavigationItem[];
  isOwner : boolean;
}

const NavigationList: React.FC<NavigationListProps> = ({ items, isOwner = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Only use parking lot context for owner role
  const parkingLotContext = isOwner ? useParkingLot() : null;
  const selectedParkingLot = parkingLotContext?.selectedParkingLot;

  return (
      <Listbox aria-label="Navigation List" className="flex flex-col gap-2">
        {items.map((item, index) => {
          // Check if item should be disabled based on isActive prop and parking lot status
          // Only apply this logic for owner items
          const isDisabled = isOwner &&
              item.isActive !== undefined &&
              (selectedParkingLot?.status === "Active"
                  ? !item.isActive
                  : item.isActive);

          const listboxItem = (
              <>
                <ListboxItem
                    key={index}
                    className={`p-3 
                             ${location.pathname === item.path ? "bg-primary text-background" : ""}
                             hover:bg-primary hover:text-background
                             ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                             `}
                    color="secondary"
                    endContent={
                      isDisabled ? (
                          <Tooltip
                              key={index}
                              className="text-background"
                              color="warning"
                              content="Renew your subscription to access this feature"
                              placement="right"
                          >
                            <CircleAlert size={16} />
                          </Tooltip>
                      ) : null
                    }
                    isReadOnly={isDisabled}
                    startContent={item.icon}
                    title={item.title}
                    onClick={() => navigate(item.path)}
                />
              </>
          );

          return listboxItem;
        })}
      </Listbox>
  );
};

// Configuration for different user roles
const adminItems: NavigationItem[] = [
  {
    icon: <Home size={20} />,
    title: "Home",
    path: "/admin/home",
  },
  {
    icon: <Users size={20} />,
    title: "Account List",
    path: "/admin/accounts",
  },
  {
    icon: <Building2 size={20} />,
    title: "Parking Lot Owner List",
    path: "/admin/parking-owners",
  },
  {
    icon: <FileText size={20} />,
    title: "Request List",
    path: "/admin/requests",
  },
  {
    icon: <Package size={20} />,
    title: "Subscriptions",
    path: "/admin/subscriptions",
  },
];

const parkingLotOwnerItems: NavigationItem[] = [
  // {
  //     icon: <Home size={20} />,
  //     title: "Home",
  //     path: "/owner/home"
  // },
  {
    icon: <Building2 size={20} />,
    title: "Parking Lot Information",
    path: "/owner/parking-info",
  },
  {
    icon: <Users size={20} />,
    title: "Staff List",
    path: "/owner/staff",
  },
  {
    icon: <ClipboardList size={20} />,
    title: "Parking History",
    path: "/owner/history",
  },
  {
    icon: <DollarSign size={20} />,
    title: "Parking Fee Management",
    path: "/owner/parking-fee",
    isActive: true,
  },
  {
    icon: <AlertTriangle size={20} />,
    title: "Incident Reports",
    path: "/owner/incidents",
    isActive: true,
  },
  {
    icon: <FileText size={20} />,
    title: "Whitelist",
    path: "/owner/whitelist",
    isActive: true,
  },
  {
    icon: <Clock size={20} />,
    title: "Staff Shift Management",
    path: "/owner/staff-shift",
    isActive: true,
  },
  // {
  //     icon: <FileText size={20} />,
  //     title: "Subscription",
  //     path: "/owner/subscription"
  // },
  // {
  //     icon: <FileText size={20} />,
  //     title: "Upload File",
  //     path: "/owner/upload-file"
  // }
];

const HeadingBar: React.FC = () => {
  const { user, logout, getRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center my-4">
      <div className="flex items-center gap-2">
        <img
          alt="Profile"
          className="w-12 h-12 rounded-full m-2"
          src={blankProfile}
        />
        <div>
          <h2 className="text-medium font-bold ">{user?.fullName}</h2>
          <h2 className="text-xs ">
            {getRole() === OWNER_ROLE ? "Parking Lot Owner" : "Administrator"}
          </h2>
        </div>
      </div>

      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly className="bg-transparent text-background ">
            <EllipsisVertical />
          </Button>
        </DropdownTrigger>
        <DropdownMenu className="dark">
          <DropdownItem key="settings" textValue="Settings ">
            <button className="flex items-center gap-2 w-full text-left transition-opacity hover:opacity-80 ">
              <Settings size={16} />
              Settings
            </button>
          </DropdownItem>

          <DropdownItem key="changeThemes" textValue="Change Themes">
            <ThemeSwitch className="w-full" showLabel={true} variant="button" />
          </DropdownItem>
          {getRole() === OWNER_ROLE ? (
            <DropdownItem key="subscription" textValue="Subscription">
              <button
                className="flex items-center gap-2 w-full text-left transition-opacity hover:opacity-80 "
                onClick={() => navigate("/owner/subscription")}
              >
                <CreditCard size={16} /> Subscription
              </button>
            </DropdownItem>
          ) : null}
          <DropdownItem key="logout" textValue="Logout">
            <button
              className="flex items-center gap-2 w-full text-left transition-opacity hover:opacity-80 "
              onClick={logout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export const SideBar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { getRole } = useAuth();

  return (
    <motion.div
      animate={{
        width: isOpen ? 300 : 0,
        opacity: isOpen ? 1 : 0,
        // maxWidth: isOpen ? 300: 0,
        minWidth: isOpen ? 250 : 0,
      }}
      className=" 
            bg-foreground text-background border-r border-divider h-full flex flex-col
            p-5 shadow-lg overflow-hidden z-50
            "
      initial={false}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <HeadingBar />
      <Divider className="bg-border my-4" />
      {getRole() === OWNER_ROLE ? (
        <NavigationList items={parkingLotOwnerItems} isOwner={true} />
      ) : (
        <NavigationList items={adminItems} isOwner={false}/>
      )}
      {/* // {role === 'parkinglotowner' ? <ParkingLotOwnerList /> : <AdminList />} */}
    </motion.div>
  );
};
