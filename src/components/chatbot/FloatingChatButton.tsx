import { useState, memo } from "react";
import { Bot, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChatbotInterface } from "./ChatbotInterface";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/ui/use-mobile";

export const FloatingChatButton = memo(function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // إخفاء الزر في صفحات معينة
  const hiddenPaths = [
    "/chatbot",
    "/support-management",
    "/admin",
    "/developer-tools",
    "/system-monitoring"
  ];
  
  if (hiddenPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  const handleOpenFullPage = () => {
    setIsOpen(false);
    navigate("/chatbot");
  };

  return (
    <>
      {/* الزر العائم - بدون حركات ثقيلة على الجوال */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed z-50 rounded-full shadow-xl",
          "bg-gradient-to-br from-primary to-primary/80",
          "border-2 border-primary-foreground/20",
          // موقع مختلف للجوال لتجنب التداخل مع شريط التنقل
          isMobile 
            ? "bottom-20 left-4 h-12 w-12" 
            : "bottom-6 left-6 h-14 w-14 hover:scale-105 transition-transform",
        )}
        size="icon"
        aria-label="فتح المساعد الذكي"
        title="المساعد الذكي"
      >
        <Bot className={cn(
          "text-primary-foreground",
          isMobile ? "h-5 w-5" : "h-6 w-6"
        )} />
        {/* مؤشر أخضر صغير بدون حركة */}
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-background" />
      </Button>

      {/* نافذة الشات */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            "p-0 gap-0",
            isMobile 
              ? "max-w-full h-[90vh] mx-2" 
              : isExpanded
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
              
              {!isMobile && (
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
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
                aria-label="إغلاق المحادثة"
                title="إغلاق"
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
});
