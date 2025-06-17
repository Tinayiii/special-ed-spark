import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Book, Image as ImageIcon, Sparkles, Settings, Users, MessageSquare, User as UserIcon, ChevronDown, ChevronRight, X, ArrowUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useChatLogic } from "@/hooks/useChatLogic";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const { createNewConversation } = useChatLogic();
  const [conversations, setConversations] = useState<Pick<Tables<'conversations'>, 'id' | 'title' | 'updated_at'>[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchConversations = async (append = false, searchText = search) => {
    if (!user) return;
    try {
      let query = supabase
        .from('conversations')
        .select('id, title, updated_at, pinned')
        .eq('user_id', user.id)
        .eq('status', 'active');
      if (searchText) {
        query = query.ilike('title', `%${searchText}%`);
      }
      query = query.order('pinned', { ascending: false })
        .order('updated_at', { ascending: false })
                   .range(append ? conversations.length : 0, (append ? conversations.length : 0) + PAGE_SIZE - 1);
      const { data, error, count } = await query;
      if (error) throw error;
      if (append) {
        setConversations(prev => [...prev, ...(data || [])]);
      } else {
      setConversations(data || []);
      }
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    if (user) fetchConversations(false, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, user]);

  const handleNewChat = async () => {
    const conversationId = await createNewConversation();
    if (conversationId) {
      navigate('/chat', { state: { resumeConversation: conversationId } });
    } else {
      navigate('/chat');
    }
  };

  const navItems = [
    { to: "/", icon: Home, label: "主页" },
    { to: "/chat", icon: MessageSquare, label: "智能对话", hasBadge: location.pathname === "/chat", onClick: handleNewChat },
    { to: "/lesson-planner", icon: Book, label: "教案生成" },
    { to: "/image-editor", icon: ImageIcon, label: "插图修改" },
    { to: "/community", icon: Users, label: "社区" },
  ];

  const NavItem = ({ to, icon: Icon, label, hasBadge, onClick }: { 
    to: string; 
    icon: React.ElementType; 
    label: string; 
    hasBadge?: boolean;
    onClick?: () => void;
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
      onClick={onClick}
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

  const handleDeleteConversation = async (id: string) => {
    if (!user) return;
    await supabase.from('conversations').update({ status: 'archived' }).eq('id', id).eq('user_id', user.id);
    setConversations(conversations.filter(c => c.id !== id));
  };

  const handlePinConversation = async (id: string, pinned: boolean) => {
    if (!user) return;
    await supabase.from('conversations').update({ pinned: !pinned }).eq('id', id).eq('user_id', user.id);
    fetchConversations();
  };

  const ConversationItem = ({ conversation }: { conversation: Pick<Tables<'conversations'>, 'id' | 'title' | 'updated_at'> & { pinned?: boolean } }) => (
    <div className="flex items-center group hover:bg-muted rounded-lg px-2 py-1">
    <button
        onClick={() => navigate(`/chat/${user?.id}/${conversation.id}`)}
        className="flex items-center flex-1 text-sm font-medium text-muted-foreground hover:text-foreground w-0 min-w-0 truncate"
    >
        <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
      <span className="truncate">{conversation.title}</span>
        {conversation.pinned && <ArrowUp className="ml-1 h-3 w-3 text-yellow-500" title="置顶" />}
      </button>
      <button
        className="ml-2 p-1 rounded hover:bg-accent"
        title={conversation.pinned ? "取消置顶" : "置顶"}
        onClick={(e) => { e.stopPropagation(); handlePinConversation(conversation.id, !!conversation.pinned); }}
      >
        <ArrowUp className={conversation.pinned ? "text-yellow-500" : "text-muted-foreground"} />
      </button>
      <button
        className="ml-1 p-1 rounded hover:bg-destructive/20"
        title="删除"
        onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conversation.id); }}
      >
        <X className="text-destructive" />
    </button>
    </div>
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
        
        {user && (
          <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen} className="pt-4 mt-2">
            <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-2 text-base font-semibold text-primary bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 mr-2 text-primary" />
              <span>历史对话</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2 max-h-72 overflow-y-auto">
              <div className="flex items-center mb-2 px-2">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索对话..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
              {conversations.map((conv) => (
                <ConversationItem key={conv.id} conversation={conv} />
              ))}
              {hasMore && (
                <button
                  className="w-full py-2 text-sm text-primary hover:underline"
                  disabled={loadingMore}
                  onClick={async () => { setLoadingMore(true); await fetchConversations(true); setLoadingMore(false); }}
                >
                  {loadingMore ? "加载中..." : "加载更多"}
                </button>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </nav>
      
      <div className="border-t -mx-6 my-4"></div>
      <div>
        {user ? (
          <>
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
            <button
              className="w-full mt-2 px-4 py-2 text-base rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              onClick={async () => { await logout(); window.location.href = '/'; }}
            >
              退出登录
            </button>
          </>
        ) : (
          <NavItem to="/settings" icon={Settings} label="设置" />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
