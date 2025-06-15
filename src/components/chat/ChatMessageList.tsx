
import React, { useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Eye, Pencil } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from "sonner";

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
      case 'image_group':
        return '系列图片已生成';
      default:
        return '资源已生成';
    }
  };

  const handleEditClick = () => {
    toast.info("图片编辑功能正在开发中，敬请期待！");
  }

  const renderResource = (message: Message & { resource?: Tables<'teaching_resources'> | null }) => {
    if (!message.resource) return null;

    const { resource_type, content, metadata } = message.resource;

    if (resource_type === 'image_group' && metadata && Array.isArray((metadata as any).urls)) {
        const urls = (metadata as any).urls as string[];
        return (
            <Card className="max-w-xl md:max-w-2xl lg:max-w-4xl animate-fade-in w-full">
                <CardHeader>
                    <CardTitle>{getResourceTitle(resource_type)}</CardTitle>
                    <CardDescription>{message.content}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {urls.map((url, i) => (
                            <div key={i} className="group relative rounded-lg overflow-hidden aspect-square">
                                <img src={url} alt={`Generated image ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="secondary" size="sm" onClick={handleEditClick}>
                                        <Pencil className="mr-2 h-4 w-4" /> 编辑
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" variant="outline" onClick={() => onViewResource(JSON.stringify(metadata, null, 2))}>
                        <Eye className="mr-2 h-4 w-4" />
                        查看生成详情
                    </Button>
                </CardFooter>
            </Card>
        )
    }
    
    // Fallback to original resource card
    return (
        <Card className="max-w-md md:max-w-lg lg:max-w-xl animate-fade-in">
            <CardHeader>
                <CardTitle>{getResourceTitle(resource_type)}</CardTitle>
                <CardDescription>{message.content}</CardDescription>
            </CardHeader>
            <CardFooter>
                <Button className="w-full" onClick={() => onViewResource(content || '')}>
                    <Eye className="mr-2 h-4 w-4" />
                    查看详情
                </Button>
            </CardFooter>
        </Card>
    )
  }

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
                {renderResource(message)}
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
