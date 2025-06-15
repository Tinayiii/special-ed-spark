
import React, { useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface ChatMessageListProps {
  messages: (Message & { resource?: Tables<'teaching_resources'> | null })[];
  isLoading: boolean;
  onViewResource: (content: string) => void;
}

const ChatMessageList = ({ messages, isLoading, onViewResource }: ChatMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const getResourceTitle = (resourceType: string) => {
    switch (resourceType) {
      case 'lesson_plan':
        return '教案已生成';
      case 'ppt_outline':
        return 'PPT大纲已生成';
      case 'image':
        return '图片已生成';
      default:
        return '资源已生成';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          message.resource ? (
            <div key={index} className="flex items-start gap-4 justify-start">
                <Avatar className="w-10 h-10 border">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                    <Sparkles className="w-6 h-6" />
                    </AvatarFallback>
                </Avatar>
                <Card className="max-w-md md:max-w-lg lg:max-w-xl animate-fade-in">
                    <CardHeader>
                        <CardTitle>{getResourceTitle(message.resource.resource_type)}</CardTitle>
                        <CardDescription>{message.content}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full" onClick={() => onViewResource(message.resource?.content || '')}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        ) : (
          <div
              key={index}
              className={cn(
              "flex items-start gap-4",
              message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
          >
              {message.role === 'assistant' && (
              <Avatar className="w-10 h-10 border">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                  <Sparkles className="w-6 h-6" />
                  </AvatarFallback>
              </Avatar>
              )}
              <div
              className={cn(
                  "max-w-md md:max-w-lg lg:max-w-xl rounded-xl px-4 py-3 text-base shadow-sm",
                  message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-card text-card-foreground rounded-bl-none'
              )}
              >
              <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
              <Avatar className="w-10 h-10 border">
                  <AvatarFallback>您</AvatarFallback>
              </Avatar>
              )}
          </div>
        )
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 justify-start">
            <Avatar className="w-10 h-10 border">
                <AvatarFallback className="bg-primary text-primary-foreground">
                <Sparkles className="w-6 h-6" />
                </AvatarFallback>
            </Avatar>
            <div className="bg-card text-card-foreground rounded-xl px-4 py-3 text-base shadow-sm rounded-bl-none">
                <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                </div>
            </div>
        </div>
        )}
        <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
