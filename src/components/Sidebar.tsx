
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Book, Image as ImageIcon, Sparkles, Settings, Users, MessageSquare, User as UserIcon, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Pick<Tables<'conversations'>, 'id' | 'title' | 'updated_at'>[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, updated_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
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

  const ConversationItem = ({ conversation }: { conversation: Pick<Tables<'conversations'>, 'id' | 'title' | 'updated_at'> }) => (
    <button
      onClick={() => navigate('/chat', { state: { resumeConversation: conversation.id } })}
      className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground w-full text-left"
    >
      <MessageSquare className="mr-3 h-4 w-4 flex-shrink-0" />
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
        
        {user && conversations.length > 0 && (
          <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen} className="pt-4 mt-2">
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted rounded-lg">
              <span>历史对话</span>
              {isHistoryOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2">
              {conversations.map((conv) => (
                <ConversationItem key={conv.id} conversation={conv} />
              ))}
            </CollapsibleContent>
          </Collapsible>
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
                isActive
                  ? "bg-muted"
                  : "hover:bg-muted"
              )
            }
          >
            <Avatar className="h-9 w-9 mr-4 flex-shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || user.email || '用户头像'} />
              <AvatarFallback>
                {profile?.display_name ? profile.display_name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : <UserIcon size={16} />)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="font-medium text-foreground truncate">{profile?.display_name || user.email}</span>
              <span className="text-sm text-muted-foreground">个人设置</span>
            </div>
          </NavLink>
        ) : (
          <NavItem to="/settings" icon={Settings} label="设置" />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
