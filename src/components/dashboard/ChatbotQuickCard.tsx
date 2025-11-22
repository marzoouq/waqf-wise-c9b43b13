import { Bot, Sparkles, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ChatbotQuickCard() {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background hover:shadow-lg transition-shadow duration-300 group" style={{ minHeight: '120px' }}>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
            <div className="relative flex-shrink-0">
              <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl shadow-lg">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary-foreground" />
              </div>
              <Sparkles className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-500" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
            </div>
            
            <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
              <h3 className="text-sm sm:text-base md:text-xl font-bold text-foreground">
                المساعد الذكي
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2">
                اسأل عن أي شيء متعلق بإدارة الوقف
              </p>
              <div className="flex items-center gap-1 sm:gap-2 pt-1 sm:pt-2">
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-medium">
                  • متصل
                </span>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-full font-medium">
                  AI
                </span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => navigate("/chatbot")}
            className="gap-1 sm:gap-2 group-hover:gap-3 transition-all w-full sm:w-auto text-xs sm:text-sm"
            size="sm"
          >
            ابدأ المحادثة
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
        
        {/* أمثلة على الأسئلة */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">جرّب أن تسأل:</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {[
              "كم عدد المستفيدين؟",
              "آخر التوزيعات؟",
              "العقارات المؤجرة؟"
            ].map((question, i) => (
              <button
                key={i}
                onClick={() => navigate("/chatbot")}
                className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
