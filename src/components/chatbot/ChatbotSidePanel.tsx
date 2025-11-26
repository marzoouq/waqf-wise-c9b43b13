import { useState } from "react";
import { Bot, X, Maximize2, Minimize2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChatbotInterface } from "./ChatbotInterface";
import { cn } from "@/lib/utils";

interface ChatbotSidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatbotSidePanel({ open, onOpenChange }: ChatbotSidePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className={cn(
          "p-0 flex flex-col transition-all duration-300",
          isExpanded ? "w-full sm:w-full" : "w-[90vw] sm:w-[500px]"
        )}
      >
        {/* Header */}
        <SheetHeader className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-primary-foreground text-right">
                  مساعد الوقف الذكي
                </SheetTitle>
                <SheetDescription className="text-primary-foreground/80 text-right text-xs">
                  مدعوم بتقنية الذكاء الاصطناعي
                </SheetDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* زر التوسيع/التصغير */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              {/* زر الإغلاق */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* المحتوى - ChatbotInterface في وضع compact */}
        <div className="flex-1 overflow-hidden">
          <ChatbotInterface compact />
        </div>
      </SheetContent>
    </Sheet>
  );
}
