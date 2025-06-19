import { Divider } from "@heroui/react";
import { User, ShieldCheck, Building2, FileText, Settings } from "lucide-react";

export type MenuItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: MenuItem[];
};

export const adminMenuItems: MenuItem[] = [
  {
    label: "Account Management",
    path: "/admin/accounts",
    icon: <User size={20} />,
    children: [
      {
        label: "User Accounts",
        path: "/admin/accounts/users",
        icon: <User size={20} />,
      },
      {
        label: "Admin Accounts",
        path: "/admin/accounts/admins",
        icon: <ShieldCheck size={20} />,
      },
    ],
  },
  {
    label: "Parking Lot Owners",
    path: "/admin/parking-owners",
    icon: <Building2 size={20} />,
  },
  {
    label: "Requests",
    path: "/admin/requests",
    icon: <FileText size={20} />,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: <Settings size={20} />,
  },
];

// Additional helper for breadcrumbs
export const getBreadcrumbsFromPath = (
  path: string
): { label: string; path: string }[] => {
  const parts = path.split("/").filter(Boolean);
  const breadcrumbs = [];
  let currentPath = "";

  for (const part of parts) {
    currentPath += `/${part}`;
    const menuItem = findMenuItemByPath(currentPath, adminMenuItems);

    if (menuItem) {
      breadcrumbs.push({
        label: menuItem.label,
        path: currentPath,
      });
    } else {
      // Handle dynamic segments (e.g., IDs)
      breadcrumbs.push({
        label: part.charAt(0).toUpperCase() + part.slice(1),
        path: currentPath,
      });
    }
  }

  return breadcrumbs;
};

// Helper function to find menu item by path
const findMenuItemByPath = (
  path: string,
  items: MenuItem[]
): MenuItem | undefined => {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findMenuItemByPath(path, item.children);
      if (found) return found;
    }
  }
  return undefined;
};
