import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  DollarSign, 
  MessageSquare, 
  Upload,
  UserPlus,
  FileCheck,
  Bell,
  Calendar,
  HelpCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickActionsCardProps {
  onEmergencyRequest: () => void;
  onLoanRequest: () => void;
  onDataUpdate: () => void;
  onAddFamily: () => void;
  onUploadDocument: () => void;
  onMessages: () => void;
}

export function QuickActionsCard({
  onEmergencyRequest,
  onLoanRequest,
  onDataUpdate,
  onAddFamily,
  onUploadDocument,
  onMessages,
}: QuickActionsCardProps) {
  const navigate = useNavigate();
  
  const actions = [
    {
      icon: DollarSign,
      label: "طلب فزعة طارئة",
      description: "تقديم طلب فزعة طارئة",
      onClick: onEmergencyRequest,
      color: "text-red-600",
      bg: "bg-red-50 hover:bg-red-100",
    },
    {
      icon: FileText,
      label: "طلب قرض",
      description: "تقديم طلب قرض جديد",
      onClick: onLoanRequest,
      color: "text-blue-600",
      bg: "bg-blue-50 hover:bg-blue-100",
    },
    {
      icon: FileCheck,
      label: "تحديث البيانات",
      description: "تعديل البيانات الشخصية",
      onClick: onDataUpdate,
      color: "text-green-600",
      bg: "bg-green-50 hover:bg-green-100",
    },
    {
      icon: UserPlus,
      label: "إضافة فرد",
      description: "إضافة فرد جديد للعائلة",
      onClick: onAddFamily,
      color: "text-secondary-foreground",
      bg: "bg-secondary hover:bg-secondary/80",
    },
    {
      icon: Upload,
      label: "رفع مستند",
      description: "رفع مستندات جديدة",
      onClick: onUploadDocument,
      color: "text-warning",
      bg: "bg-warning-light hover:bg-warning-light/80",
    },
    {
      icon: MessageSquare,
      label: "الرسائل",
      description: "التواصل مع الإدارة",
      onClick: onMessages,
      color: "text-indigo-600",
      bg: "bg-indigo-50 hover:bg-indigo-100",
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
