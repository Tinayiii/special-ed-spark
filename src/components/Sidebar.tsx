
import { NavLink } from "react-router-dom";
import { Home, Book, Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const navItems = [
    { to: "/", icon: Home, label: "看板" },
    { to: "/lesson-planner", icon: Book, label: "教案生成" },
    { to: "/image-editor", icon: ImageIcon, label: "插图修改" },
  ];

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-3 text-lg font-medium rounded-lg transition-colors",
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
        <h1 className="ml-3 text-2xl font-display font-bold">特教之光</h1>
      </div>
      <nav className="flex flex-col space-y-3">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
