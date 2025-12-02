import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
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
import { format } from "@/lib/date";
import { commonValidation } from "@/lib/validationSchemas";
import { Database } from "@/integrations/supabase/types";
import { useContracts } from "@/hooks/useContracts";
import { Info } from "lucide-react";

type Payment = Database['public']['Tables']['payments']['Row'];

const paymentSchema = z.object({
  payment_type: z.enum(["receipt", "payment"], {
    required_error: "نوع السند مطلوب",
  }),
  payment_number: z.string().min(1, { message: "رقم السند مطلوب" }),
  payment_date: commonValidation.dateString("التاريخ غير صحيح"),
  amount: z.coerce.number().min(0.01, { message: "المبلغ يجب أن يكون أكبر من صفر" }),
  payment_method: z.enum(["cash", "bank_transfer", "cheque", "card"], {
    required_error: "طريقة الدفع مطلوبة",
  }),
  payer_name: z.string().min(1, { message: "اسم الدافع/المستفيد مطلوب" }),
  reference_number: z.string().optional(),
  description: z.string().min(1, { message: "البيان مطلوب" }),
  notes: z.string().optional(),
  contract_id: z.string().transform(val => val === "none" ? undefined : val).optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment | null;
  onSave: (data: PaymentFormValues) => Promise<void>;
}

export function PaymentDialog({
  open,
  onOpenChange,
  payment,
  onSave,
}: PaymentDialogProps) {
  const { contracts, isLoading: contractsLoading } = useContracts();
  
  // تصفية العقود النشطة فقط
  const activeContracts = contracts?.filter(c => c.status === "نشط") || [];

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_type: (payment?.payment_type as "receipt" | "payment") || "receipt",
      payment_number: payment?.payment_number || "",
      payment_date: payment?.payment_date || format(new Date(), "yyyy-MM-dd"),
      amount: payment?.amount || 0,
      payment_method: (payment?.payment_method as "cash" | "bank_transfer" | "cheque" | "card") || "cash",
      payer_name: payment?.payer_name || "",
      reference_number: payment?.reference_number || "",
      description: payment?.description || "",
      notes: payment?.notes || "",
      contract_id: payment?.contract_id || "none",
    },
  });

  const handleSubmit = async (data: PaymentFormValues) => {
    await onSave(data);
    form.reset();
  };

  const paymentType = form.watch("payment_type");
  const selectedContractId = form.watch("contract_id");

  // تعبئة تلقائية عند اختيار عقد
  useEffect(() => {
    if (selectedContractId && selectedContractId !== "none" && activeContracts.length > 0) {
      const contract = activeContracts.find(c => c.id === selectedContractId);
      if (contract) {
        form.setValue("payer_name", contract.tenant_name);
        form.setValue("description", 
          `${paymentType === "receipt" ? "قبض" : "صرف"} - عقد رقم ${contract.contract_number} - ${contract.properties?.name || 'عقار'}`
        );
      }
    }
  }, [selectedContractId, activeContracts, form, paymentType]);

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

            {/* اختيار العقد (اختياري) */}
            <FormField
              control={form.control}
              name="contract_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ربط بعقد (اختياري)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={contractsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر عقد لربطه بالسند" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">بدون ربط</SelectItem>
                      {activeContracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.contract_number} - {contract.tenant_name} - {contract.properties?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span>عند اختيار عقد، سيتم تعبئة الاسم والبيان تلقائياً</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      disabled={!!selectedContractId && selectedContractId !== "none"}
                    />
                  </FormControl>
                  {selectedContractId && selectedContractId !== "none" && (
                    <p className="text-xs text-muted-foreground">تم التعبئة تلقائياً من العقد</p>
                  )}
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
                      disabled={!!selectedContractId && selectedContractId !== "none"}
                    />
                  </FormControl>
                  {selectedContractId && selectedContractId !== "none" && (
                    <p className="text-xs text-muted-foreground">تم التعبئة تلقائياً من العقد</p>
                  )}
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
