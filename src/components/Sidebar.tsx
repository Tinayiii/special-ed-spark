
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Book, Image as ImageIcon, Sparkles, Settings, Users, MessageSquare, User as UserIcon, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
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
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          isCollapsed && "justify-center px-2"
        )
      }
    >
      <div className="flex items-center">
        <Icon className={cn("h-6 w-6", isCollapsed ? "mr-0" : "mr-4")} />
        {!isCollapsed && <span>{label}</span>}
      </div>
      {hasBadge && !isCollapsed && (
        <Badge variant="secondary" className="ml-2 h-5 text-xs">
          活跃
        </Badge>
      )}
    </NavLink>
  );

  const RecentConversationItem = ({ conversation }: { conversation: Pick<Tables<'teaching_resources'>, 'id' | 'title'> }) => {
    if (isCollapsed) return null;
    
    return (
      <button
        onClick={() => navigate('/chat', { state: { resumeTask: conversation.id } })}
        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left"
      >
        <MessageSquare className="mr-4 h-4 w-4 flex-shrink-0" />
        <span className="truncate">{conversation.title}</span>
      </button>
    );
  };

  return (
    <aside className={cn(
      "flex-shrink-0 bg-card border-r p-6 flex flex-col transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* 折叠按钮 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute top-4 right-2 h-8 w-8"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
      </Button>

      <div className={cn("flex items-center mb-12", isCollapsed ? "justify-center px-0" : "px-2")}>
        <Sparkles className="h-10 w-10 text-primary" />
        {!isCollapsed && <h1 className="ml-3 text-26 font-medium leading-1.4">特教之光</h1>}
      </div>
      
      <nav className="flex flex-col space-y-3 flex-grow">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
        {recentConversations.length > 0 && !isCollapsed && (
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
        {user ? (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center w-full px-4 py-3 text-base rounded-lg transition-colors",
                isActive ? "bg-muted" : "hover:bg-muted",
                isCollapsed && "justify-center px-2"
              )
            }
          >
            <Avatar className={cn("flex-shrink-0", isCollapsed ? "h-8 w-8" : "h-9 w-9 mr-4")}>
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.nickname || profile?.full_name || user.email || '用户头像'} />
              <AvatarFallback>
                {profile?.nickname ? profile.nickname[0].toUpperCase() : 
                 profile?.full_name ? profile.full_name[0].toUpperCase() : 
                 (user.email ? user.email[0].toUpperCase() : <UserIcon size={16} />)}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-medium text-foreground truncate">
                  {profile?.nickname || profile?.full_name || user.email}
                </span>
                <span className="text-sm text-muted-foreground">个人设置</span>
              </div>
            )}
          </NavLink>
        ) : (
          <NavItem to="/settings" icon={Settings} label="设置" />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
