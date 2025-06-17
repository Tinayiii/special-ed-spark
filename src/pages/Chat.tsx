
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
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  useEffect(() => {
    const state = location.state as { resumeConversation?: string; initialPrompt?: string } | null;
    
    // 处理从主页跳转过来的初始提示
    if (state?.initialPrompt && user) {
      console.log('【跳转逻辑】从主页接收到初始提示:', state.initialPrompt);
      // 发送初始消息
      sendMessage(state.initialPrompt);
      // 清理state，避免重复发送
      navigate(location.pathname, { replace: true, state: {} });
    } else if (state?.resumeConversation && user) {
      loadConversation(state.resumeConversation);
    }
  }, [location.state, user, sendMessage, navigate, location.pathname]);

  const loadConversation = async (conversationId: string) => {
    if (!user) return;
    
    setIsLoadingConversation(true);
    try {
      // 加载对话消息
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // 加载对话信息
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('collected_info')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (conversationError) throw conversationError;

      console.log('【对话管理】加载历史对话:', conversationId, messagesData?.length);
      
      // TODO: 这里需要将加载的消息设置到当前聊天中
      // 由于useChatLogic hook的限制，暂时只显示欢迎消息
      // 后续可以扩展hook来支持加载历史消息
      
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoadingConversation(false);
    }
  };

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
