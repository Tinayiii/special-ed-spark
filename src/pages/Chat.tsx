
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

const Chat = () => {
  const location = useLocation();
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

  // 处理从其他页面传递的初始提示或任务恢复
  useEffect(() => {
    const { initialPrompt, resumeTask } = location.state || {};
    
    if (initialPrompt) {
      sendMessage(initialPrompt);
      // 清除state以避免重复执行
      window.history.replaceState({}, document.title);
    } else if (resumeTask) {
      // 这里可以实现任务恢复逻辑
      // 暂时显示提示信息
      console.log('Resuming task:', resumeTask);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
