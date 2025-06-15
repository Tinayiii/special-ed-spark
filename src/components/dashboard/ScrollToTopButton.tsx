
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface ScrollToTopButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const ScrollToTopButton = ({ isVisible, onClick }: ScrollToTopButtonProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 rounded-full h-12 w-12 shadow-lg"
      variant="default"
      size="icon"
    >
      <ArrowUp className="h-6 w-6" />
      <span className="sr-only">回到顶部</span>
    </Button>
  );
};

export default ScrollToTopButton;
