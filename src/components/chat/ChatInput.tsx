
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isCanvasOpen: boolean;
}

const ChatInput = ({ input, setInput, onSubmit, isLoading, isCanvasOpen }: ChatInputProps) => {
  return (
    <div className="p-4 bg-card border-t">
      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="与 AI 助手对话..."
          className="flex-1"
          disabled={isLoading || isCanvasOpen}
        />
        <Button type="submit" size="icon" disabled={!input.trim() || isLoading || isCanvasOpen}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
