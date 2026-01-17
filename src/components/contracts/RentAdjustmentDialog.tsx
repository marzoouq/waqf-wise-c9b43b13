/**
 * حوار طلب تعديل قيمة الإيجار (رفع أو خفض)
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  TrendingUp,
  TrendingDown,
  Calculator,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { type Contract } from '@/hooks/property/useContracts';
import { formatCurrency } from '@/lib/utils';

const adjustmentSchema = z.object({
  requested_rent: z.string().min(1, 'المبلغ المطلوب مطلوب'),
  effective_date: z.string().min(1, 'تاريخ السريان مطلوب'),
  reason: z.string().min(10, 'السبب يجب أن يكون 10 أحرف على الأقل'),
});

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

interface RentAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  adjustmentType: 'increase' | 'decrease';
}

export function RentAdjustmentDialog({
  open,
  onOpenChange,
  contract,
  adjustmentType,
}: RentAdjustmentDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isIncrease = adjustmentType === 'increase';
  const currentRent = contract?.monthly_rent || 0;

  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      requested_rent: '',
      effective_date: new Date().toISOString().split('T')[0],
      reason: '',
    },
  });

  const requestedRent = parseFloat(form.watch('requested_rent')) || 0;
  const difference = requestedRent - currentRent;
  const percentage = currentRent > 0 ? ((difference / currentRent) * 100).toFixed(1) : '0';

  useEffect(() => {
    if (open && contract) {
      // اقتراح تعديل 10%
      const suggestedRent = isIncrease 
        ? Math.round(currentRent * 1.1) 
        : Math.round(currentRent * 0.9);
      form.setValue('requested_rent', suggestedRent.toString());
    }
  }, [open, contract, isIncrease, currentRent, form]);

  const onSubmit = async (data: AdjustmentFormValues) => {
    if (!contract) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('rent_adjustment_requests').insert({
        contract_id: contract.id,
        requested_by: 'المؤجر',
        adjustment_type: isIncrease ? 'زيادة' : 'تخفيض',
        current_rent: currentRent,
        requested_rent: parseFloat(data.requested_rent),
        adjustment_percentage: parseFloat(percentage),
        reason: data.reason,
        effective_date: data.effective_date,
        status: 'معلق',
      });

      if (error) throw error;

      toast.success(`تم تقديم طلب ${isIncrease ? 'رفع' : 'خفض'} الإيجار بنجاح`);
      queryClient.invalidateQueries({ queryKey: ['rent-adjustment-requests'] });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting adjustment request:', error);
      toast.error('حدث خطأ أثناء تقديم الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isIncrease ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-warning" />
            )}
            طلب {isIncrease ? 'رفع' : 'خفض'} قيمة الإيجار
          </DialogTitle>
          <DialogDescription>
            العقد: {contract.contract_number}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* معلومات الإيجار الحالي */}
            <Card className="bg-muted/50">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الإيجار الحالي</span>
                  <span className="font-bold text-lg">{formatCurrency(currentRent)}</span>
                </div>
              </CardContent>
            </Card>

            {/* المبلغ المطلوب */}
            <FormField
              control={form.control}
              name="requested_rent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الإيجار المطلوب</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="أدخل المبلغ"
                        className="ps-16"
                        {...field} 
                      />
                      <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ر.س
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* عرض الفرق والنسبة */}
            {requestedRent > 0 && (
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(currentRent)}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span className="font-bold">{formatCurrency(requestedRent)}</span>
                    </div>
                    <Badge variant={isIncrease ? 'default' : 'secondary'}>
                      {isIncrease ? '+' : ''}{percentage}%
                    </Badge>
                  </div>
                  <div className="text-center mt-2">
                    <span className={`text-lg font-bold ${difference > 0 ? 'text-success' : 'text-warning'}`}>
                      {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                    </span>
                    <span className="text-sm text-muted-foreground"> / شهرياً</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* تاريخ السريان */}
            <FormField
              control={form.control}
              name="effective_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    تاريخ سريان التعديل
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* السبب */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الطلب</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={isIncrease 
                        ? "مثال: ارتفاع أسعار السوق، تحسينات على العقار..." 
                        : "مثال: ظروف اقتصادية، الحفاظ على المستأجر..."
                      }
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={isIncrease ? 'bg-success hover:bg-success/90' : ''}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                    جاري التقديم...
                  </>
                ) : (
                  <>
                    {isIncrease ? (
                      <TrendingUp className="h-4 w-4 ms-2" />
                    ) : (
                      <TrendingDown className="h-4 w-4 ms-2" />
                    )}
                    تقديم الطلب
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
