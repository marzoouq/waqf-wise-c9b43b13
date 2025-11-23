import { useState } from "react";
import { Bot, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChatbotInterface } from "./ChatbotInterface";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // إخفاء الزر في صفحة الشات نفسها
  if (location.pathname === "/chatbot") {
    return null;
  }

  const handleOpenFullPage = () => {
    setIsOpen(false);
    navigate("/chatbot");
  };

  return (
    <>
      {/* الزر العائم المحسّن */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 left-6 h-16 w-16 rounded-full shadow-2xl z-50",
          "bg-gradient-to-br from-primary via-primary/90 to-primary/80",
          "hover:scale-110 hover:rotate-12 transition-all duration-300",
          "border-4 border-primary-foreground/30",
          "ring-4 ring-primary/20 ring-offset-2",
          "group animate-bounce hover:animate-none"
        )}
        size="icon"
      >
        <Bot className="h-7 w-7 group-hover:animate-pulse text-primary-foreground" />
        <span className="absolute -top-2 -right-2 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/60 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-success border-2 border-white dark:border-black shadow-lg"></span>
        </span>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
      </Button>

      {/* نافذة الشات */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            "transition-all duration-300 p-0 gap-0",
            isExpanded
              ? "max-w-7xl h-[95vh]"
              : "max-w-4xl h-[85vh]"
          )}
        >
          <VisuallyHidden>
            <DialogTitle>المساعد الذكي</DialogTitle>
            <DialogDescription>
              محادثة مع المساعد الذكي لإدارة الوقف
            </DialogDescription>
          </VisuallyHidden>
          
          {/* شريط الأدوات */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">المساعد الذكي</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenFullPage}
                className="h-8 w-8"
                title="فتح في صفحة كاملة"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8"
                title={isExpanded ? "تصغير" : "توسيع"}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* واجهة الشات */}
          <ChatbotInterface compact />
        </DialogContent>
      </Dialog>
    </>
  );
}
