import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { commonValidation } from "@/lib/validationSchemas";

const voucherSchema = z.object({
  payment_number: z.string().min(1, { message: "رقم السند مطلوب" }),
  payment_date: commonValidation.dateString("التاريخ غير صحيح"),
  amount: z.coerce.number().min(0.01, { message: "المبلغ يجب أن يكون أكبر من صفر" }),
  payment_method: z.enum(["cash", "bank_transfer", "cheque", "card"], {
    required_error: "طريقة الدفع مطلوبة",
  }),
  payee_name: z.string().min(1, { message: "اسم المستفيد مطلوب" }),
  reference_number: z.string().optional(),
  description: z.string().min(1, { message: "البيان مطلوب" }),
  notes: z.string().optional(),
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

interface AddVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVoucherDialog({ open, onOpenChange }: AddVoucherDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      payment_number: `VCH-${format(new Date(), "yyMMdd")}-001`,
      payment_date: format(new Date(), "yyyy-MM-dd"),
      amount: 0,
      payment_method: "cash",
      payee_name: "",
      reference_number: "",
      description: "",
      notes: "",
    },
  });

  const handleSubmit = async (data: VoucherFormValues) => {
    try {
      setIsSubmitting(true);

      // إنشاء قيد محاسبي تلقائي
      const { error: jeError } = await supabase.rpc('create_auto_journal_entry', {
        p_trigger_event: 'payment_voucher',
        p_reference_id: crypto.randomUUID(),
        p_amount: data.amount,
        p_description: `سند صرف: ${data.description} - ${data.payee_name}`,
        p_transaction_date: data.payment_date
      });

      if (jeError) throw jeError;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم إضافة سند الصرف وإنشاء القيد المحاسبي",
      });

      queryClient.invalidateQueries({ queryKey: ['cashier-stats'] });
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] });
      
      form.reset();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'فشل إضافة سند الصرف';
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="إضافة سند صرف"
      description="قم بإدخال بيانات سند الصرف في النموذج أدناه"
      size="lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="payment_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم السند *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="VCH-250115-001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التاريخ *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ (ريال) *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} placeholder="0.00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>طريقة الدفع *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر طريقة الدفع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">نقداً</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="cheque">شيك</SelectItem>
                      <SelectItem value="card">بطاقة</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payee_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المستفيد *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل اسم المستفيد" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم المرجع</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="رقم الشيك أو التحويل" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>البيان *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="وصف المدفوع" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ملاحظات</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="ملاحظات إضافية..." rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </ResponsiveDialog>
  );
}
