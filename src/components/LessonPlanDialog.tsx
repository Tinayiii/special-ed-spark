
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LessonPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planContent: string;
}

const LessonPlanDialog: React.FC<LessonPlanDialogProps> = ({ open, onOpenChange, planContent }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>教案详情</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4">
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg font-sans text-sm">
                {planContent}
            </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LessonPlanDialog;
