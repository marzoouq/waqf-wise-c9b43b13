/**
 * حوار فسخ العقد من طرف واحد
 */

import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  AlertTriangle,
  Calendar,
  FileWarning,
  Scale
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { type Contract } from '@/hooks/property/useContracts';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const terminationSchema = z.object({
  requested_by: z.enum(['المؤجر', 'المستأجر']),
  termination_type: z.enum(['فسخ بالتراضي', 'فسخ من طرف واحد']),
  requested_date: z.string().min(1, 'تاريخ الفسخ مطلوب'),
  reason: z.string().min(10, 'السبب يجب أن يكون 10 أحرف على الأقل'),
  legal_basis: z.string().optional(),
});

type TerminationFormValues = z.infer<typeof terminationSchema>;

interface UnilateralTerminationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
}

export function UnilateralTerminationDialog({
  open,
  onOpenChange,
  contract,
}: UnilateralTerminationDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TerminationFormValues>({
    resolver: zodResolver(terminationSchema),
    defaultValues: {
      requested_by: 'المؤجر',
      termination_type: 'فسخ من طرف واحد',
      requested_date: new Date().toISOString().split('T')[0],
      reason: '',
      legal_basis: '',
    },
  });

  const onSubmit = async (data: TerminationFormValues) => {
    if (!contract) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contract_termination_requests').insert({
        contract_id: contract.id,
        requested_by: data.requested_by,
        termination_type: data.termination_type,
        requested_date: data.requested_date,
        reason: data.reason,
        legal_basis: data.legal_basis || null,
        status: 'معلق',
      });

      if (error) throw error;

      toast.success('تم تقديم طلب الفسخ بنجاح');
      queryClient.invalidateQueries({ queryKey: ['contract-termination-requests'] });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting termination request:', error);
      toast.error('حدث خطأ أثناء تقديم الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning">
            <FileWarning className="h-5 w-5" />
            طلب فسخ العقد
          </DialogTitle>
          <DialogDescription>
            تقديم طلب رسمي لفسخ العقد
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* معلومات العقد */}
            <Card className="bg-muted/50">
              <CardContent className="py-3 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">رقم العقد</span>
                  <span className="font-mono font-medium">{contract.contract_number}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">المستأجر</span>
                  <span className="font-medium">{contract.tenant_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الإيجار الشهري</span>
                  <span className="font-medium">{formatCurrency(contract.monthly_rent)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ينتهي في</span>
                  <span>{format(new Date(contract.end_date), 'yyyy/MM/dd', { locale: ar })}</span>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* مقدم الطلب */}
            <FormField
              control={form.control}
              name="requested_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مقدم الطلب</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مقدم الطلب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="المؤجر">المؤجر (إدارة الوقف)</SelectItem>
                      <SelectItem value="المستأجر">المستأجر</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* نوع الفسخ */}
            <FormField
              control={form.control}
              name="termination_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الفسخ</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الفسخ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="فسخ بالتراضي">فسخ بالتراضي</SelectItem>
                      <SelectItem value="فسخ من طرف واحد">فسخ من طرف واحد</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* تاريخ الفسخ */}
            <FormField
              control={form.control}
              name="requested_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    تاريخ الفسخ المطلوب
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
                  <FormLabel>سبب طلب الفسخ</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="اذكر سبب طلب فسخ العقد بالتفصيل..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* الأساس النظامي */}
            <FormField
              control={form.control}
              name="legal_basis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    الأساس النظامي (اختياري)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="مثال: المادة (X) من نظام الإيجار، أو البند (Y) من العقد..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert variant="destructive" className="bg-warning/10 border-warning">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning">
                فسخ العقد من طرف واحد قد يترتب عليه غرامات أو تعويضات حسب شروط العقد والأنظمة المعمول بها.
              </AlertDescription>
            </Alert>

            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ms-2" />
                    جاري التقديم...
                  </>
                ) : (
                  <>
                    <FileWarning className="h-4 w-4 ms-2" />
                    تقديم طلب الفسخ
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
