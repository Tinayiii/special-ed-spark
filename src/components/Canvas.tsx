import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { X, Wand2 } from 'lucide-react';
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
const ImageGenCanvas = ({ data }: { data: TeachingInfo }) => {
    const initialPrompt = useMemo(() => {
        return `为一位${data.grade}的学生, 创建一张关于"${data.topic}"的图片，教学目标是"${data.objective}"。`;
    }, [data]);

    const [prompt, setPrompt] = useState(initialPrompt);
    const [aspectRatio, setAspectRatio] = useState<string>("1:1");
    const [dimensions, setDimensions] = useState(aspectRatios["1:1"]);
    const [realism, setRealism] = useState(70); // 0 is flat, 100 is realistic
    const [composition, setComposition] = useState(70); // 0 is background, 100 is subject

    const handleAspectRatioChange = (value: string) => {
        if (value && aspectRatios[value]) {
            setAspectRatio(value);
            setDimensions(aspectRatios[value]);
        }
    };
    
    const handleDimensionChange = (axis: 'w' | 'h', value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setDimensions(prev => ({...prev, [axis]: numValue}));
        } else if (value === '') {
            setDimensions(prev => ({...prev, [axis]: 0}));
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
             <div>
                <Label htmlFor="prompt" className="text-base font-semibold">创作指令</Label>
                <p className="text-sm text-muted-foreground mb-2">已根据对话内容自动生成，您可以细化修改。</p>
                <Textarea 
                    id="prompt" 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    rows={4}
                    placeholder="例如：把背景换成有长城的中国北方风光，再加一只熊猫。"
                />
            </div>
            
            <div>
                <Label className="text-base font-semibold">图片比例</Label>
                 <ToggleGroup type="single" value={aspectRatio} onValueChange={handleAspectRatioChange} className="grid grid-cols-5 gap-2 mt-2">
                    {Object.keys(aspectRatios).map(ratio => (
                        <ToggleGroupItem key={ratio} value={ratio} aria-label={`Aspect ratio ${ratio}`} className="h-12 text-xs md:text-sm">
                            {ratio}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            <div className="space-y-4">
                <Label className="text-base font-semibold">快速调整</Label>
                <div className="space-y-5 pt-2">
                    <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-2 px-1">
                            <span>更写实</span>
                            <span>更扁平</span>
                        </div>
                        <Slider
                          value={[realism]}
                          onValueChange={([v]) => setRealism(v)}
                          max={100}
                          step={1}
                          className="mx-auto"
                          inverted
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-2 px-1">
                            <span>人物占比更大</span>
                            <span>背景占比更大</span>
                        </div>
                        <Slider
                          value={[composition]}
                          onValueChange={([v]) => setComposition(v)}
                          max={100}
                          step={1}
                          className="mx-auto"
                          inverted
                        />
                    </div>
                </div>
            </div>

             <div className="space-y-2">
                <Label className="text-base font-semibold">尺寸</Label>
                <div className="flex items-center gap-2">
                    <Input type="number" value={dimensions.w || ''} onChange={e => handleDimensionChange('w', e.target.value)} placeholder="W" />
                    <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input type="number" value={dimensions.h || ''} onChange={e => handleDimensionChange('h', e.target.value)} placeholder="H" />
                    <span className="text-sm text-muted-foreground">PX</span>
                </div>
            </div>

            <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-lg py-6">
                <Wand2 className="mr-2 h-5 w-5" />
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
