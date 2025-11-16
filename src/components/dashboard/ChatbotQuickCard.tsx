import { Bot, Sparkles, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ChatbotQuickCard() {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Bot className="h-8 w-8 text-primary-foreground" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-500 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">
                المساعد الذكي
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                اسأل عن أي شيء متعلق بإدارة الوقف - البيانات المالية، المستفيدين، العقارات، والمزيد
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-medium">
                  • متصل
                </span>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                  مدعوم بالذكاء الاصطناعي
                </span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => navigate("/chatbot")}
            className="gap-2 group-hover:gap-3 transition-all"
            size="lg"
          >
            ابدأ المحادثة
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        
        {/* أمثلة على الأسئلة */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">جرّب أن تسأل:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "كم عدد المستفيدين النشطين؟",
              "ما هي آخر التوزيعات المالية؟",
              "كم عقار مؤجر حالياً؟"
            ].map((question, i) => (
              <button
                key={i}
                onClick={() => navigate("/chatbot")}
                className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground transition-colors"
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
