/**
 * Quick Actions Grid - شبكة الإجراءات السريعة
 * بطاقات تفاعلية للوصول السريع للمعلومات والخدمات
 * @version 2.8.72
 */

import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Receipt, 
  Send, 
  HelpCircle,
  ArrowLeft 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActionsGrid() {
  const navigate = useNavigate();

  const actions = [
    {
      id: "disclosure",
      title: "الإفصاح السنوي",
      description: "عرض الإفصاح المالي للسنة الحالية",
      icon: FileText,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      action: () => navigate("/beneficiary-dashboard?tab=disclosures"),
    },
    {
      id: "statement",
      title: "كشف الحساب",
      description: "عرض كشف الحساب التفصيلي",
      icon: Receipt,
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
      action: () => navigate("/beneficiary-dashboard?tab=statements"),
    },
    {
      id: "request",
      title: "تقديم طلب",
      description: "إرسال طلب للإدارة",
      icon: Send,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      action: () => navigate("/beneficiary/requests"),
    },
    {
      id: "support",
      title: "الدعم الفني",
      description: "التواصل مع فريق الدعم",
      icon: HelpCircle,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      action: () => navigate("/support"),
    },
  ];

  return (
    <div className="space-y-4">
      {/* عنوان القسم */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-1 bg-primary rounded-full" />
        <h2 className="text-xl font-bold">إجراءات سريعة</h2>
      </div>

      {/* Grid الإجراءات */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card 
              key={action.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              onClick={action.action}
            >
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                  {/* الأيقونة */}
                  <div className={`p-2 sm:p-3 rounded-full ${action.color} transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  
                  {/* العنوان */}
                  <h3 className="font-bold text-sm sm:text-base">{action.title}</h3>
                  
                  {/* الوصف - مخفي على الموبايل */}
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {action.description}
                  </p>
                  
                  {/* سهم الانتقال */}
                  <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
