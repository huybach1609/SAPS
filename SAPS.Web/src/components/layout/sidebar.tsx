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
    Tooltip
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
    CreditCard,
    CircleAlert,
    Clock
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeSwitch } from "../theme-switch";
import blankProfile from "../../assets/Default/blank-profile-picture.webp"
import { useAuth } from "@/services/auth/AuthContext";
import { OWNER_ROLE } from "@/config/base";
import { useParkingLot } from "@/pages/ParkingLotOwner/ParkingLotContext";

interface SidebarProps {
    isOpen: boolean;
    role?: 'admin' | 'parkinglotowner';

}

interface NavigationItem {
    icon: React.ReactNode;
    title: string;
    path: string;
    isActive?: boolean;
}

interface NavigationListProps {
    items: NavigationItem[];
}

const NavigationList: React.FC<NavigationListProps> = ({ items }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedParkingLot } = useParkingLot();

    return (
        <Listbox aria-label="Navigation List" className="flex flex-col gap-2">
            {items.map((item, index) => {
                // Check if item should be disabled based on isActive prop and parking lot status
                const isDisabled = item.isActive !== undefined &&
                    (selectedParkingLot?.status === 'Active' ? !item.isActive : item.isActive);

                const listboxItem = (
                    <>
                        <ListboxItem
                            color="secondary"
                            key={index}
                            startContent={item.icon}
                            endContent={isDisabled ?
                                <Tooltip
                                    key={index}
                                    content="Renew your subscription to access this feature"
                                    placement="right"
                                    color="warning"
                                    className="text-background"
                                >
                                    <CircleAlert size={16} />
                                </Tooltip>
                                : null}
                            title={item.title}
                            isReadOnly={isDisabled}
                            onClick={() => navigate(item.path)}
                            className={`p-3 
                             ${location.pathname === item.path ? 'bg-primary text-background' : ''}
                             hover:bg-primary hover:text-background
                             ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                             `}
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
        path: "/admin/home"
    },
    {
        icon: <Users size={20} />,
        title: "Account List",
        path: "/admin/accounts"
    },
    {
        icon: <Building2 size={20} />,
        title: "Parking Lot Owner List",
        path: "/admin/parking-owners"
    },
    {
        icon: <FileText size={20} />,
        title: "Request List",
        path: "/admin/requests"
    }
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
        path: "/owner/parking-info"
    },
    {
        icon: <Users size={20} />,
        title: "Staff List",
        path: "/owner/staff"
    },
    {
        icon: <ClipboardList size={20} />,
        title: "Parking History",
        path: "/owner/history"
    },
    {
        icon: <DollarSign size={20} />,
        title: "Parking Fee Management",
        path: "/owner/parking-fee",
        isActive: true
    },
    {
        icon: <AlertTriangle size={20} />,
        title: "Incident Reports",
        path: "/owner/incidents",
        isActive: true
    },
    {
        icon: <FileText size={20} />,
        title: "Whitelist",
        path: "/owner/whitelist",
        isActive: true
    },
    {
        icon: <Clock size={20} />,
        title: "Staff Shift Management",
        path: "/owner/staff-shift",
        isActive: true
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
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    return (
        <div className="flex justify-between items-center my-4">
            <div className="flex items-center gap-2">
                <img src={blankProfile} alt="Profile" className="w-12 h-12 rounded-full m-2" />
                <div>
                    <h2 className="text-medium font-bold ">{user?.fullName}</h2>
                    <h2 className="text-xs ">Head Administrator</h2>
                </div>
            </div>

            <Dropdown>
                <DropdownTrigger>
                    <Button className="bg-transparent text-background " isIconOnly><EllipsisVertical /></Button>
                </DropdownTrigger>
                <DropdownMenu className="dark">
                    <DropdownItem key="settings" textValue="Settings ">

                        <button
                            className="flex items-center gap-2 w-full text-left transition-opacity hover:opacity-80 "
                        ><Settings size={16} />Settings
                        </button>


                    </DropdownItem>


                    <DropdownItem textValue="Change Themes" key="changeThemes">
                        <ThemeSwitch
                            variant="button"
                            showLabel={true}
                            className="w-full"
                        />
                    </DropdownItem>
                    {user?.role === OWNER_ROLE ? (
                        <DropdownItem textValue="Subscription" key="subscription"
                        >
                            <button
                                className="flex items-center gap-2 w-full text-left transition-opacity hover:opacity-80 "
                                onClick={() => navigate("/owner/subscription")}
                            >
                                <CreditCard size={16} /> Subscription
                            </button>
                        </DropdownItem>
                    ) : null}
                    <DropdownItem textValue="Logout" key="logout">
                        <button
                            className="flex items-center gap-2 w-full text-left transition-opacity hover:opacity-80 "
                            onClick={logout}
                        ><LogOut size={16} />Logout
                        </button>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    );
};

export const SideBar: React.FC<SidebarProps> = ({ isOpen }) => {
    const { user } = useAuth();
    return (
        <motion.div
            initial={false}
            animate={{
                width: isOpen ? 300 : 0,
                opacity: isOpen ? 1 : 0,
                // maxWidth: isOpen ? 300: 0,
                minWidth: isOpen ? 250 : 0,

            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className=" 
            bg-foreground text-background border-r border-divider h-full flex flex-col
            p-5 shadow-lg overflow-hidden z-50
            "

        >
            <HeadingBar />
            <Divider className="bg-border my-4" />
            {user?.role === OWNER_ROLE ?
                <NavigationList items={parkingLotOwnerItems} /> :
                <NavigationList items={adminItems} />
            }
            {/* // {role === 'parkinglotowner' ? <ParkingLotOwnerList /> : <AdminList />} */}
        </motion.div>
    );
};
