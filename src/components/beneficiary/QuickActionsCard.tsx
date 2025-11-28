import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Calendar,
  HelpCircle,
  BarChart3,
  Eye,
  Building,
  FileText,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionsCardProps {
  onEmergencyRequest?: () => void;
  onLoanRequest?: () => void;
  onDataUpdate?: () => void;
  onAddFamily?: () => void;
  onUploadDocument?: () => void;
  onMessages: () => void;
}

export function QuickActionsCard({
  onMessages,
}: QuickActionsCardProps) {
  const navigate = useNavigate();
  
  // إجراءات الاطلاع فقط للمستفيدين من الدرجة الأولى
  const actions = [
    {
      icon: Eye,
      label: "عرض الشفافية المالية",
      description: "الاطلاع على البيانات المالية للوقف",
      onClick: () => navigate("/beneficiary-portal?tab=waqf"),
      color: "text-primary",
      bg: "bg-primary/10 hover:bg-primary/20",
    },
    {
      icon: Building,
      label: "عرض العقارات",
      description: "الاطلاع على عقارات الوقف",
      onClick: () => navigate("/beneficiary-portal?tab=properties"),
      color: "text-success",
      bg: "bg-success-light hover:bg-success-light/80",
    },
    {
      icon: TrendingUp,
      label: "التوزيعات",
      description: "عرض توزيعات الغلة",
      onClick: () => navigate("/beneficiary-portal?tab=distributions"),
      color: "text-info",
      bg: "bg-info-light hover:bg-info-light/80",
    },
    {
      icon: FileText,
      label: "كشف الحساب",
      description: "عرض كشف حسابك الشخصي",
      onClick: () => navigate("/beneficiary-portal?tab=statements"),
      color: "text-warning",
      bg: "bg-warning-light hover:bg-warning-light/80",
    },
    {
      icon: MessageSquare,
      label: "الرسائل",
      description: "التواصل مع الإدارة",
      onClick: onMessages,
      color: "text-primary",
      bg: "bg-primary/10 hover:bg-primary/20",
    },
    {
      icon: BarChart3,
      label: "التقارير الشخصية",
      description: "عرض وتحميل التقارير",
      onClick: () => navigate("/beneficiary/reports"),
      color: "text-info",
      bg: "bg-info-light hover:bg-info-light/80",
    },
    {
      icon: HelpCircle,
      label: "الدعم الفني",
      description: "المساعدة والأسئلة الشائعة",
      onClick: () => navigate("/beneficiary-support"),
      color: "text-warning",
      bg: "bg-warning-light hover:bg-warning/20",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          الإجراءات السريعة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className={`h-auto flex-col items-start p-4 gap-2 ${action.bg} border-border/50 transition-all`}
                onClick={action.onClick}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className={`h-5 w-5 ${action.color}`} />
                  <span className="font-semibold text-sm">{action.label}</span>
                </div>
                <span className="text-xs text-muted-foreground text-right w-full">
                  {action.description}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
