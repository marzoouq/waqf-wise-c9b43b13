import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  FileText,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  PieChart,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActionsGrid() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: CheckCircle,
      label: "اعتماد الموافقات",
      description: "مراجعة واعتماد الموافقات المعلقة",
      color: "text-primary",
      bgColor: "bg-primary/10",
      path: "/approvals"
    },
    {
      icon: TrendingUp,
      label: "محاكاة التوزيع",
      description: "معاينة توزيع الغلة قبل الاعتماد",
      color: "text-primary",
      bgColor: "bg-primary/10",
      path: "/funds"
    },
    {
      icon: FileText,
      label: "التقارير التنفيذية",
      description: "عرض التقارير والإحصائيات",
      color: "text-primary",
      bgColor: "bg-primary/10",
      path: "/reports"
    },
    {
      icon: Users,
      label: "إدارة المستفيدين",
      description: "عرض وإدارة المستفيدين",
      color: "text-primary",
      bgColor: "bg-primary/10",
      path: "/beneficiaries"
    },
    {
      icon: Building2,
      label: "إدارة العقارات",
      description: "متابعة العقارات والعقود",
      color: "text-primary",
      bgColor: "bg-primary/10",
      path: "/properties"
    },
    {
      icon: DollarSign,
      label: "القروض والفزعات",
      description: "متابعة القروض والسلف",
      color: "text-primary",
      bgColor: "bg-primary/10",
      path: "/loans"
    },
    {
      icon: PieChart,
      label: "المحاسبة",
      description: "القيود المالية والتقارير",
      color: "text-primary",
      bgColor: "bg-primary/10",
      path: "/accounting"
    },
    {
      icon: Settings,
      label: "الإعدادات",
      description: "إعدادات النظام والمستخدمين",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      path: "/settings"
    }
  ];

  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-base sm:text-lg">الإجراءات السريعة</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {actions.map((action) => (
            <Button
              key={`action-${action.label}`}
              variant="outline"
              className="h-auto flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 hover:shadow-md transition-all"
              onClick={() => navigate(action.path)}
            >
              <div className={`${action.bgColor} p-2 sm:p-3 rounded-full shrink-0`}>
                <action.icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${action.color}`} />
              </div>
              <div className="text-center w-full">
                <p className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">{action.label}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                  {action.description}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
