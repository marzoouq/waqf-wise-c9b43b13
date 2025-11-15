import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UsersRound, FileText, Building2, Wallet, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  onOpenBeneficiaryDialog?: () => void;
  onOpenPropertyDialog?: () => void;
  onOpenDistributionDialog?: () => void;
}

export const QuickActions = ({
  onOpenBeneficiaryDialog,
  onOpenPropertyDialog,
  onOpenDistributionDialog,
}: QuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Users,
      label: "إضافة مستفيد",
      description: "تسجيل مستفيد جديد",
      color: "text-primary",
      bgColor: "bg-primary/10",
      onClick: onOpenBeneficiaryDialog,
    },
    {
      icon: UsersRound,
      label: "إدارة العائلات",
      description: "عرض وإدارة العائلات",
      color: "text-info",
      bgColor: "bg-info/10",
      onClick: () => navigate("/families"),
    },
    {
      icon: FileText,
      label: "الطلبات",
      description: "مراجعة الطلبات",
      color: "text-warning",
      bgColor: "bg-warning/10",
      onClick: () => navigate("/requests"),
    },
    {
      icon: Building2,
      label: "إضافة عقار",
      description: "تسجيل عقار جديد",
      color: "text-success",
      bgColor: "bg-success/10",
      onClick: onOpenPropertyDialog,
    },
    {
      icon: Wallet,
      label: "توزيع الغلة",
      description: "إنشاء توزيع جديد",
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
      onClick: onOpenDistributionDialog,
    },
    {
      icon: BarChart3,
      label: "التقارير",
      description: "عرض التقارير المالية",
      color: "text-indigo-600",
      bgColor: "bg-indigo-600/10",
      onClick: () => navigate("/reports"),
    },
  ];

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>إجراءات سريعة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={action.onClick}
              >
                <div className={`p-3 rounded-lg ${action.bgColor}`}>
                  <Icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
