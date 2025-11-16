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
      <CardHeader className="pb-2 sm:pb-3 md:pb-4">
        <CardTitle className="text-sm sm:text-base md:text-lg">إجراءات سريعة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-2 sm:p-3 md:p-4 flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 hover:scale-105 transition-transform"
                onClick={action.onClick}
              >
                <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg ${action.bgColor}`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${action.color}`} />
                </div>
                <div className="text-center">
                  <div className="font-medium text-[10px] sm:text-xs md:text-sm line-clamp-1">{action.label}</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1">
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
