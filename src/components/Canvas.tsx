
import React from 'react';
import { Button } from "@/components/ui/button";
import { X, Wand2 } from 'lucide-react';
import { Intent, TeachingInfo } from '@/types/chat';
import { cn } from '@/lib/utils';

// 为图片生成任务定制的Canvas内容
const ImageGenCanvas = ({ data }: { data: TeachingInfo }) => {
    return (
        <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground">为图片生成提供更多细节</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">主题：</span>{data.topic}</p>
                <p><span className="font-semibold text-foreground">年级：</span>{data.grade}</p>
                <p><span className="font-semibold text-foreground">目标：</span>{data.objective}</p>
            </div>
            {/* 未来可以在此添加图片风格、构图等更多输入项 */}
            <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                <Wand2 className="mr-2 h-4 w-4" />
                生成图片
            </Button>
            <p className="text-xs text-muted-foreground text-center">点击生成后，图片将出现在对话中。</p>
        </div>
    )
}

// Canvas 主组件
interface CanvasProps {
  onClose: () => void;
  intent: Intent | null;
  data: TeachingInfo;
}

const Canvas: React.FC<CanvasProps> = ({ onClose, intent, data }) => {
  const renderContent = () => {
    switch (intent) {
      case 'image-generation':
        return <ImageGenCanvas data={data} />;
      case 'lesson-plan':
        return <div className="animate-fade-in text-center text-muted-foreground"><p>教案生成界面正在开发中...</p></div>;
      case 'ppt-creation':
        return <div className="animate-fade-in text-center text-muted-foreground"><p>PPT 创建界面正在开发中...</p></div>;
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
