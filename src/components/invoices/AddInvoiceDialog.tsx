import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { generateZATCAQRData, formatZATCACurrency, validateVATNumber } from "@/lib/zatca";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { validateZATCAInvoice, formatValidationErrors } from "@/lib/validateZATCAInvoice";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { commonValidation } from "@/lib/validationSchemas";

const invoiceSchema = z.object({
  invoice_date: commonValidation.dateString("تاريخ الفاتورة غير صحيح"),
  invoice_time: z.string().optional(),
  due_date: z.string().optional().refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "تاريخ الاستحقاق غير صحيح"
  }),
  customer_name: z.string().min(3, { message: "اسم العميل مطلوب (3 حروف على الأقل)" }),
  customer_email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }).optional().or(z.literal("")),
  customer_phone: z.string().optional(),
  customer_address: z.string().optional(),
  customer_city: z.string().optional(),
  customer_vat_number: z.string().optional(),
  customer_commercial_registration: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

type InvoiceLine = {
  id: string;
  account_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  line_total: number;
};

interface AddInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit?: boolean;
  invoiceToEdit?: any;
}

export const AddInvoiceDialog = ({ open, onOpenChange, isEdit = false, invoiceToEdit }: AddInvoiceDialogProps) => {
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [newLine, setNewLine] = useState<Partial<InvoiceLine>>({
    account_id: "",
    description: "",
    quantity: 1,
    unit_price: 0,
    tax_rate: 15,
  });
  const queryClient = useQueryClient();
  const { settings: orgSettings } = useOrganizationSettings();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_date: format(new Date(), "yyyy-MM-dd"),
      invoice_time: format(new Date(), "HH:mm"),
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      customer_city: "",
      customer_vat_number: "",
      customer_commercial_registration: "",
      notes: "",
    },
  });

  const { data: accounts } = useQuery({
    queryKey: ["revenue-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("account_type", "revenue")
        .eq("is_active", true)
        .eq("is_header", false)
        .order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: nextInvoiceNumber } = useQuery({
    queryKey: ["next-invoice-number"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_number")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return `INV-${format(new Date(), "yyyy")}-001`;
      }
      
      const lastNumber = parseInt(data.invoice_number.split("-")[2]);
      const newNumber = (lastNumber + 1).toString().padStart(3, "0");
      return `INV-${format(new Date(), "yyyy")}-${newNumber}`;
    },
  });

  const addLine = () => {
    if (!newLine.account_id || !newLine.description || !newLine.quantity || !newLine.unit_price) {
      toast.error("يرجى ملء جميع حقول البند");
      return;
    }

    const quantity = newLine.quantity!;
    const unitPrice = newLine.unit_price!;
    const taxRate = newLine.tax_rate || 15;
    
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * (taxRate / 100);
    const lineTotal = subtotal + taxAmount;

    const line: InvoiceLine = {
      id: Math.random().toString(),
      account_id: newLine.account_id!,
      description: newLine.description!,
      quantity,
      unit_price: unitPrice,
      tax_rate: taxRate,
      subtotal,
      tax_amount: taxAmount,
      line_total: lineTotal,
    };

    setLines([...lines, line]);
    setNewLine({
      account_id: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 15,
    });
  };

  const removeLine = (id: string) => {
    setLines(lines.filter((line) => line.id !== id));
  };

  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const taxAmount = lines.reduce((sum, line) => sum + line.tax_amount, 0);
  const totalAmount = subtotal + taxAmount;

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      if (lines.length === 0) {
        throw new Error("يجب إضافة بند واحد على الأقل");
      }

      // التحقق من صحة البيانات
      const validationResult = validateZATCAInvoice({
        invoice_number: nextInvoiceNumber!,
        invoice_date: data.invoice_date,
        seller_vat_number: orgSettings?.vat_registration_number || "",
        customer_name: data.customer_name,
        lines: lines.map(line => ({
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          tax_rate: line.tax_rate,
        })),
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
      });

      if (!validationResult.isValid) {
        throw new Error(formatValidationErrors(validationResult));
      }

      // توليد QR Code
      let qrCodeData = null;
      if (orgSettings) {
        const invoiceDate = new Date(data.invoice_date);
        if (data.invoice_time) {
          const [hours, minutes] = data.invoice_time.split(':');
          invoiceDate.setHours(parseInt(hours), parseInt(minutes));
        }
        
        qrCodeData = generateZATCAQRData({
          sellerName: orgSettings.organization_name_ar,
          sellerVatNumber: orgSettings.vat_registration_number,
          invoiceDate: invoiceDate.toISOString(),
          invoiceTotal: formatZATCACurrency(totalAmount),
          vatTotal: formatZATCACurrency(taxAmount),
        });
      }

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: nextInvoiceNumber!,
          invoice_date: data.invoice_date,
          invoice_time: data.invoice_time || format(new Date(), "HH:mm"),
          due_date: data.due_date || null,
          customer_name: data.customer_name,
          customer_email: data.customer_email || null,
          customer_phone: data.customer_phone || null,
          customer_address: data.customer_address || null,
          customer_city: data.customer_city || null,
          customer_vat_number: data.customer_vat_number || null,
          customer_commercial_registration: data.customer_commercial_registration || null,
          subtotal,
          tax_amount: taxAmount,
          tax_rate: 15,
          total_amount: totalAmount,
          notes: data.notes || null,
          qr_code_data: qrCodeData,
          status: "draft",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const invoiceLines = lines.map((line, index) => ({
        invoice_id: invoice.id,
        line_number: index + 1,
        account_id: line.account_id,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
        subtotal: line.subtotal,
        tax_rate: line.tax_rate,
        tax_amount: line.tax_amount,
        line_total: line.line_total,
      }));

      const { error: linesError } = await supabase
        .from("invoice_lines")
        .insert(invoiceLines);

      if (linesError) throw linesError;

      return invoice;
    },
    onSuccess: () => {
      toast.success("تم إنشاء الفاتورة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["next-invoice-number"] });
      form.reset();
      setLines([]);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`خطأ في إنشاء الفاتورة: ${error.message}`);
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    // التحقق من بيانات المنشأة
    if (!orgSettings) {
      toast.error("يجب تعيين بيانات المنشأة أولاً من صفحة الإعدادات");
      return;
    }

    // التحقق من صحة الرقم الضريبي للعميل إذا وُجد
    if (data.customer_vat_number && !validateVATNumber(data.customer_vat_number)) {
      toast.error("الرقم الضريبي للعميل غير صحيح (يجب أن يكون 15 رقم ويبدأ بـ 3)");
      return;
    }

    createInvoiceMutation.mutate(data);
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={isEdit ? "تعديل فاتورة" : "إنشاء فاتورة جديدة"}
      description={isEdit ? "تعديل بيانات الفاتورة وبنودها" : "إنشاء فاتورة ضريبية متوافقة مع متطلبات هيئة الزكاة والضريبة"}
      size="xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {!orgSettings && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                لم يتم تعيين بيانات المنشأة. يرجى إضافة بيانات المنشأة من صفحة الإعدادات أولاً.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">رقم الفاتورة التالي</span>
              <span className="font-bold text-primary">{nextInvoiceNumber || "..."}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="invoice_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ الفاتورة *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoice_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وقت الإصدار</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ الاستحقاق</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم العميل *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل اسم العميل" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="05XXXXXXXX" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="email@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المدينة</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="الرياض" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_vat_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الرقم الضريبي</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="3XXXXXXXXXXXXXX (15 رقم)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_commercial_registration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السجل التجاري</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="رقم السجل التجاري" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="customer_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العنوان</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="أدخل العنوان التفصيلي" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">بنود الفاتورة</h3>
            
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-3">
                <Select
                  value={newLine.account_id}
                  onValueChange={(value) => setNewLine({ ...newLine, account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Input
                  placeholder="الوصف"
                  value={newLine.description || ""}
                  onChange={(e) => setNewLine({ ...newLine, description: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="الكمية"
                  value={newLine.quantity || ""}
                  onChange={(e) => setNewLine({ ...newLine, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="السعر"
                  value={newLine.unit_price || ""}
                  onChange={(e) => setNewLine({ ...newLine, unit_price: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="ض.ق.م %"
                  value={newLine.tax_rate || 15}
                  onChange={(e) => setNewLine({ ...newLine, tax_rate: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-1">
                <Button type="button" onClick={addLine} className="w-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {lines.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-center">ض.ق.م %</TableHead>
                      <TableHead className="text-right">المجموع الفرعي</TableHead>
                      <TableHead className="text-right">قيمة الضريبة</TableHead>
                      <TableHead className="text-right font-bold">الإجمالي</TableHead>
                      <TableHead className="text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell className="text-center">{line.quantity}</TableCell>
                        <TableCell className="text-right font-mono">{line.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-center font-semibold">{line.tax_rate}%</TableCell>
                        <TableCell className="text-right font-mono">{line.subtotal.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{line.tax_amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono font-bold">{line.line_total.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLine(line.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end mt-6">
                  <Card className="w-full md:w-96">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">المجموع (غير شامل ض.ق.م):</span>
                        <span className="font-mono font-semibold">{formatZATCACurrency(subtotal)} ريال</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ضريبة القيمة المضافة (15%):</span>
                        <span className="font-mono font-semibold">{formatZATCACurrency(taxAmount)} ريال</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span>الإجمالي (شامل ض.ق.م):</span>
                          <span className="font-mono text-primary">{formatZATCACurrency(totalAmount)} ريال</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={createInvoiceMutation.isPending || lines.length === 0}
            >
              {createInvoiceMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              إنشاء الفاتورة
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
