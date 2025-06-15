
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Message, Intent, TeachingInfo } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export const useChatLogic = () => {
  const { user, profile, openAuthDialog } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initialPromptFromState = location.state?.initialPrompt;

  const [messages, setMessages] = useState<(Message & { resource?: Tables<'teaching_resources'> | null })[]>([
    {
      role: 'assistant',
      content: '你好！我是你的特教之光AI助手Lily，有什么可以帮助你的吗？例如：帮我创建一个关于春天的教案。'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [collectedInfo, setCollectedInfo] = useState<TeachingInfo>({});
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [planToShow, setPlanToShow] = useState<string | null>(null);

  const addMessage = (message: Message & { resource?: Tables<'teaching_resources'> | null }) => {
    setMessages(prev => [...prev, message]);
  };
  
  const resetConversation = () => {
    setCollectedInfo({});
    setCurrentIntent(null);
    setIsCanvasOpen(false);
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    if (!user) {
        openAuthDialog();
        return;
    }

    const userMessage: Message = { role: 'user', content: messageContent };
    addMessage(userMessage);
    setIsLoading(true);

    const history = [...messages, userMessage].slice(1).map(({role, content}) => ({role, content}));

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: messageContent,
          history: history,
          collectedInfo: collectedInfo,
        },
      });

      if (error) throw error;
      
      const { reply, is_complete, collected_info, newly_collected_info, task_ready, intent } = data;

      if (reply) {
        addMessage({ role: 'assistant', content: reply });
      }

      let newCollectedInfo = { ...collectedInfo };
      if (newly_collected_info) {
        newCollectedInfo = { ...newCollectedInfo, ...newly_collected_info };
      }
      if (collected_info) {
        newCollectedInfo = { ...collected_info };
      }
      setCollectedInfo(newCollectedInfo);

      if (task_ready) {
        setCurrentIntent(intent);
        setIsCanvasOpen(true);
      } else if (is_complete) {
        // Information gathering is complete, AI has prompted for next action.
        // Waiting for user to specify a task.
      }

    } catch(err) {
      console.error("Error calling ai-chat function:", err);
      addMessage({ role: 'assistant', content: "抱歉，我好像出了一点问题，请稍后再试。" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPromptFromState) {
      sendMessage(initialPromptFromState);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [initialPromptFromState]);

  const handleCloseCanvas = () => {
    setIsCanvasOpen(false);
    resetConversation();
    addMessage({ role: 'assistant', content: '好的，任务已取消。有什么新的可以帮你？' });
  };

  const handleGeneratePptOutline = async () => {
    setIsLoading(true);
    
    const subject = profile?.subject || '通用';
    const textbook_edition = profile?.textbook_edition || '通用版本';

    try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-ppt-outline', {
            body: { 
                prompt: collectedInfo.topic,
                subject,
                textbook_edition
            },
        });

        if (functionError) throw functionError;

        const { pptOutline } = functionData;

        const { data: resourceData, error: resourceError } = await supabase
            .from('teaching_resources')
            .insert({
                user_id: user!.id,
                title: `为“${collectedInfo.topic}”创建的PPT大纲`,
                content: pptOutline,
                resource_type: 'ppt_outline',
                metadata: collectedInfo as any,
            })
            .select()
            .single();

        if (resourceError) throw resourceError;
        
        setIsCanvasOpen(false);
        resetConversation();
        addMessage({
            role: 'assistant',
            content: `针对主题“${collectedInfo.topic}”的PPT大纲已生成！`,
            resource: resourceData,
        });

    } catch (error) {
        console.error('Error generating PPT outline:', error);
        addMessage({
            role: 'assistant',
            content: '抱歉，生成PPT大纲时出错了，请稍后再试。'
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateLessonPlan = async () => {
    setIsLoading(true);
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-lesson-plan', {
          body: collectedInfo, // pass topic, grade, objective
      });

      if (functionError) throw functionError;

      const { lessonPlan } = functionData;

      const { data: resourceData, error: resourceError } = await supabase
          .from('teaching_resources')
          .insert({
              user_id: user!.id,
              title: `为“${(collectedInfo as any).topic}”创建的教案`,
              content: lessonPlan,
              resource_type: 'lesson_plan',
              metadata: collectedInfo as any,
          })
          .select()
          .single();
      
      if (resourceError) throw resourceError;
      
      setIsCanvasOpen(false);
      resetConversation();
      addMessage({
          role: 'assistant',
          content: `针对主题“${(collectedInfo as any).topic}”为${(collectedInfo as any).grade}学生设计的教案已生成！`,
          resource: resourceData
      });

    } catch(error) {
        console.error('Error generating or saving lesson plan:', error);
        addMessage({
            role: 'assistant',
            content: '抱歉，处理教案时出错了，请稍后再试。'
        });
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
