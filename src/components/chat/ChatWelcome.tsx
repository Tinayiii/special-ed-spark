
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp, Book, Image as ImageIcon } from 'lucide-react';

interface ChatWelcomeProps {
  onSendMessage: (message: string) => void;
}

const ChatWelcome = ({ onSendMessage }: ChatWelcomeProps) => {
  const [prompt, setPrompt] = useState('');

  const handleWelcomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSendMessage(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="w-full max-w-3xl flex-grow flex flex-col justify-center">
            <h1 className="text-44 font-medium leading-1.2 text-gray-800 mb-6 animate-fade-in-down">
            我能为您做什么？
            </h1>
            
            <form onSubmit={handleWelcomeSubmit} className="relative w-full mb-6">
              <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="给我一个任务，比如：为一名二年级学生生成一篇关于春天的识字课文..."
                  className="w-full p-4 pr-16 text-base rounded-2xl shadow-lg focus-visible:ring-2 focus-visible:ring-primary/50 transition-shadow min-h-[60px] resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleWelcomeSubmit(e as unknown as React.FormEvent);
                    }
                  }}
              />
              <Button
                  type="submit"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg h-11 w-11 bg-primary hover:bg-primary/90 disabled:bg-primary/50"
                  disabled={!prompt.trim()}
              >
                  <ArrowUp className="h-5 w-5" />
              </Button>
            </form>

            <div className="flex items-center justify-center gap-3">
              <span className="text-muted-foreground text-sm">或者试试这些：</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/lesson-planner">
                  <Book className="mr-2 h-4 w-4" />
                  生成教案
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/image-editor">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  修改插图
                </Link>
              </Button>
            </div>
        </div>
        <div className="pb-4">
            <a href="#more-use-cases" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            探索更多使用案例
            </a>
        </div>
    </div>
  );
};

export default ChatWelcome;
