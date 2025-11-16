import { Bot, Sparkles, Database, Building2, Users, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function WelcomeMessage() {
  const features = [
    { icon: Database, text: "تحليل البيانات المالية", color: "text-blue-500" },
    { icon: Users, text: "معلومات المستفيدين", color: "text-green-500" },
    { icon: Building2, text: "إدارة العقارات", color: "text-orange-500" },
    { icon: BarChart3, text: "التقارير والإحصائيات", color: "text-purple-500" },
  ];

  return (
    <div className="flex justify-center items-center h-full p-6">
      <div className="text-center max-w-2xl space-y-6">
        {/* الشعار */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
            <Bot className="h-12 w-12 text-primary-foreground" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-yellow-500 animate-pulse" />
        </div>

        {/* العنوان */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">
            مرحباً بك في المساعد الذكي! 👋
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            أنا مساعدك الذكي لإدارة الوقف، مدعوم بتقنية الذكاء الاصطناعي المتقدمة.
            يمكنني مساعدتك في:
          </p>
        </div>

        {/* المميزات */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-muted", feature.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {feature.text}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* تعليمات الاستخدام */}
        <div className="bg-muted/50 border border-border/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">💡 كيف تستخدمني؟</p>
          <ul className="text-xs text-muted-foreground space-y-1 text-right">
            <li>• استخدم <strong>الردود السريعة</strong> للحصول على معلومات فورية</li>
            <li>• اكتب <strong>أسئلتك</strong> مباشرة للحصول على إجابات مخصصة</li>
            <li>• يمكنني تحليل <strong>البيانات الحقيقية</strong> من قاعدة البيانات</li>
          </ul>
        </div>

        {/* دعوة للعمل */}
        <p className="text-sm text-muted-foreground animate-pulse">
          ✨ ابدأ بالضغط على أحد الأزرار أدناه أو اكتب سؤالك
        </p>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
