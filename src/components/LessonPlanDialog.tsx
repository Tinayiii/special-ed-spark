
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";

interface LessonPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planContent: string;
}

const LessonPlanDialog: React.FC<LessonPlanDialogProps> = ({ open, onOpenChange, planContent }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(planContent);
      toast.success("教案内容已复制到剪贴板");
    } catch (error) {
      toast.error("复制失败，请手动选择复制");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([planContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '教案设计.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("教案已下载");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>专业教案设计</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                复制
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                下载
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] mt-4">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap bg-muted p-6 rounded-lg font-sans text-sm leading-relaxed">
              {planContent}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LessonPlanDialog;
