
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Book, Image as ImageIcon, Sparkles, Settings, Users, MessageSquare, User as UserIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sidebar, SidebarContent, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [recentConversations, setRecentConversations] = useState<Pick<Tables<'teaching_resources'>, 'id' | 'title'>[]>([]);
  const { state, toggleSidebar } = useSidebar();

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

  const NavItem = ({ to, icon: Icon, label, hasBadge }: { to: string; icon: React.ElementType; label: string; hasBadge?: boolean; }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 text-base font-medium rounded-lg transition-colors",
                state === 'collapsed' && "justify-center h-10 w-10 p-0",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {state === 'expanded' && <span className="ml-4 flex-1 truncate">{label}</span>}
            {state === 'expanded' && hasBadge && <Badge variant="secondary" className="ml-2 h-5 text-xs">活跃</Badge>}
          </NavLink>
        </TooltipTrigger>
        {state === 'collapsed' && <TooltipContent side="right"><p>{label}</p></TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );

  const RecentConversationItem = ({ conversation }: { conversation: Pick<Tables<'teaching_resources'>, 'id' | 'title'> }) => (
     <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
            <button
            onClick={() => navigate('/chat', { state: { resumeTask: conversation.id } })}
            className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left", state === 'collapsed' && "justify-center h-9 w-10 p-0")}
            >
            <MessageSquare className="h-4 w-4 shrink-0" />
            {state === 'expanded' && <span className="ml-4 truncate">{conversation.title}</span>}
            </button>
        </TooltipTrigger>
        {state === 'collapsed' && <TooltipContent side="right"><p>{conversation.title}</p></TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Sidebar collapsible="icon" className="p-0 border-r bg-card">
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
            <div className={cn("flex items-center gap-2 overflow-hidden", state === 'collapsed' && "gap-0")}>
                <Sparkles className="h-8 w-8 text-primary shrink-0" />
                {state === 'expanded' && <h1 className="text-xl font-semibold whitespace-nowrap">特教之光</h1>}
            </div>
            <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-muted">
                {state === 'expanded' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
        </div>

        <SidebarContent className="flex-grow p-4 pt-0">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
            {recentConversations.length > 0 && (
              <div className="pt-4 mt-2">
                {state === 'expanded' && <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">最近对话</h3>}
                <div className="flex flex-col space-y-1">
                  {recentConversations.map((conv) => (
                    <RecentConversationItem key={conv.id} conversation={conv} />
                  ))}
                </div>
              </div>
            )}
          </nav>
        </SidebarContent>

        <Separator className="my-2" />

        <SidebarFooter className="p-4">
            {user ? (
                 <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <NavLink
                                to="/settings"
                                className={({ isActive }) =>
                                cn(
                                    "flex items-center w-full rounded-lg transition-colors p-2",
                                    state === 'collapsed' && "justify-center",
                                    isActive ? "bg-muted" : "hover:bg-muted"
                                )
                                }
                            >
                                <Avatar className="h-9 w-9 shrink-0">
                                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || user.email || '用户头像'} />
                                <AvatarFallback>
                                    {profile?.full_name ? profile.full_name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : <UserIcon size={16} />)}
                                </AvatarFallback>
                                </Avatar>
                                {state === 'expanded' && (
                                    <div className="flex flex-col truncate ml-3">
                                        <span className="font-medium text-foreground truncate text-sm">{profile?.full_name || user.email}</span>
                                        <span className="text-xs text-muted-foreground">个人设置</span>
                                    </div>
                                )}
                            </NavLink>
                        </TooltipTrigger>
                        {state === 'collapsed' && <TooltipContent side="right"><p>个人设置</p></TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            ) : (
              <NavItem to="/settings" icon={Settings} label="设置" />
            )}
        </SidebarFooter>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
