
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface CollectedInfo {
  teaching_object?: string;
  textbook_edition?: string;
  subject?: string;
  long_term_goal?: string;
  current_topic?: string;
  current_objective?: string;
}

export const useChatLogic = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [collectedInfo, setCollectedInfo] = useState<CollectedInfo>({});
  const [isInfoComplete, setIsInfoComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    console.log('发送消息:', content);
    console.log('当前用户:', user.id);
    console.log('已收集信息:', collectedInfo);

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('调用 ai-chat Edge Function...');
      
      // 调用Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: content,
          history: messages,
          collectedInfo: collectedInfo
        }
      });

      console.log('Edge Function 响应:', { data, error });

      if (error) {
        console.error('Edge Function 错误:', error);
        throw new Error(`调用AI服务失败: ${error.message}`);
      }

      if (!data) {
        throw new Error('AI服务返回空响应');
      }

      // 处理AI响应
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply || '抱歉，我无法生成响应。',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // 更新收集的信息
      if (data.newly_collected_info) {
        console.log('更新收集信息:', data.newly_collected_info);
        setCollectedInfo(prev => ({ ...prev, ...data.newly_collected_info }));
      }

      // 检查信息是否完整
      if (data.is_complete) {
        console.log('信息收集完成');
        setIsInfoComplete(true);
        setCollectedInfo(data.collected_info || collectedInfo);
      }

      // 处理任务准备就绪的情况
      if (data.task_ready && data.intent) {
        console.log('任务准备就绪:', data.intent);
        // 这里可以添加任务处理逻辑
      }

    } catch (error) {
      console.error('发送消息错误:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('发送消息失败');
    } finally {
      setIsLoading(false);
    }
  }, [user, messages, collectedInfo]);

  return {
    messages,
    isLoading,
    sendMessage,
    messagesEndRef,
    scrollToBottom,
    collectedInfo,
    isInfoComplete
  };
};
