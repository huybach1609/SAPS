import { motion } from "framer-motion";
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  LogOut,
  Settings,
  Users,
  Home,
  FileText,
  Building2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ThemeSwitch } from "../theme-switch";
import blankProfile from "../../assets/Default/blank-profile-picture.webp";

interface SidebarProps {
  isOpen: boolean;
}

const HeadingBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate("/admin/login");
  };

  return (
    <div className="flex justify-between items-center my-4">
      <div className="flex items-center gap-2">
        <img
          src={blankProfile}
          alt="Profile"
          className="w-12 h-12 rounded-full m-2"
        />
        <div>
          <h2 className="text-medium font-bold">Admin John</h2>
          <h2 className="text-xs">Head Administrator</h2>
        </div>
      </div>

      <Dropdown>
        <DropdownTrigger>
          <Button className="bg-transparent" isIconOnly>
            <Settings />
          </Button>
        </DropdownTrigger>{" "}
        <DropdownMenu>
          <DropdownItem key="theme">
            <ThemeSwitch variant="button" showLabel={true} className="w-full" />
          </DropdownItem>
          <DropdownItem key="logout">
            <button
              className="flex items-center gap-2 w-full"
              onClick={handleLogout}
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

const MenuItem = ({
  icon: Icon,
  label,
  to,
}: {
  icon: any;
  label: string;
  to: string;
}) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

export const AdminSidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <motion.div
      initial={false}
      animate={{
        width: isOpen ? 280 : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
      className="bg-[#023E8A] text-white border-r border-divider h-full flex flex-col p-5 shadow-lg overflow-hidden"
    >
      <HeadingBar />
      <Divider className="my-4" />

      <nav className="flex flex-col gap-2">
        <MenuItem icon={Home} label="Dashboard" to="/admin/dashboard" />
        <MenuItem
          icon={Users}
          label="User Accounts"
          to="/admin/accounts/users"
        />
        <MenuItem
          icon={Users}
          label="Admin Accounts"
          to="/admin/accounts/admins"
        />
        <MenuItem
          icon={Building2}
          label="Parking Lot Owners"
          to="/admin/parking-owners"
        />
        <MenuItem icon={FileText} label="Requests" to="/admin/requests" />
      </nav>
    </motion.div>
  );
};
