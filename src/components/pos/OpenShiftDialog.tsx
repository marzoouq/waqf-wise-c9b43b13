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
import { Wallet } from 'lucide-react';

interface OpenShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { openingBalance: number; notes?: string }) => void;
  isLoading?: boolean;
}

export function OpenShiftDialog({ open, onOpenChange, onConfirm, isLoading }: OpenShiftDialogProps) {
  const [openingBalance, setOpeningBalance] = useState('0');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      openingBalance: parseFloat(openingBalance) || 0,
      notes: notes || undefined,
    });
    setOpeningBalance('0');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            فتح وردية جديدة
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openingBalance">الرصيد الافتتاحي (ر.س)</Label>
            <Input
              id="openingBalance"
              type="number"
              min="0"
              step="0.01"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="0.00"
              className="text-lg font-medium"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              أدخل المبلغ النقدي الموجود في الصندوق عند بداية الوردية
            </p>
          </div>

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
              {isLoading ? 'جاري الفتح...' : 'فتح الوردية'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
