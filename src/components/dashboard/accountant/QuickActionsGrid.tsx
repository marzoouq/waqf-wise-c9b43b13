/**
 * QuickActionsGrid Component
 * شبكة الإجراءات السريعة للمحاسب - يستخدم المكون الموحد
 */

import { UnifiedQuickActionsGrid } from "@/components/shared/UnifiedQuickActionsGrid";
import { ACCOUNTANT_QUICK_ACTIONS } from "./config";

export function QuickActionsGrid() {
  return (
    <UnifiedQuickActionsGrid 
      actions={ACCOUNTANT_QUICK_ACTIONS.map(a => ({
        ...a,
        description: a.label,
        color: "text-primary",
        bgColor: "bg-primary/10",
      }))} 
      variant="button"
      columns={4}
    />
  );
}
