
import React from "react";
import { BookOpen, FileText, ImageIcon } from "lucide-react";

export const getResourceIcon = (type: string): React.ReactElement => {
  switch (type) {
    case 'lesson_plan':
      return React.createElement(BookOpen, { className: "h-5 w-5" });
    case 'ppt_outline':
      return React.createElement(FileText, { className: "h-5 w-5" });
    case 'image_group':
      return React.createElement(ImageIcon, { className: "h-5 w-5" });
    default:
      return React.createElement(FileText, { className: "h-5 w-5" });
  }
};

export const getResourceTypeLabel = (type: string): string => {
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
