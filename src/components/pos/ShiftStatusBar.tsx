import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowUpCircle, ArrowDownCircle, Lock, Briefcase, Receipt } from 'lucide-react';
import { CashierShift } from '@/hooks/pos/useCashierShift';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ShiftStatusBarProps {
  shift: CashierShift | null;
  onOpenShift: () => void;
  onCloseShift: () => void;
  isOpeningShift?: boolean;
}

export function ShiftStatusBar({ shift, onOpenShift, onCloseShift, isOpeningShift }: ShiftStatusBarProps) {
  if (!shift) {
    return (
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground">لا توجد جلسة عمل نشطة</p>
                <p className="text-sm text-muted-foreground">قم ببدء جلسة عمل جديدة للتحصيل والصرف</p>
              </div>
            </div>
            <Button onClick={onOpenShift} disabled={isOpeningShift}>
              <Briefcase className="h-4 w-4 ml-2" />
              {isOpeningShift ? 'جاري البدء...' : 'بدء جلسة عمل'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const netAmount = shift.total_collections - shift.total_payments;

  return (
    <Card className="bg-gradient-to-l from-primary/5 to-transparent border-primary/20">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* معلومات الجلسة */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-status-success">
                <Clock className="h-3 w-3 ml-1" />
                جلسة نشطة
              </Badge>
              <span className="text-sm font-medium">{shift.shift_number}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              منذ {formatDistanceToNow(new Date(shift.opened_at), { locale: ar })}
            </span>
          </div>

          {/* الإحصائيات */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-status-success" />
              <div className="text-sm">
                <span className="text-muted-foreground">التحصيل:</span>
                <span className="font-medium text-status-success mr-1">
                  {shift.total_collections.toLocaleString('ar-SA')} ر.س
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-status-error" />
              <div className="text-sm">
                <span className="text-muted-foreground">الصرف:</span>
                <span className="font-medium text-status-error mr-1">
                  {shift.total_payments.toLocaleString('ar-SA')} ر.س
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <span className="text-muted-foreground">العمليات:</span>
                <span className="font-medium mr-1">{shift.transactions_count}</span>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1 rounded-md ${netAmount >= 0 ? 'bg-status-success/10' : 'bg-status-error/10'}`}>
              <span className="text-sm text-muted-foreground">الصافي:</span>
              <span className={`font-bold ${netAmount >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                {netAmount >= 0 ? '+' : ''}{netAmount.toLocaleString('ar-SA')} ر.س
              </span>
            </div>
          </div>

          {/* زر الإنهاء */}
          <Button variant="outline" onClick={onCloseShift}>
            إنهاء الجلسة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
