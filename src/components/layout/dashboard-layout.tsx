import { Outlet, useLocation } from "react-router";
import { DashboardSidebar } from "./dashboard-sidebar";

export const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
