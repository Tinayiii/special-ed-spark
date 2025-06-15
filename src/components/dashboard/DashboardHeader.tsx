
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Sparkles, MessageSquare } from "lucide-react";

interface DashboardHeaderProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  promptInput: string;
  setPromptInput: (value: string) => void;
  handleStartConversation: () => void;
}

const DashboardHeader = ({
  isDialogOpen,
  setIsDialogOpen,
  promptInput,
  setPromptInput,
  handleStartConversation,
}: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-26 font-medium mb-2">课程看板</h1>
        <p className="text-muted-foreground">管理您的教学资源和开始新的任务</p>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            开始新任务
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              开始新的教学任务
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                请描述您想要创建的教学内容：
              </label>
              <Textarea
                placeholder="例如：帮我创建一个关于春天的语文教案，适合二年级学生..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleStartConversation} disabled={!promptInput.trim()}>
                <MessageSquare className="mr-2 h-4 w-4" />
                开始对话
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardHeader;
