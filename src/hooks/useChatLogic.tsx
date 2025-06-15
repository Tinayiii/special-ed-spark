
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { recognizeIntent } from '@/lib/intent-recognition';
import { Message, Intent, ConversationPhase, TeachingInfo } from '@/types/chat';

export const useChatLogic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPromptFromState = location.state?.initialPrompt;

  const [messages, setMessages] = useState<(Message & { lessonPlan?: string })[]>([
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

  const addMessage = (message: Message & { lessonPlan?: string }) => {
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

  const handleGenerateLessonPlan = () => {
    setIsLoading(true);
    // Simulate generation
    setTimeout(() => {
        const generatedPlan = `### 教学主题：${collectedInfo.topic || '未指定'}
### 适用年级：${collectedInfo.grade || '未指定'}
### 教学目标：
1. 知识与技能：${collectedInfo.objective || '认识并能正确、流利、有感情地朗读课文。'}
2. 过程与方法：通过小组合作、自主探究的方式，理解课文内容。
3. 情感态度与价值观：感受课文所表达的美好情感，激发学生热爱大自然的情感。

### 教学重难点：
重点：有感情地朗读课文。
难点：理解课文中蕴含的深刻道理。

### 教学过程：
一、导入新课（5分钟）
二、初读课文，整体感知（10分钟）
三、深入研读，合作探究（20分钟）
四、拓展延伸，布置作业（5分钟）`;
        
        setIsCanvasOpen(false);
        resetConversation();
        addMessage({
            role: 'assistant',
            content: `针对主题“${collectedInfo.topic}”为${collectedInfo.grade}学生设计的教案已生成！`,
            lessonPlan: generatedPlan
        });
        setIsLoading(false);
    }, 2000);
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
    planToShow,
    setPlanToShow,
    sendMessage,
  };
};

