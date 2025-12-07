import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { CashierShift } from '@/hooks/pos/useCashierShift';

interface CloseShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: CashierShift | null;
  onConfirm: (data: { shiftId: string; closingBalance: number; notes?: string }) => void;
  isLoading?: boolean;
}

export function CloseShiftDialog({ open, onOpenChange, shift, onConfirm, isLoading }: CloseShiftDialogProps) {
  const [closingBalance, setClosingBalance] = useState('');
  const [notes, setNotes] = useState('');

  if (!shift) return null;

  const expectedBalance = shift.opening_balance + shift.total_collections - shift.total_payments;
  const actualBalance = parseFloat(closingBalance) || 0;
  const variance = actualBalance - expectedBalance;
  const hasVariance = Math.abs(variance) > 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      shiftId: shift.id,
      closingBalance: actualBalance,
      notes: notes || undefined,
    });
    setClosingBalance('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            إغلاق الوردية - {shift.shift_number}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ملخص الوردية */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الرصيد الافتتاحي:</span>
                <span className="font-medium">{shift.opening_balance.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي التحصيل:</span>
                <span className="font-medium text-status-success">+ {shift.total_collections.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي الصرف:</span>
                <span className="font-medium text-status-error">- {shift.total_payments.toLocaleString('ar-SA')} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">عدد العمليات:</span>
                <span className="font-medium">{shift.transactions_count}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-medium">الرصيد المتوقع:</span>
                <span className="font-bold text-primary text-lg">{expectedBalance.toLocaleString('ar-SA')} ر.س</span>
              </div>
            </CardContent>
          </Card>

          {/* إدخال الرصيد الفعلي */}
          <div className="space-y-2">
            <Label htmlFor="closingBalance">الرصيد الفعلي في الصندوق (ر.س)</Label>
            <Input
              id="closingBalance"
              type="number"
              min="0"
              step="0.01"
              value={closingBalance}
              onChange={(e) => setClosingBalance(e.target.value)}
              placeholder="أدخل المبلغ الفعلي..."
              className="text-lg font-medium"
              autoFocus
            />
          </div>

          {/* عرض الفرق */}
          {closingBalance && (
            <div className={`p-3 rounded-lg ${hasVariance ? 'bg-status-warning/10 border border-status-warning/30' : 'bg-status-success/10 border border-status-success/30'}`}>
              <div className="flex items-center gap-2">
                {hasVariance ? (
                  <AlertTriangle className="h-5 w-5 text-status-warning" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-status-success" />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">الفرق:</span>
                    <Badge variant={hasVariance ? 'destructive' : 'default'} className={!hasVariance ? 'bg-status-success' : ''}>
                      {variance > 0 ? '+' : ''}{variance.toLocaleString('ar-SA')} ر.س
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hasVariance
                      ? variance > 0
                        ? 'يوجد فائض في الصندوق'
                        : 'يوجد عجز في الصندوق'
                      : 'الصندوق مطابق للنظام'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ملاحظات */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات {hasVariance && '(مطلوب توضيح سبب الفرق)'}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={hasVariance ? 'يرجى توضيح سبب الفرق...' : 'أي ملاحظات إضافية...'}
              rows={2}
              required={hasVariance}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !closingBalance || (hasVariance && !notes)}
              variant={hasVariance ? 'destructive' : 'default'}
            >
              {isLoading ? 'جاري الإغلاق...' : 'إغلاق الوردية'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
