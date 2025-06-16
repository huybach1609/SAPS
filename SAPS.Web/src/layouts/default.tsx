import { useState } from "react";
import { Link } from "@heroui/link";
import { Button } from "@heroui/react";
import { Menu } from "lucide-react";
import { SideBar } from "@/components/layout/sidebar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen">
      {/* Sidebar */}
      <SideBar isOpen={isSidebarOpen} />
      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Top Bar with Toggle Button */}
        <div className="flex items-center p-4 border-b border-divider">
          <Button
            isIconOnly
            variant="light"
            onPress={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Dashboard</h1>
        </div>

        {/* Main Content */}
        <main className="container mx-auto max-w-7xl px-6 flex-grow overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full flex items-center justify-center py-3 border-t border-divider">
          <Link
            isExternal
            className="flex items-center gap-1 text-current"
            href="https://heroui.com"
            title="heroui.com homepage"
          >
            <span className="text-default-600">Powered by</span>
            <p className="text-primary">HeroUI</p>
          </Link>
        </footer>
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