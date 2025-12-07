import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, ArrowDownCircle, ArrowUpCircle, Receipt } from 'lucide-react';
import { CashierShift } from '@/hooks/pos/useCashierShift';

interface CloseShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: CashierShift | null;
  onConfirm: (data: { shiftId: string; notes?: string }) => void;
  isLoading?: boolean;
}

export function CloseShiftDialog({ open, onOpenChange, shift, onConfirm, isLoading }: CloseShiftDialogProps) {
  const [notes, setNotes] = useState('');

  if (!shift) return null;

  const netAmount = shift.total_collections - shift.total_payments;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      shiftId: shift.id,
      notes: notes || undefined,
    });
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            إنهاء جلسة العمل - {shift.shift_number}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ملخص الجلسة */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-status-success">
                  <ArrowDownCircle className="h-4 w-4" />
                  <span className="text-sm">إجمالي التحصيل:</span>
                </div>
                <span className="font-medium text-status-success">
                  + {shift.total_collections.toLocaleString('ar-SA')} ر.س
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-status-error">
                  <ArrowUpCircle className="h-4 w-4" />
                  <span className="text-sm">إجمالي الصرف:</span>
                </div>
                <span className="font-medium text-status-error">
                  - {shift.total_payments.toLocaleString('ar-SA')} ر.س
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  <span className="text-sm">عدد العمليات:</span>
                </div>
                <span className="font-medium">{shift.transactions_count} عملية</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-medium">صافي الحركة:</span>
                <span className={`font-bold text-lg ${netAmount >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                  {netAmount >= 0 ? '+' : ''}{netAmount.toLocaleString('ar-SA')} ر.س
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ملاحظات */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'جاري الإنهاء...' : 'إنهاء الجلسة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
