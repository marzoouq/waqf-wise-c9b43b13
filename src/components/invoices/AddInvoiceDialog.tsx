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
import { Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

const invoiceSchema = z.object({
  invoice_date: z.string().min(1, { message: "تاريخ الفاتورة مطلوب" }),
  invoice_time: z.string().optional(),
  due_date: z.string().optional(),
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
}

export const AddInvoiceDialog = ({ open, onOpenChange }: AddInvoiceDialogProps) => {
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [newLine, setNewLine] = useState<Partial<InvoiceLine>>({
    account_id: "",
    description: "",
    quantity: 1,
    unit_price: 0,
    tax_rate: 15,
  });
  const queryClient = useQueryClient();

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
          total_amount: totalAmount,
          notes: data.notes || null,
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
    createInvoiceMutation.mutate(data);
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="إنشاء فاتورة جديدة"
      size="xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>ض.ق.م %</TableHead>
                    <TableHead>المجموع</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.description}</TableCell>
                      <TableCell>{line.quantity}</TableCell>
                      <TableCell>{line.unit_price.toFixed(2)}</TableCell>
                      <TableCell>{line.tax_rate}%</TableCell>
                      <TableCell>{line.line_total.toFixed(2)}</TableCell>
                      <TableCell>
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
            )}

            <div className="flex justify-end space-y-2">
              <div className="w-64">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span>{taxAmount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي:</span>
                  <span>{totalAmount.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>
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
