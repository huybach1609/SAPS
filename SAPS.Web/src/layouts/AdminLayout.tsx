import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Menu } from "lucide-react";
import { SideBar } from "@/components/layout/sidebar";

export function AdminLayout({
   children,
   title = "",
   className = ""
}: {
   children: React.ReactNode;
   title?: string;
   className?: string;
}) {
   // Initialize state from localStorage
   const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
      const saved = localStorage.getItem('sidebarOpen');
      return saved ? JSON.parse(saved) : false;
   });

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
            </div>

            {/* Main Content */}
            <main className={`container mx-auto max-w-7xl px-6 flex-grow overflow-auto ${className}`}>
               {children}
            </main>
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

