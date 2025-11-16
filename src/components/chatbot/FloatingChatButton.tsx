import { useState } from "react";
import { Bot, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
      {/* الزر العائم */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-2xl z-50",
          "bg-gradient-to-br from-primary to-primary/80",
          "hover:scale-110 transition-all duration-300",
          "border-2 border-primary-foreground/20",
          "group"
        )}
        size="icon"
      >
        <Bot className="h-6 w-6 group-hover:animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
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
          <div className="h-[calc(100%-60px)]">
            <ChatbotInterface />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
