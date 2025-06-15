import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, Eye } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { recognizeIntent } from '@/lib/intent-recognition';
import { getLLMResponse } from '@/services/aiService';
import { Message, Intent, ConversationPhase, TeachingInfo } from '@/types/chat';
import Canvas from '@/components/Canvas';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import LessonPlanDialog from '@/components/LessonPlanDialog';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPrompt = location.state?.initialPrompt;

  const [messages, setMessages] = useState<(Message & { lessonPlan?: string })[]>([
    {
      role: 'assistant',
      content: '你好！我是您的特教之光AI助手，有什么可以帮助您的吗？例如：帮我创建一个关于春天的教案。'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New state for conversation management
  const [conversationPhase, setConversationPhase] = useState<ConversationPhase>('greeting');
  const [currentIntent, setCurrentIntent] = useState<Intent | null>(null);
  const [collectedInfo, setCollectedInfo] = useState<TeachingInfo>({});
  const [requiredFields, setRequiredFields] = useState<Array<keyof TeachingInfo>>([]);
  const [currentQuestion, setCurrentQuestion] = useState<keyof TeachingInfo | null>(null);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [planToShow, setPlanToShow] = useState<string | null>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const addMessage = (message: Message & { lessonPlan?: string }) => {
    setMessages(prev => [...prev, message]);
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
    setIsCanvasOpen(false); // Make sure canvas closes on reset
  };

  const sendMessage = (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: Message = { role: 'user', content: messageContent };
    addMessage(userMessage);

    processAssistantResponse(messageContent);
  };

  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [initialPrompt]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
        sendMessage(input);
        setInput('');
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
        {/* Main chat panel */}
        <div className={cn(
            "flex flex-col h-full bg-muted/20 transition-all duration-500 ease-in-out",
            isCanvasOpen ? 'w-full lg:w-2/3' : 'w-full'
        )}>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message, index) => (
                  message.lessonPlan ? (
                    <div key={index} className="flex items-start gap-4 justify-start">
                         <Avatar className="w-10 h-10 border">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                            <Sparkles className="w-6 h-6" />
                            </AvatarFallback>
                        </Avatar>
                        <Card className="max-w-md md:max-w-lg lg:max-w-xl animate-fade-in">
                            <CardHeader>
                                <CardTitle>教案已生成</CardTitle>
                                <CardDescription>{message.content}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button className="w-full" onClick={() => setPlanToShow(message.lessonPlan || null)}>
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

            <div className="p-4 bg-card border-t">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
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
        </div>

        {/* Canvas Panel */}
        {isCanvasOpen && (
            <div className="w-full lg:w-1/3 border-l animate-slide-in-right shadow-lg">
                <Canvas
                    onClose={handleCloseCanvas}
                    intent={currentIntent}
                    data={collectedInfo}
                    onGenerateLessonPlan={handleGenerateLessonPlan}
                />
            </div>
        )}
        <LessonPlanDialog
            open={!!planToShow}
            onOpenChange={(open) => !open && setPlanToShow(null)}
            planContent={planToShow || ''}
        />
    </div>
  );
};

export default Chat;
