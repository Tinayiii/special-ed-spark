import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import Canvas from '@/components/Canvas';
import LessonPlanDialog from '@/components/LessonPlanDialog';
import { useChatLogic } from '@/hooks/useChatLogic';
import ChatWelcome from '@/components/chat/ChatWelcome';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userId, conversationId } = useParams();
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    isCanvasOpen,
    handleCloseCanvas,
    currentIntent,
    collectedInfo,
    handleGenerateLessonPlan,
    handleGeneratePptOutline,
    planToShow,
    setPlanToShow,
    sendMessage,
    resetToInitialState,
  } = useChatLogic();

  // 加载历史会话
  useEffect(() => {
    if (!conversationId || !user) return;
    const loadConversation = async () => {
      setIsLoadingConversation(true);
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (messagesError) throw messagesError;
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select('collected_info')
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .single();
        if (conversationError) throw conversationError;
        // 这里可以根据messagesData/conversationData设置本地状态（如需）
        console.log('【对话管理】加载历史对话:', conversationId, messagesData?.length);
      } catch (error) {
        console.error('Error loading conversation:', error);
      } finally {
        setIsLoadingConversation(false);
      }
    };
    loadConversation();
  }, [conversationId, user]);

  // 处理初始消息
  useEffect(() => {
    if (!conversationId || !user) return;
    const state = location.state as { initialPrompt?: string; resumeConversation?: string } | null;
    if (state?.initialPrompt) {
      sendMessage(state.initialPrompt);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [conversationId, user, location.state, sendMessage, navigate, location.pathname]);

  // 兼容老的resumeConversation跳转
  useEffect(() => {
    const state = location.state as { resumeConversation?: string } | null;
    if (state?.resumeConversation && user) {
      navigate(`/chat/${user.id}/${state.resumeConversation}`, { replace: true });
    }
  }, [location.state, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
        sendMessage(input);
        setInput('');
    }
  };

  const handleNewConversation = () => {
    resetToInitialState();
  };

  if (isLoadingConversation) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">加载对话中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
        <div className={cn(
            "flex flex-col h-full bg-muted/20 transition-all duration-500 ease-in-out",
            isCanvasOpen ? 'w-full lg:w-2/3' : 'w-full'
        )}>
            <div className="flex items-center justify-between p-4 border-b">
                <ChatHeader />
                <Button variant="outline" size="sm" onClick={handleNewConversation}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    新对话
                </Button>
            </div>
            
            <div className="flex-grow flex flex-col overflow-hidden">
                {messages.length <= 1 && !isCanvasOpen ? (
                    <ChatWelcome onSendMessage={sendMessage} />
                ) : (
                    <>
                        <ChatMessageList 
                            messages={messages} 
                            isLoading={isLoading}
                            onViewResource={(content) => setPlanToShow(content)}
                        />
                        <ChatInput
                            input={input}
                            setInput={setInput}
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                            isCanvasOpen={isCanvasOpen}
                        />
                    </>
                )}
            </div>
        </div>

        {/* Canvas Panel */}
        {isCanvasOpen && (
            <div className="w-full lg:w-1/3 border-l animate-slide-in-right shadow-lg">
                <Canvas
                    onClose={handleCloseCanvas}
                    intent={currentIntent}
                    data={collectedInfo}
                    onGenerateLessonPlan={handleGenerateLessonPlan}
                    onGeneratePptOutline={handleGeneratePptOutline}
                />
            </div>
        )}
        <LessonPlanDialog
            open={!!planToShow}
            onOpenChange={(open) => !open && setPlanToShow(null)}
            planContent={planToShow || ''}
        />
        <AuthDialog />
    </div>
  );
};

export default Chat;
