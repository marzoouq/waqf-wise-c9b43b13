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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Banknote, CreditCard, Building2, FileText, ArrowUpCircle } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '@/hooks/pos/useQuickPayment';

interface QuickPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    amount: number;
    paymentMethod: 'نقدي' | 'شبكة' | 'تحويل' | 'شيك';
    expenseCategory: string;
    payeeName: string;
    description: string;
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

export function QuickPaymentDialog({ open, onOpenChange, onConfirm, isLoading }: QuickPaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'نقدي' | 'شبكة' | 'تحويل' | 'شيك'>('نقدي');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [description, setDescription] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      amount: parseFloat(amount),
      paymentMethod,
      expenseCategory,
      payeeName,
      description,
      referenceNumber: referenceNumber || undefined,
    });
    // Reset
    setAmount('');
    setPaymentMethod('نقدي');
    setExpenseCategory('');
    setPayeeName('');
    setDescription('');
    setReferenceNumber('');
  };

  const needsReference = paymentMethod !== 'نقدي';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-status-error" />
            صرف مبلغ
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* المبلغ */}
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ (ر.س) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg font-medium"
              required
              autoFocus
            />
          </div>

          {/* تصنيف المصروف */}
          <div className="space-y-2">
            <Label htmlFor="category">تصنيف المصروف *</Label>
            <Select value={expenseCategory} onValueChange={setExpenseCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر التصنيف..." />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* المستفيد */}
          <div className="space-y-2">
            <Label htmlFor="payeeName">اسم المستفيد *</Label>
            <Input
              id="payeeName"
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              placeholder="أدخل اسم المستفيد..."
              required
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
                    id={`pay-${method.value}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`pay-${method.value}`}
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
              <Label htmlFor="referenceNumber">رقم المرجع *</Label>
              <Input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="أدخل رقم المرجع..."
                required
              />
            </div>
          )}

          {/* الوصف */}
          <div className="space-y-2">
            <Label htmlFor="description">الوصف *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف المصروف..."
              rows={2}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={isLoading || !amount || !expenseCategory || !payeeName || !description || (needsReference && !referenceNumber)}
            >
              {isLoading ? 'جاري الصرف...' : 'تأكيد الصرف'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
