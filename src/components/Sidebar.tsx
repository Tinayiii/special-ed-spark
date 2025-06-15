
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Book, Image as ImageIcon, Sparkles, Settings, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentConversations, setRecentConversations] = useState<Pick<Tables<'teaching_resources'>, 'id' | 'title'>[]>([]);

  useEffect(() => {
    if (user) {
      fetchRecentConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchRecentConversations = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('teaching_resources')
        .select('id, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentConversations(data || []);
    } catch (error) {
      console.error('Error fetching recent conversations:', error);
    }
  };

  const navItems = [
    { to: "/", icon: Home, label: "主页" },
    { to: "/chat", icon: MessageSquare, label: "智能对话", hasBadge: location.pathname === "/chat" },
    { to: "/lesson-planner", icon: Book, label: "教案生成" },
    { to: "/image-editor", icon: ImageIcon, label: "插图修改" },
    { to: "/community", icon: Users, label: "社区" },
  ];

  const NavItem = ({ to, icon: Icon, label, hasBadge }: { 
    to: string; 
    icon: React.ElementType; 
    label: string; 
    hasBadge?: boolean;
  }) => (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      <div className="flex items-center">
        <Icon className="mr-4 h-6 w-6" />
        <span>{label}</span>
      </div>
      {hasBadge && (
        <Badge variant="secondary" className="ml-2 h-5 text-xs">
          活跃
        </Badge>
      )}
    </NavLink>
  );

  const RecentConversationItem = ({ conversation }: { conversation: Pick<Tables<'teaching_resources'>, 'id' | 'title'> }) => (
    <button
      onClick={() => navigate('/chat', { state: { resumeTask: conversation.id } })}
      className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left"
    >
      <MessageSquare className="mr-4 h-4 w-4 flex-shrink-0" />
      <span className="truncate">{conversation.title}</span>
    </button>
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
        {recentConversations.length > 0 && (
          <div className="pt-4 mt-2">
            <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">最近对话</h3>
            <div className="flex flex-col space-y-1">
              {recentConversations.map((conv) => (
                <RecentConversationItem key={conv.id} conversation={conv} />
              ))}
            </div>
          </div>
        )}
      </nav>
      <div className="border-t -mx-6 my-4"></div>
      <div>
        <NavItem to="/settings" icon={Settings} label="设置" />
      </div>
    </aside>
  );
};

export default Sidebar;
