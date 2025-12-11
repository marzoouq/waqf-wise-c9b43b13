/**
 * QuickActionsGrid Component
 * شبكة الإجراءات السريعة للناظر - يستخدم المكون الموحد
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedQuickActionsGrid } from "@/components/shared/UnifiedQuickActionsGrid";
import { NAZER_QUICK_ACTIONS } from "./config";

export default function QuickActionsGrid() {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-base sm:text-lg">الإجراءات السريعة</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <UnifiedQuickActionsGrid 
          actions={NAZER_QUICK_ACTIONS} 
          variant="card"
          columns={4}
        />
      </CardContent>
    </Card>
  );
}
