import { Bot, Sparkles, MessageSquare, BarChart3, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface WelcomeMessageProps {
  compact?: boolean;
}

export function WelcomeMessage({ compact = false }: WelcomeMessageProps) {
  const features = [
    {
      icon: <BarChart3 className="h-4 w-4" />,
      title: "تحليل البيانات",
      description: "إحصائيات فورية",
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      title: "إجابات ذكية",
      description: "استفسارات متنوعة",
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: "توصيات",
      description: "اقتراحات مدروسة",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      title: "سرعة",
      description: "ردود فورية",
    },
  ];

  // الوضع المصغر للنافذة العائمة
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="relative">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-full shadow-lg">
            <Bot className="h-10 w-10 text-primary-foreground" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-warning animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground flex items-center justify-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            المساعد الذكي
          </h2>
          <p className="text-sm text-muted-foreground">
            كيف يمكنني مساعدتك اليوم؟ 🚀
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-2.5 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <span className="text-xs font-medium text-foreground">{feature.title}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          استخدم الاختصارات أدناه أو اكتب سؤالك
        </p>
      </div>
    );
  }

  // الوضع الكامل للصفحة المستقلة
  const fullFeatures = [
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
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/50 to-primary blur-2xl rounded-full opacity-50" />
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 rounded-full shadow-xl ring-4 ring-primary/20">
          <Bot className="h-16 w-16 text-primary-foreground" />
        </div>
        <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-warning animate-pulse" />
      </div>
      
      <div className="space-y-3 max-w-xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          مرحباً بك في المساعد الذكي
        </h1>
        <p className="text-muted-foreground text-base">
          أنا هنا لمساعدتك في إدارة الوقف بذكاء وفعالية 🚀
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
        {fullFeatures.map((feature) => (
          <div
            key={feature.title}
            className={cn(
              "p-4 border border-border/50 bg-card rounded-xl",
              "hover:border-primary/30 hover:shadow-md transition-all duration-200"
            )}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={cn(
                "p-3 rounded-xl bg-gradient-to-br",
                feature.color,
                "text-primary-foreground shadow-md"
              )}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-sm text-foreground">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/50 rounded-xl p-4 max-w-md border border-border/50">
        <p className="text-xs text-muted-foreground">
          💡 استخدم الاختصارات أدناه للبدء السريع أو اكتب سؤالك مباشرة
        </p>
      </div>
    </div>
  );
}
