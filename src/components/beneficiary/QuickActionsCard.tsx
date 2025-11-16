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
  Calendar
} from "lucide-react";

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
      color: "text-purple-600",
      bg: "bg-purple-50 hover:bg-purple-100",
    },
    {
      icon: Upload,
      label: "رفع مستند",
      description: "رفع مستندات جديدة",
      onClick: onUploadDocument,
      color: "text-amber-600",
      bg: "bg-amber-50 hover:bg-amber-100",
    },
    {
      icon: MessageSquare,
      label: "الرسائل",
      description: "التواصل مع الإدارة",
      onClick: onMessages,
      color: "text-indigo-600",
      bg: "bg-indigo-50 hover:bg-indigo-100",
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
