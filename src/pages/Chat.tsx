
import React from 'react';
import { cn } from "@/lib/utils";
import Canvas from '@/components/Canvas';
import LessonPlanDialog from '@/components/LessonPlanDialog';
import { useChatLogic } from '@/hooks/useChatLogic';
import ChatWelcome from '@/components/chat/ChatWelcome';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { ChatHeader } from '@/components/chat/ChatHeader';

const Chat = () => {
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
  } = useChatLogic();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
        sendMessage(input);
        setInput('');
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
        <div className={cn(
            "flex flex-col h-full bg-muted/20 transition-all duration-500 ease-in-out",
            isCanvasOpen ? 'w-full lg:w-2/3' : 'w-full'
        )}>
            <ChatHeader />
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
