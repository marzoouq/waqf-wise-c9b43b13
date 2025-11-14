import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const paymentSchema = z.object({
  payment_type: z.enum(["receipt", "payment"], {
    required_error: "نوع السند مطلوب",
  }),
  payment_number: z.string().min(1, { message: "رقم السند مطلوب" }),
  payment_date: z.string().min(1, { message: "التاريخ مطلوب" }),
  amount: z.coerce.number().min(0.01, { message: "المبلغ يجب أن يكون أكبر من صفر" }),
  payment_method: z.enum(["cash", "bank_transfer", "cheque", "card"], {
    required_error: "طريقة الدفع مطلوبة",
  }),
  payer_name: z.string().min(1, { message: "اسم الدافع/المستفيد مطلوب" }),
  reference_number: z.string().optional(),
  description: z.string().min(1, { message: "البيان مطلوب" }),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: any;
  onSave: (data: PaymentFormValues) => Promise<void>;
}

export function PaymentDialog({
  open,
  onOpenChange,
  payment,
  onSave,
}: PaymentDialogProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_type: payment?.payment_type || "receipt",
      payment_number: payment?.payment_number || "",
      payment_date: payment?.payment_date || format(new Date(), "yyyy-MM-dd"),
      amount: payment?.amount || 0,
      payment_method: payment?.payment_method || "cash",
      payer_name: payment?.payer_name || "",
      reference_number: payment?.reference_number || "",
      description: payment?.description || "",
      notes: payment?.notes || "",
    },
  });

  const handleSubmit = async (data: PaymentFormValues) => {
    await onSave(data);
    form.reset();
  };

  const paymentType = form.watch("payment_type");

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={payment ? "تعديل السند" : "إضافة سند جديد"}
      description={payment ? "قم بتعديل بيانات السند في النموذج أدناه" : "قم بإدخال بيانات السند في النموذج أدناه"}
      size="lg"
    >

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع السند *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع السند" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="receipt">سند قبض</SelectItem>
                        <SelectItem value="payment">سند صرف</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم السند *</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: REC-2025-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <FormLabel>المبلغ (ر.س) *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <SelectItem value="card">بطاقة ائتمان</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {paymentType === "receipt" ? "المستلم من *" : "المدفوع إلى *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        paymentType === "receipt"
                          ? "اسم الدافع"
                          : "اسم المستفيد"
                      }
                      {...field}
                    />
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
                  <FormLabel>الرقم المرجعي</FormLabel>
                  <FormControl>
                    <Input placeholder="رقم الشيك أو رقم التحويل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البيان *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وصف السند والغرض منه"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
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
                    <Textarea
                      placeholder="أي ملاحظات إضافية (اختياري)"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
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
              >
                إلغاء
              </Button>
              <Button type="submit">
                {payment ? "حفظ التعديلات" : "إضافة السند"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
    </ResponsiveDialog>
  );
}
