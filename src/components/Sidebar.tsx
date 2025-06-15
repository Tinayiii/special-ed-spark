
import { NavLink } from "react-router-dom";
import { Home, Book, Image as ImageIcon, Sparkles, Settings, Users, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const navItems = [
    { to: "/", icon: Home, label: "主页" },
    { to: "/course-dashboard", icon: LayoutDashboard, label: "课程看板" },
    { to: "/lesson-planner", icon: Book, label: "教案生成" },
    { to: "/image-editor", icon: ImageIcon, label: "插图修改" },
    { to: "/community", icon: Users, label: "社区" },
  ];

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string; }) => (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      <Icon className="mr-4 h-6 w-6" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r p-6 flex flex-col">
      <div className="flex items-center mb-12 px-2">
        <Sparkles className="h-10 w-10 text-primary" />
        <h1 className="ml-3 text-26 font-medium leading-1.4">特教之光</h1>
      </div>
      <nav className="flex flex-col space-y-3 flex-grow">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
      <div className="border-t -mx-6 my-4"></div>
      <div>
        <NavItem to="/settings" icon={Settings} label="设置" />
      </div>
    </aside>
  );
};

export default Sidebar;
