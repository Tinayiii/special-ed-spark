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

  const resetToInitialState = () => {
    setMessages([
      {
        role: 'assistant',
        content: '你好！我是你的特教之光AI助手Lily，有什么可以帮助你的吗？例如：帮我创建一个关于春天的教案。'
      }
    ]);
    setInput('');
    setIsLoading(false);
    setCollectedInfo({});
    setCurrentIntent(null);
    setIsCanvasOpen(false);
    setPlanToShow(null);
  };

  const sendMessage = async (messageContent: string) => {
    if (isLoading || !messageContent.trim()) return;

    if (!user) {
        openAuthDialog();
        return;
    }

    console.log('【AI调试】开始发送消息:', messageContent);
    console.log('【AI调试】当前用户:', user?.id);
    console.log('【AI调试】当前收集信息:', collectedInfo);

    const userMessage: Message = { role: 'user', content: messageContent };
    
    // 立即添加用户消息
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // 准备发送给AI的历史记录（排除初始欢迎消息）
    const chatHistory = newMessages.slice(1).map(({role, content}) => ({role, content}));
    
    console.log('【AI调试】即将调用 ai-chat Edge Function，参数:');
    console.log({
      message: messageContent,
      history: chatHistory,
      collectedInfo: collectedInfo,
    });

    try {
      const { data, error, status } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: messageContent,
          history: chatHistory,
          collectedInfo: collectedInfo,
        },
      });

      console.log('【AI调试】ai-chat Edge Function 响应：', { data, error, status });

      if (error) {
        console.error('【AI错误】Supabase函数调用错误:', error, '状态码:', status);
        let errorMsg = 'Supabase Edge Function 调用失败。';
        if (status === 401) {
          errorMsg += '（未授权，请重新登录）';
        } else if (status === 500) {
          errorMsg += '（服务器错误，Edge Function 运行异常）';
        } else if (error.message) {
          errorMsg += ` 错误信息：${error.message}`;
        }
        addMessage({ role: 'assistant', content: errorMsg });
        throw error;
      }

      if (!data) {
        console.error('【AI错误】Edge Function 响应为空');
        addMessage({ role: 'assistant', content: '抱歉，AI服务暂时不可用，请稍后再试。' });
        return;
      }
      
      const { reply, is_complete, collected_info, newly_collected_info, task_ready, intent } = data;

      console.log('【AI调试】AI回复:', reply);
      console.log('【AI调试】任务状态:', { is_complete, task_ready, intent });

      if (reply) {
        addMessage({ role: 'assistant', content: reply });
      } else {
        addMessage({ role: 'assistant', content: '抱歉，我暂时无法理解您的问题，请重新描述一下。' });
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
      }

    } catch(err) {
      console.error("【AI调试】调用AI聊天函数时出错:", err);
      let errorMessage = "抱歉，遇到技术问题，AI服务暂无法使用。";
      if (err instanceof Error) {
        errorMessage += `（${err.message}）`;
      }
      addMessage({ role: 'assistant', content: errorMessage });
    } finally {
      setIsLoading(false);
      console.log('【AI调试】消息发送流程完成');
    }
  };

  useEffect(() => {
    const state = location.state as { initialPrompt?: string, resumeTask?: string } | null;
    if (state?.initialPrompt) {
      sendMessage(state.initialPrompt);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (state?.resumeTask) {
      console.log('Resuming task:', state.resumeTask);
      addMessage({ role: 'assistant', content: `好的，让我们继续之前的任务。` });
      navigate(location.pathname, { replace: true, state: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleCloseCanvas = () => {
    setIsCanvasOpen(false);
    resetConversation();
    addMessage({ role: 'assistant', content: '好的，任务已取消。有什么新的可以帮你？' });
  };

  const handleGeneratePptOutline = async () => {
    setIsLoading(true);
    
    const subject = profile?.subject || '通用';
    const textbook_edition = profile?.textbook_edition || '通用版本';
    const teaching_object = profile?.teaching_object || '学生';

    try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-ppt-outline', {
            body: { 
                topic: collectedInfo.topic,
                objective: collectedInfo.objective,
                grade: collectedInfo.grade,
                subject,
                textbook_edition,
                teaching_object
            },
        });

        if (functionError) throw functionError;

        const { pptOutline } = functionData;

        const { data: resourceData, error: resourceError } = await supabase
            .from('teaching_resources')
            .insert({
                user_id: user!.id,
                title: `《${collectedInfo.topic}》专业PPT大纲`,
                content: pptOutline,
                resource_type: 'ppt_outline',
                metadata: {
                  ...collectedInfo,
                  subject,
                  textbook_edition,
                  teaching_object,
                  structure_type: 'professional_teaching_rhythm'
                } as any,
            })
            .select()
            .single();

        if (resourceError) throw resourceError;
        
        setIsCanvasOpen(false);
        resetConversation();
        addMessage({
            role: 'assistant',
            content: `针对主题"${collectedInfo.topic}"的专业PPT大纲已生成！这份大纲按照标准的教学节奏设计，包含完整的5段式教学流程，每个环节都有详细的内容规划和可视化建议。`,
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
    
    const subject = profile?.subject || '通用';
    const textbook_edition = profile?.textbook_edition || '通用版本';
    const teaching_object = profile?.teaching_object || '学生';
    const long_term_goal = profile?.long_term_goal || '提升学科素养';

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-lesson-plan', {
          body: { 
            topic: collectedInfo.topic,
            grade: collectedInfo.grade,
            objective: collectedInfo.objective,
            subject,
            textbook_edition,
            teaching_object,
            long_term_goal
          },
      });

      if (functionError) throw functionError;

      const { lessonPlan } = functionData;

      const { data: resourceData, error: resourceError } = await supabase
          .from('teaching_resources')
          .insert({
              user_id: user!.id,
              title: `《${collectedInfo.topic}》教案设计`,
              content: lessonPlan,
              resource_type: 'lesson_plan',
              metadata: {
                ...collectedInfo,
                subject,
                textbook_edition,
                teaching_object,
                long_term_goal
              } as any,
          })
          .select()
          .single();
      
      if (resourceError) throw resourceError;
      
      setIsCanvasOpen(false);
      resetConversation();
      addMessage({
          role: 'assistant',
          content: `针对主题"${collectedInfo.topic}"为${collectedInfo.grade}学生设计的专业教案已生成！这份教案严格按照11个标准结构设计，体现了以学生为中心的教学理念。`,
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

  const handleGenerateImages = async () => {
    setIsLoading(true);
    
    try {
      addMessage({
        role: 'assistant',
        content: '正在为您生成智能图片提示词，请稍候...'
      });
      
      // 1. Generate prompts
      const { data: promptsData, error: promptsError } = await supabase.functions.invoke('generate-image-prompts', {
        body: {
          teachingObject: profile?.teaching_object || '',
          subject: profile?.subject || '',
          longTermGoal: profile?.long_term_goal || '',
          topic: collectedInfo.topic || '',
          objective: collectedInfo.objective || ''
        },
      });

      if (promptsError) throw promptsError;

      const { reasoning, prompts } = promptsData;

      if (!prompts || prompts.length === 0) {
        throw new Error("AI未能生成有效的图片提示词，请调整输入后重试。");
      }

      addMessage({
        role: 'assistant',
        content: `提示词已生成！\n\n**设计思路**:\n${reasoning}\n\n正在为您生成 ${prompts.length} 张图片...`
      });

      // 2. Generate images from prompts
      const { data: imagesData, error: imagesError } = await supabase.functions.invoke('generate-image', {
        body: { prompts },
      });

      if (imagesError) throw imagesError;

      const { urls } = imagesData;

      // 3. Save to teaching_resources
      const { data: resourceData, error: resourceError } = await supabase
        .from('teaching_resources')
        .insert({
          user_id: user!.id,
          title: `为"${collectedInfo.topic}"生成的系列图片`,
          content: '', // Not used for image group
          resource_type: 'image_group',
          metadata: { 
            prompts,
            urls,
            baseInfo: collectedInfo,
            reasoning,
          } as any,
        })
        .select()
        .single();
      
      if (resourceError) throw resourceError;
      
      setIsCanvasOpen(false);
      resetConversation();
      addMessage({
        role: 'assistant',
        content: `"${collectedInfo.topic}"的系列图片已生成！`,
        resource: resourceData
      });

    } catch (error: any) {
        console.error('Error generating images:', error);
        addMessage({
            role: 'assistant',
            content: `抱歉，生成图片时出错了：${error.message}`
        });
    } finally {
        setIsLoading(false);
        if (isCanvasOpen) {
          setIsCanvasOpen(false);
          resetConversation();
        }
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
    handleGenerateImages,
    planToShow,
    setPlanToShow,
    sendMessage,
    resetToInitialState,
  };
};
