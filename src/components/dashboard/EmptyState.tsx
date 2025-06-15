
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, BookOpen, ArrowRight, FileText, ImageIcon } from "lucide-react";

interface EmptyStateProps {
  promptInput: string;
  setPromptInput: (value: string) => void;
  handleStartConversation: () => void;
  onOpenDialog: () => void;
}

const EmptyState = ({
  promptInput,
  setPromptInput,
  handleStartConversation,
  onOpenDialog,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">欢迎来到特教之光</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        您还没有创建任何教学资源。让我来帮您开始第一个教学任务吧！
      </p>

      <div className="w-full max-w-xl mx-auto mb-12">
        <div className="relative">
          <Textarea
            placeholder="可以直接向我提问，例如：帮我创建一个关于春天的语文教案..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            rows={3}
            className="pr-24 text-base"
          />
          <Button
            onClick={handleStartConversation}
            disabled={!promptInput.trim()}
            className="absolute bottom-2.5 right-2.5"
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            开始
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 max-w-4xl w-full">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
          <Card className="hover:shadow-md transition-shadow cursor-pointer w-56" onClick={onOpenDialog}>
            <CardHeader className="text-center p-4">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">创建教案</CardTitle>
              <CardDescription className="text-xs">为您的课程设计专业教案</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <ArrowRight className="w-8 h-8 text-muted-foreground mx-4 my-2 md:my-0 rotate-90 md:rotate-0" />
        
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
          <Card className="hover:shadow-md transition-shadow cursor-pointer w-56" onClick={onOpenDialog}>
            <CardHeader className="text-center p-4">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">PPT大纲</CardTitle>
              <CardDescription className="text-xs">生成课件演示大纲</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <ArrowRight className="w-8 h-8 text-muted-foreground mx-4 my-2 md:my-0 rotate-90 md:rotate-0" />
        
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-full bg-primary text-primary-foreground font-bold text-sm">3</div>
          <Card className="hover:shadow-md transition-shadow cursor-pointer w-56" onClick={onOpenDialog}>
            <CardHeader className="text-center p-4">
              <ImageIcon className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">生成插图</CardTitle>
              <CardDescription className="text-xs">为教学内容创建配图</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
