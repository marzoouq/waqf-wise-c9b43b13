import { Card, CardContent } from "@/components/ui/card";
import { Receipt, TrendingUp } from "lucide-react";

export function EmptyPaymentsState() {
  return (
    <Card className="bg-muted/30 border-dashed border-2">
      <CardContent className="py-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Receipt className="h-12 w-12 text-primary/70" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">
          لا توجد مدفوعات حتى الآن
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          عند صرف المستحقات، ستظهر جميع التفاصيل المالية هنا بشفافية كاملة
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-primary/70">
          <TrendingUp className="h-4 w-4" />
          <span>سيتم تحديث البيانات تلقائياً</span>
        </div>
      </CardContent>
    </Card>
  );
}
