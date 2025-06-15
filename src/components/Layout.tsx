
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";

const Layout = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isCollapsed ? 'ml-0' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
