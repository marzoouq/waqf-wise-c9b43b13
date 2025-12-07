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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Banknote, CreditCard, Building2, FileText } from 'lucide-react';
import { PendingRental } from '@/hooks/pos/usePendingRentals';

interface QuickCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rental: PendingRental | null;
  onConfirm: (data: {
    amount: number;
    paymentMethod: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك';
    referenceNumber?: string;
  }) => void;
  isLoading?: boolean;
}

const PAYMENT_METHODS = [
  { value: 'نقدي', label: 'نقدي', icon: Banknote },
  { value: 'شبكة', label: 'شبكة', icon: CreditCard },
  { value: 'تحويل', label: 'تحويل بنكي', icon: Building2 },
  { value: 'شيك', label: 'شيك', icon: FileText },
];

export function QuickCollectionDialog({ open, onOpenChange, rental, onConfirm, isLoading }: QuickCollectionDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'نقدي' | 'شبكة' | 'تحويل' | 'شيك'>('نقدي');
  const [referenceNumber, setReferenceNumber] = useState('');

  if (!rental) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      amount: parseFloat(amount) || rental.amount_due,
      paymentMethod,
      referenceNumber: referenceNumber || undefined,
    });
    // Reset
    setAmount('');
    setPaymentMethod('نقدي');
    setReferenceNumber('');
  };

  const needsReference = paymentMethod !== 'نقدي';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تحصيل إيجار</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* معلومات الدفعة */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">العقار:</span>
                <span className="font-medium">{rental.property_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المستأجر:</span>
                <span className="font-medium">{rental.tenant_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">رقم العقد:</span>
                <span className="font-medium">{rental.contract_number}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">المبلغ المستحق:</span>
                <span className="font-bold text-primary">{rental.amount_due.toLocaleString('ar-SA')} ر.س</span>
              </div>
            </CardContent>
          </Card>

          {/* المبلغ */}
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ المحصل (ر.س)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={rental.amount_due.toString()}
              className="text-lg font-medium"
            />
          </div>

          {/* طريقة الدفع */}
          <div className="space-y-2">
            <Label>طريقة الدفع</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
              className="grid grid-cols-2 gap-2"
            >
              {PAYMENT_METHODS.map((method) => (
                <div key={method.value}>
                  <RadioGroupItem
                    value={method.value}
                    id={method.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={method.value}
                    className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
                  >
                    <method.icon className="h-4 w-4" />
                    {method.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* رقم المرجع */}
          {needsReference && (
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">
                {paymentMethod === 'شبكة' ? 'رقم العملية' : paymentMethod === 'تحويل' ? 'رقم الحوالة' : 'رقم الشيك'}
              </Label>
              <Input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="أدخل رقم المرجع..."
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || (needsReference && !referenceNumber)}
            >
              {isLoading ? 'جاري التحصيل...' : 'تأكيد التحصيل'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
