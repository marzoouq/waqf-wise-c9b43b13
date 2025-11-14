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
      <CardHeader>
        <CardTitle>الإجراءات السريعة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Button
              key={`action-${action.label}`}
              variant="outline"
              className="h-auto flex flex-col items-center gap-3 p-6 hover:shadow-md transition-all"
              onClick={() => navigate(action.path)}
            >
              <div className={`${action.bgColor} p-3 rounded-full`}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <div className="text-center">
                <p className="font-medium mb-1">{action.label}</p>
                <p className="text-xs text-muted-foreground">
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
