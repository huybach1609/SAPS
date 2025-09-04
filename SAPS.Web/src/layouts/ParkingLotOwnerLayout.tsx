import { useState, useEffect } from "react";
import { Button, ScrollShadow, Select, SelectItem, Spinner } from "@heroui/react";
import { Menu, Building2 } from "lucide-react";
import { SideBar } from "@/components/layout/sidebar";
import { useParkingLot } from "@/pages/ParkingLotOwner/ParkingLotContext";

export function ParkingLotOwnerLayout({
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
  // Initialize state from localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : false;
  });

  // Use parking lot context
  let parkingLotData = null;
  let parkingLotError = false;

  try {
    parkingLotData = useParkingLot();
  } catch (error) {
    console.error('Error accessing parking lot context:', error);
    parkingLotError = true;
  }

  // Extract parking lot data safely
  const parkingLots = parkingLotData?.parkingLots || [];
  const selectedParkingLotId = parkingLotData?.selectedParkingLotId || null;
  const setSelectedParkingLotId = parkingLotData?.setSelectedParkingLotId || (() => { });
  const parkingLotLoading = parkingLotData?.loading || false;

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
            <div className="flex flex-col ml-4">
              <span className="text-lg font-semibold">{title}</span>
              <span className="text-sm text-gray-600">{description}</span>
            </div>
          </div>

          {/* Parking Lot Selector */}
          {!parkingLotError && (
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
                isDisabled={parkingLotLoading}
                startContent={<Building2 size={16} />}
              >
                {parkingLots.map((parkingLot) => (
                  <SelectItem key={parkingLot.id} aria-label={parkingLot.name}>
                    {parkingLot.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
        </div>

        {/* Main Content */}
        <ScrollShadow className={`container mx-auto  max-w-7xl px-10 flex-grow overflow-auto ${className}`}
         hideScrollBar={true}
        >
          {children}
        </ScrollShadow>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Full Screen Loading Overlay */}
      {parkingLotLoading && !parkingLotError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <span className="mt-4 text-white text-lg font-semibold">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}