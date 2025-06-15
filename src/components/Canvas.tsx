import React, { useState, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { X, Wand2, Loader2 } from 'lucide-react';
import { Intent, TeachingInfo } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const aspectRatios: Record<string, { w: number, h: number }> = {
    "1:1": { w: 1024, h: 1024 },
    "4:3": { w: 1024, h: 768 },
    "3:2": { w: 1024, h: 682 },
    "16:9": { w: 1280, h: 720 },
    "9:16": { w: 720, h: 1280 },
};

// 为图片生成任务定制的Canvas内容
const ImageGenCanvas = ({ onGenerate }: { onGenerate: () => void }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        onGenerate();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center">
            <div className="space-y-4 max-w-sm">
                 <h3 className="text-lg font-semibold">准备生成系列教学图片</h3>
                 <p className="text-sm text-muted-foreground">AI 将根据之前收集的信息，并结合您的个人偏好设置，智能生成一套 6-8 张相关的教学图片。</p>
                 <Button onClick={handleGenerate} disabled={isGenerating} className="w-full text-lg py-6">
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            生成中...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-5 w-5" />
                            开始智能生成
                        </>
                    )}
                 </Button>
                 <p className="text-xs text-muted-foreground text-center">点击生成后，图片组将出现在对话中。</p>
            </div>
        </div>
    )
}

// 为教案生成任务定制的Canvas内容
const LessonPlanCanvas = ({ onGenerate }: { onGenerate: () => void }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        onGenerate();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center">
            <div className="space-y-4 max-w-sm">
                 <h3 className="text-lg font-semibold">准备生成教案</h3>
                 <p className="text-sm text-muted-foreground">AI 将根据之前收集的信息为您创建一份详细的教案。</p>
                 <Button onClick={handleGenerate} disabled={isGenerating} className="w-full text-lg py-6">
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            生成中...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-5 w-5" />
                            生成教案
                        </>
                    )}
                 </Button>
            </div>
        </div>
    );
};

// 为PPT大纲生成任务定制的Canvas内容
const PptOutlineCanvas = ({ onGenerate }: { onGenerate: () => void }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        onGenerate();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in text-center">
            <div className="space-y-4 max-w-sm">
                 <h3 className="text-lg font-semibold">准备生成PPT大纲</h3>
                 <p className="text-sm text-muted-foreground">AI 将根据之前收集的信息，并结合您的个人资料（学科、使用教材版本）为您创建一份详细的PPT大纲。</p>
                 <Button onClick={handleGenerate} disabled={isGenerating} className="w-full text-lg py-6">
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            生成中...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-5 w-5" />
                            生成PPT大纲
                        </>
                    )}
                 </Button>
            </div>
        </div>
    );
};


// Canvas 主组件
interface CanvasProps {
  onClose: () => void;
  intent: Intent | null;
  data: TeachingInfo;
  onGenerateLessonPlan?: () => void;
  onGeneratePptOutline?: () => void;
  onGenerateImages?: () => void;
}

const Canvas: React.FC<CanvasProps> = ({ onClose, intent, data, onGenerateLessonPlan, onGeneratePptOutline, onGenerateImages }) => {
  const renderContent = () => {
    switch (intent) {
      case 'image-generation':
        return <ImageGenCanvas onGenerate={onGenerateImages!} />;
      case 'lesson-plan':
        return <LessonPlanCanvas onGenerate={onGenerateLessonPlan!} />;
      case 'ppt-creation':
        return <PptOutlineCanvas onGenerate={onGeneratePptOutline!} />;
      default:
        return <div className="animate-fade-in text-center text-muted-foreground"><p>任务正在处理中...</p></div>;
    }
  };

  const getTitle = (intent: Intent | null) => {
    switch (intent) {
      case 'image-generation': return '图片生成助手';
      case 'lesson-plan': return '教案助手';
      case 'ppt-creation': return 'PPT 助手';
      default: return '任务助手';
    }
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold text-foreground">{getTitle(intent)}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="p-6 flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Canvas;
