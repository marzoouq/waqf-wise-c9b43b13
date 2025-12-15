import { Bot, Sparkles, MessageSquare, BarChart3, TrendingUp, Zap, Shield, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function WelcomeMessage() {
  const features = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "تحليل البيانات",
      description: "احصل على تحليلات فورية للبيانات المالية والإحصائية",
      color: "from-info to-info/80"
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "إجابات ذكية",
      description: "اسأل عن المستفيدين، العقارات، والطلبات",
      color: "from-primary to-primary/70"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "توصيات عملية",
      description: "احصل على توصيات مدروسة بناءً على البيانات",
      color: "from-success to-success/80"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "استجابة فورية",
      description: "ردود سريعة ودقيقة في ثوانٍ معدودة",
      color: "from-warning to-warning/80"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "آمن ومحمي",
      description: "بياناتك محمية بأعلى معايير الأمان",
      color: "from-destructive to-destructive/80"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "متاح دائماً",
      description: "خدمة على مدار الساعة لمساعدتك",
      color: "from-info to-primary"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/50 to-primary blur-3xl rounded-full animate-pulse" />
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 rounded-full shadow-2xl ring-4 ring-primary/20 animate-in zoom-in duration-500">
          <Bot className="h-20 w-20 text-primary-foreground animate-bounce" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles className="h-6 w-6 text-warning animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -left-2">
          <Sparkles className="h-5 w-5 text-info animate-pulse" />
        </div>
      </div>
      
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-center gap-2 animate-in slide-in-from-top duration-500">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            مرحباً بك في المساعد الذكي
          </h1>
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground text-lg animate-in slide-in-from-bottom duration-500 delay-150">
          أنا هنا لمساعدتك في إدارة الوقف بذكاء وفعالية 🚀
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {features.map((feature, index) => (
          <Card
            key={feature.title}
            className={cn(
              "p-6 border-2 border-primary/20 bg-gradient-to-br from-background to-muted/50",
              "hover:border-primary/40 hover:shadow-2xl transition-all duration-300",
              "hover:scale-105 hover:-translate-y-1 cursor-pointer group",
              "animate-in fade-in slide-in-from-bottom duration-500"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={cn(
                "p-4 rounded-2xl bg-gradient-to-br",
                feature.color,
                "text-primary-foreground shadow-lg group-hover:scale-110 transition-transform duration-300"
              )}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-gradient-to-br from-muted/80 to-muted/50 rounded-2xl p-8 max-w-2xl border-2 border-border/50 shadow-lg animate-in slide-in-from-bottom duration-500 delay-300">
        <p className="text-base text-muted-foreground mb-4 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <strong className="text-foreground text-lg">نصائح للاستخدام الأمثل</strong>
        </p>
        <ul className="text-sm text-muted-foreground space-y-3 text-right">
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <span>استخدم الأزرار السريعة أسفل للبدء الفوري</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <span>اسأل أسئلة واضحة ومحددة للحصول على إجابات دقيقة</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <span>يمكنك طلب تقارير وإحصائيات تفصيلية في أي وقت</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">•</span>
            <span>المساعد الذكي يتعلم من تفاعلاتك لتحسين الخدمة</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
