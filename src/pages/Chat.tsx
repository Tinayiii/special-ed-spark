
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPrompt = location.state?.initialPrompt;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是您的特教之光AI助手，有什么可以帮助您的吗？'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: Message = { role: 'user', content: messageContent };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: `你刚才说的是：“${messageContent}”。我现在还是一个简单的机器人，但很快我就会变得更智能！`
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  }

  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
      // Clear location state to prevent re-sending on re-render
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [initialPrompt, navigate, location.pathname]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
        sendMessage(input);
        setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
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

      <div className="p-4 bg-card border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="与 AI 助手对话..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
