
import { useAuth } from "@/services/auth/AuthContext";
import { ParkingLotOwnerLayout } from "./ParkingLotOwnerLayout";
import { AdminLayout } from "./AdminLayout";

// import { useNavigate } from "react-router-dom";

export default function DefaultLayout({
  children,
  title = "",
  className = ""
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  const { user } = useAuth();

  if (user?.role === 'parkinglotowner') {
    return <ParkingLotOwnerLayout title={title} className={className}>
      {children}
    </ParkingLotOwnerLayout>
  } else {
    return <AdminLayout title={title} className={className}>
      {children}
    </AdminLayout>
  }

  // // var navigate = useNavigate();

  // // Initialize state from localStorage
  // const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
  //   const saved = localStorage.getItem('sidebarOpen');

  //   return saved ? JSON.parse(saved) : false;
  // });

  // const { user } = useAuth();

  // // Only use parking lot context if user is a parking lot owner
  // const isParkingLotOwner = user?.role === 'parkinglotowner';

  // // Conditionally use the parking lot hook
  // let parkingLotData = null;
  // let parkingLotError = false;

  // try {
  //   // Only call the hook if the user is a parking lot owner
  //   if (isParkingLotOwner) {
  //     parkingLotData = useParkingLot();
  //   }
  // } catch (error) {
  //   console.error('Error accessing parking lot context:', error);
  //   parkingLotError = true;
  // }

  // // Extract parking lot data safely
  // const parkingLots = parkingLotData?.parkingLots || [];
  // const selectedParkingLotId = parkingLotData?.selectedParkingLotId || null;
  // const setSelectedParkingLotId = parkingLotData?.setSelectedParkingLotId || (() => {});
  // const parkingLotLoading = parkingLotData?.loading || false;

  // // Create a component that safely renders the parking lot selector
  // const ParkingLotSelector = () => {
  //   if (!isParkingLotOwner || parkingLotError) return null;

  //   return (
  //     <div className="flex items-center gap-2">
  //       <Select
  //         aria-label="Select parking lot"
  //         placeholder="Select parking lot"
  //         selectedKeys={selectedParkingLotId ? [selectedParkingLotId] : []}
  //         onSelectionChange={(keys) => {
  //           const selectedKey = Array.from(keys)[0] as string;
  //           if (selectedKey) {
  //             setSelectedParkingLotId(selectedKey);
  //           }
  //         }}
  //         className="w-64"
  //         isDisabled={parkingLotLoading}
  //         startContent={<Building2 size={16} />}
  //       >
  //         {parkingLots.map((parkingLot) => (
  //           <SelectItem key={parkingLot.id}>
  //             {parkingLot.name}
  //           </SelectItem>
  //         ))}
  //       </Select>
  //     </div>
  //   );
  // };

  // // Save state to localStorage whenever it changes
  // useEffect(() => {
  //   localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  // }, [isSidebarOpen]);

  // const toggleSidebar = () => {
  //   setIsSidebarOpen(!isSidebarOpen);
  // }

  // return (
  //   <div className="relative flex h-screen">
  //     {/* Sidebar */}
  //     <SideBar isOpen={isSidebarOpen} />

  //     {/* Main Content Area */}
  //     <div className="flex flex-col flex-1">
  //       {/* Top Bar with Toggle Button */}
  //       <div className="flex items-center justify-between p-4 border-b border-divider">
  //         <div className="flex items-center">
  //           <Button
  //             isIconOnly
  //             variant="light"
  //             onPress={toggleSidebar}
  //             aria-label="Toggle sidebar"
  //           >
  //             <Menu size={20} />
  //           </Button>
  //           <h1 className="ml-4 text-lg font-semibold">{title}</h1>
  //         </div>

  //         {/* Parking Lot Selector - Only show for parking lot owners */}
  //         <ParkingLotSelector />
  //       </div>

  //       {/* Main Content */}
  //       <main className={`container mx-auto max-w-7xl px-6 flex-grow overflow-auto ${className}`}>
  //         {children}
  //       </main>
  //     </div>

  //     {/* Backdrop for mobile */}
  //     {isSidebarOpen && (
  //       <div
  //         className="fixed inset-0 bg-black/50 z-40 md:hidden"
  //         onClick={() => setIsSidebarOpen(false)}
  //       />
  //     )}

  //     {/* Full Screen Loading Overlay for Parking Lot Owner */}
  //     {isParkingLotOwner && parkingLotLoading && !parkingLotError && (
  //       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
  //         <div className="flex flex-col items-center">
  //           <Spinner size="lg" />
  //           <span className="mt-4 text-white text-lg font-semibold">Loading...</span>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );
}



