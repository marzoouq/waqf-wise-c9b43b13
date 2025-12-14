/**
 * Quick Actions Grid - شبكة الإجراءات السريعة
 * بطاقات تفاعلية للوصول السريع للمعلومات والخدمات - يستخدم المكون الموحد
 * @version 2.8.91
 */

import { FileText, Receipt, Send, HelpCircle } from "lucide-react";
import { UnifiedQuickActionsGrid } from "@/components/shared/UnifiedQuickActionsGrid";

const BENEFICIARY_QUICK_ACTIONS = [
  {
    icon: FileText,
    label: "الإفصاح السنوي",
    description: "عرض الإفصاح المالي للسنة الحالية",
    color: "text-[hsl(var(--chart-1))]",
    bgColor: "bg-[hsl(var(--chart-1)/0.1)]",
    path: "/beneficiary-portal?tab=disclosures",
  },
  {
    icon: Receipt,
    label: "كشف الحساب",
    description: "عرض كشف الحساب التفصيلي",
    color: "text-[hsl(var(--status-success))]",
    bgColor: "bg-[hsl(var(--status-success)/0.1)]",
    path: "/beneficiary-portal?tab=statements",
  },
  {
    icon: Send,
    label: "تقديم طلب",
    description: "إرسال طلب للإدارة",
    color: "text-[hsl(var(--status-warning))]",
    bgColor: "bg-[hsl(var(--status-warning)/0.1)]",
    path: "/beneficiary/requests",
  },
  {
    icon: HelpCircle,
    label: "الدعم الفني",
    description: "التواصل مع فريق الدعم",
    color: "text-[hsl(var(--chart-5))]",
    bgColor: "bg-[hsl(var(--chart-5)/0.1)]",
    path: "/beneficiary-support",
  },
];

export function QuickActionsGrid() {
  return (
    <div className="space-y-4">
      {/* عنوان القسم */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-1 bg-primary rounded-full" />
        <h2 className="text-xl font-bold">إجراءات سريعة</h2>
      </div>

      <UnifiedQuickActionsGrid 
        actions={BENEFICIARY_QUICK_ACTIONS} 
        variant="card"
        columns={4}
      />
    </div>
  );
}
