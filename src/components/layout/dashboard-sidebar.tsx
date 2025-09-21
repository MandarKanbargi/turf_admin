import { Link, useLocation } from "react-router";
import { cn } from "@/utils/cn";
import { Icons } from "@/components/icons";

const sidebarItems = [
  {
    name: "Overview",
    href: "/dashboard/overview",
    icon: Icons.house,
  },
  {
    name: "Bookings",
    href: "/dashboard/bookings",
    icon: Icons.ticket,
  },
  {
    name: "Turfs",
    href: "/dashboard/turfs",
    icon: Icons.volleyball,
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: Icons.users,
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: Icons.barChart,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Icons.settings,
  },
];

export const DashboardSidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
      {/* Logo/Brand */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900">EARTH 2.0</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-600 text-white"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
