import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Play, Clock, CircleDollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCashierShift } from "@/hooks/pos";

/**
 * بطاقة اختصار نقطة البيع للوحات التحكم
 */
export function POSQuickAccessCard() {
  const navigate = useNavigate();
  const { currentShift, isLoadingShift } = useCashierShift();

  const hasActiveShift = currentShift?.status === 'مفتوحة';

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Store className="h-5 w-5 text-primary" />
          نقطة البيع
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingShift ? (
          <div className="h-20 animate-pulse bg-muted rounded" />
        ) : hasActiveShift ? (
          <>
            <div className="flex items-center gap-2 text-sm text-success">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              وردية مفتوحة
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <CircleDollarSign className="h-4 w-4 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">التحصيل</p>
                  <p className="font-semibold">{currentShift.total_collections?.toLocaleString('ar-SA')} ر.س</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <CircleDollarSign className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">الصرف</p>
                  <p className="font-semibold">{currentShift.total_payments?.toLocaleString('ar-SA')} ر.س</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            لا توجد وردية مفتوحة
          </div>
        )}

        <Button 
          className="w-full gap-2" 
          onClick={() => navigate('/pos')}
        >
          {hasActiveShift ? (
            <>
              <Store className="h-4 w-4" />
              الذهاب لنقطة البيع
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              فتح نقطة البيع
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
