import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { recognizeIntent } from '@/lib/intent-recognition';
import { Message, Intent, ConversationPhase, TeachingInfo } from '@/types/chat';
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
      content: '你好！我是您的特教之光AI助手，有什么可以帮助您的吗？例如：帮我创建一个关于春天的教案。'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New state for conversation management
  const [conversationPhase, setConversationPhase] = useState<ConversationPhase>('greeting');
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);
  const [collectedInfo, setCollectedInfo] = useState<TeachingInfo>({});
  const [requiredFields, setRequiredFields] = useState<Array<keyof TeachingInfo>>([]);
  const [currentQuestion, setCurrentQuestion] = useState<keyof TeachingInfo | null>(null);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [planToShow, setPlanToShow] = useState<string | null>(null);

  const addMessage = (message: Message & { resource?: Tables<'teaching_resources'> | null }) => {
    setMessages(prev => [...prev, message]);
  };
  
  const getQuestionText = (field: keyof TeachingInfo, intent: Intent): string => {
    switch (field) {
        case 'topic': return `好的，我们开始吧！请告诉我${getIntentText(intent)}的主题是什么？`;
        case 'grade': return '明白了。这个任务是为哪个年级的学生准备的？';
        case 'objective': return '好的。这次教学或活动的主要目标是什么？';
        default: return '还需要什么信息？';
    }
  };
  
  const getIntentText = (intent: Intent): string => {
    switch (intent) {
        case 'lesson-plan': return '教案';
        case 'image-generation': return '图片';
        case 'ppt-creation': return 'PPT';
        default: return '任务';
    }
  };
  
  const resetConversation = () => {
    setConversationPhase('greeting');
    setCurrentIntent(null);
    setCollectedInfo({});
    setRequiredFields([]);
    setCurrentQuestion(null);
    setIsCanvasOpen(false);
  };

  const processAssistantResponse = async (userMessageContent: string) => {
    setIsLoading(true);
    let assistantResponseContent = '';

    if (conversationPhase === 'greeting' || conversationPhase === 'intent-recognition') {
        const intent = recognizeIntent(userMessageContent);
        setCurrentIntent(intent);

        if (intent === 'greeting') {
            assistantResponseContent = '你好！很高兴为您服务，请问我能帮您做什么？';
            setConversationPhase('intent-recognition');
        } else if (intent === 'unknown') {
            assistantResponseContent = '抱歉，我不太理解您的意思。您可以试试说“帮我生成一个教案”或者“创建一张关于夏天的图片”。';
            setConversationPhase('intent-recognition');
        } else {
            setConversationPhase('information-gathering');
            const fields: Array<keyof TeachingInfo> = ['topic', 'grade', 'objective'];
            setRequiredFields(fields);
            setCollectedInfo({});
            const firstQuestion = fields[0];
            setCurrentQuestion(firstQuestion);
            assistantResponseContent = getQuestionText(firstQuestion, intent);
        }
    } else if (conversationPhase === 'information-gathering') {
        const newCollectedInfo = { ...collectedInfo, [currentQuestion!]: userMessageContent };
        setCollectedInfo(newCollectedInfo);

        const currentIndex = requiredFields.indexOf(currentQuestion!);
        const nextIndex = currentIndex + 1;

        if (nextIndex < requiredFields.length) {
            const nextQuestion = requiredFields[nextIndex];
            setCurrentQuestion(nextQuestion);
            assistantResponseContent = getQuestionText(nextQuestion, currentIntent!);
        } else {
            setConversationPhase('task-fulfillment');
            const finalCollectedInfo = { ...newCollectedInfo, [currentQuestion!]: userMessageContent };
            setCollectedInfo(finalCollectedInfo);
            
            assistantResponseContent = `好的，信息收集完毕！\n- 主题: ${finalCollectedInfo.topic}\n- 年级: ${finalCollectedInfo.grade}\n- 目标: ${finalCollectedInfo.objective}\n\n正在为您准备${getIntentText(currentIntent!)}工具...`;
            addMessage({ role: 'assistant', content: assistantResponseContent });
            
            setIsCanvasOpen(true);
            setIsLoading(false);
            return;
        }
    }
    
    addMessage({ role: 'assistant', content: assistantResponseContent });
    setIsLoading(false);
  };
  
  const sendMessage = (messageContent: string) => {
    if (!messageContent.trim()) return;

    if (!user) {
        openAuthDialog();
        return;
    }

    const userMessage: Message = { role: 'user', content: messageContent };
    addMessage(userMessage);

    processAssistantResponse(messageContent);
  };

  useEffect(() => {
    if (initialPromptFromState) {
      sendMessage(initialPromptFromState);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [initialPromptFromState, navigate, location.pathname]);

  const handleCloseCanvas = () => {
    setIsCanvasOpen(false);
    resetConversation();
    addMessage({ role: 'assistant', content: '好的，任务已取消。有什么新的可以帮您？' });
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
              title: `为“${collectedInfo.topic}”创建的教案`,
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
          content: `针对主题“${collectedInfo.topic}”为${collectedInfo.grade}学生设计的教案已生成！`,
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
