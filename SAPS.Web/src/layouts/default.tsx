import { useState, useEffect } from "react";
import { Link } from "@heroui/link";
import { Button, Select, SelectItem } from "@heroui/react";
import { Menu, Building2 } from "lucide-react";
import { SideBar } from "@/components/layout/sidebar";
import { useParkingLot } from "@/pages/ParkingLotOwner/ParkingLotContext";
import { useAuth } from "@/services/auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DefaultLayout({
  children,
  title = "Page Title",
  className = ""
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {

  var navigate = useNavigate();

  // Initialize state from localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : false;
  });

  const { user } = useAuth();



  // Only use parking lot context if user is a parking lot owner
  const isParkingLotOwner = user?.role === 'parkinglotowner';

  // Create a component that safely uses the parking lot context
  const ParkingLotSelector = () => {
    if (!isParkingLotOwner) return null;
    
    try {
      const parkingLotContext = useParkingLot();
      const { parkingLots, selectedParkingLotId, setSelectedParkingLotId, loading } = parkingLotContext;
      
      return (
        <div className="flex items-center gap-2">
          <Select
            aria-label="Select parking lot"
            placeholder="Select parking lot"
            selectedKeys={selectedParkingLotId ? [selectedParkingLotId] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string;
              if (selectedKey) {
                setSelectedParkingLotId(selectedKey);
              }
            }}
            className="w-64"
            isDisabled={loading}
            startContent={<Building2 size={16} />}
          >
            {parkingLots.map((parkingLot) => (
              <SelectItem key={parkingLot.id}>
                {parkingLot.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      );
    } catch (error) {
      // If ParkingLotProvider is not available, don't render the selector
      return null;
    }
  };

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }



  return (
    <div className="relative flex h-screen">
      {/* Sidebar */}
      <SideBar isOpen={isSidebarOpen} />
      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Top Bar with Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-divider">
          <div className="flex items-center">
            <Button
              isIconOnly
              variant="light"
              onPress={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{title}</h1>
          </div>

          {/* Parking Lot Selector - Only show for parking lot owners */}
          <ParkingLotSelector />
        </div>

        {/* Main Content */}
        <main className={`container mx-auto max-w-7xl px-6 flex-grow overflow-auto ${className}`}>
          {children}
        </main>

        {/* Footer */}
        {/* <footer className="w-full flex items-center justify-center py-3 border-t border-divider">
          <Link
            isExternal
            className="flex items-center gap-1 text-current"
            href="https://heroui.com"
            title="heroui.com homepage"
          >
            <span className="text-default-600">Powered by</span>
            <p className="text-primary">HeroUI</p>
          </Link>
        </footer> */}
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}