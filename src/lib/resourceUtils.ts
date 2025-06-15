
import React from "react";
import { BookOpen, FileText, ImageIcon } from "lucide-react";

export const getResourceIcon = (type: string) => {
  switch (type) {
    case 'lesson_plan':
      return <BookOpen className="h-5 w-5" />;
    case 'ppt_outline':
      return <FileText className="h-5 w-5" />;
    case 'image_group':
      return <ImageIcon className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

export const getResourceTypeLabel = (type: string) => {
  switch (type) {
    case 'lesson_plan':
      return '教案';
    case 'ppt_outline':
      return 'PPT大纲';
    case 'image_group':
      return '图片';
    default:
      return '资源';
  }
};
