import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

const invoiceSchema = z.object({
  invoice_date: z.string().min(1, { message: "تاريخ الفاتورة مطلوب" }),
  due_date: z.string().optional(),
  customer_name: z.string().min(3, { message: "اسم العميل مطلوب (3 حروف على الأقل)" }),
  customer_email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }).optional().or(z.literal("")),
  customer_phone: z.string().optional(),
  customer_address: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

type InvoiceLine = {
  id: string;
  account_id: string;
  description: string;
  quantity: number;
  unit_price: number;
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
  });
  const queryClient = useQueryClient();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_date: format(new Date(), "yyyy-MM-dd"),
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      notes: "",
    },
  });

  // Get revenue accounts for invoice lines
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

  // Get active fiscal year
  const { data: activeFiscalYear } = useQuery({
    queryKey: ["active-fiscal-year"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .eq("is_active", true)
        .eq("is_closed", false)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Get next invoice number
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

    const line: InvoiceLine = {
      id: Math.random().toString(),
      account_id: newLine.account_id!,
      description: newLine.description!,
      quantity: newLine.quantity!,
      unit_price: newLine.unit_price!,
      line_total: (newLine.quantity || 0) * (newLine.unit_price || 0),
    };

    setLines([...lines, line]);
    setNewLine({
      account_id: "",
      description: "",
      quantity: 1,
      unit_price: 0,
    });
  };

  const removeLine = (id: string) => {
    setLines(lines.filter((line) => line.id !== id));
  };

  const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
  const taxAmount = subtotal * 0.15; // 15% VAT
  const totalAmount = subtotal + taxAmount;

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      if (lines.length === 0) {
        throw new Error("يجب إضافة بند واحد على الأقل");
      }

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: nextInvoiceNumber!,
          invoice_date: data.invoice_date,
          due_date: data.due_date || null,
          customer_name: data.customer_name,
          customer_email: data.customer_email || null,
          customer_phone: data.customer_phone || null,
          customer_address: data.customer_address || null,
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          notes: data.notes || null,
          status: "draft",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice lines
      const invoiceLines = lines.map((line, index) => ({
        invoice_id: invoice.id,
        line_number: index + 1,
        account_id: line.account_id,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
        line_total: line.line_total,
      }));

      const { error: linesError } = await supabase
        .from("invoice_lines")
        .insert(invoiceLines);

      if (linesError) throw linesError;

      // Create journal entry if fiscal year exists
      if (activeFiscalYear) {
        // Get accounts receivable account (مدينون - Asset)
        const { data: receivableAccount } = await supabase
          .from("accounts")
          .select("id")
          .eq("account_type", "asset")
          .eq("is_header", false)
          .ilike("name_ar", "%مدين%")
          .limit(1)
          .maybeSingle();

        if (receivableAccount) {
          // Get next journal entry number
          const { data: lastEntry } = await supabase
            .from("journal_entries")
            .select("entry_number")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          let entryNumber = `JV-${format(new Date(), "yyyy")}-001`;
          if (lastEntry) {
            const lastNumber = parseInt(lastEntry.entry_number.split("-")[2]);
            const newNumber = (lastNumber + 1).toString().padStart(3, "0");
            entryNumber = `JV-${format(new Date(), "yyyy")}-${newNumber}`;
          }

          // Create journal entry
          const { data: journalEntry, error: jeError } = await supabase
            .from("journal_entries")
            .insert({
              entry_number: entryNumber,
              entry_date: data.invoice_date,
              description: `فاتورة رقم ${invoice.invoice_number} - ${data.customer_name}`,
              fiscal_year_id: activeFiscalYear.id,
              reference_type: "invoice",
              reference_id: invoice.id,
              status: "draft",
            })
            .select()
            .single();

          if (!jeError && journalEntry) {
            // Create journal entry lines
            const journalLines = [];

            // Debit: Accounts Receivable
            journalLines.push({
              journal_entry_id: journalEntry.id,
              line_number: 1,
              account_id: receivableAccount.id,
              description: `مدينون - ${data.customer_name}`,
              debit_amount: totalAmount,
              credit_amount: 0,
            });

            // Credit: Revenue accounts
            lines.forEach((line, index) => {
              journalLines.push({
                journal_entry_id: journalEntry.id,
                line_number: index + 2,
                account_id: line.account_id,
                description: line.description,
                debit_amount: 0,
                credit_amount: line.line_total,
              });
            });

            // Credit: Tax account (if exists)
            if (taxAmount > 0) {
              const { data: taxAccount } = await supabase
                .from("accounts")
                .select("id")
                .eq("account_type", "liability")
                .eq("is_header", false)
                .ilike("name_ar", "%ضريب%")
                .limit(1)
                .maybeSingle();

              if (taxAccount) {
                journalLines.push({
                  journal_entry_id: journalEntry.id,
                  line_number: lines.length + 2,
                  account_id: taxAccount.id,
                  description: "ضريبة القيمة المضافة",
                  debit_amount: 0,
                  credit_amount: taxAmount,
                });
              }
            }

            await supabase.from("journal_entry_lines").insert(journalLines);

            // Update invoice with journal entry id
            await supabase
              .from("invoices")
              .update({ journal_entry_id: journalEntry.id })
              .eq("id", invoice.id);
          }
        }
      }

      return invoice;
    },
    onSuccess: () => {
      toast.success("تم إنشاء الفاتورة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">فاتورة جديدة</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">رقم الفاتورة</div>
                <Input value={nextInvoiceNumber || "..."} disabled className="bg-muted" />
              </div>

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

            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold">بيانات العميل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم العميل *</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input type="email" {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">بنود الفاتورة</h3>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الحساب</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead className="w-24">الكمية</TableHead>
                      <TableHead className="w-32">السعر</TableHead>
                      <TableHead className="w-32">الإجمالي</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => {
                      const account = accounts?.find((a) => a.id === line.account_id);
                      return (
                        <TableRow key={line.id}>
                          <TableCell className="text-sm">
                            {account?.code} - {account?.name_ar}
                          </TableCell>
                          <TableCell>{line.description}</TableCell>
                          <TableCell className="text-center">{line.quantity}</TableCell>
                          <TableCell className="text-left font-mono">
                            {line.unit_price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-left font-mono font-semibold">
                            {line.line_total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLine(line.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    <TableRow>
                      <TableCell>
                        <Select
                          value={newLine.account_id}
                          onValueChange={(value) =>
                            setNewLine({ ...newLine, account_id: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحساب" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts?.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.code} - {account.name_ar}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="الوصف"
                          value={newLine.description}
                          onChange={(e) =>
                            setNewLine({ ...newLine, description: e.target.value })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={newLine.quantity}
                          onChange={(e) =>
                            setNewLine({ ...newLine, quantity: parseFloat(e.target.value) || 1 })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newLine.unit_price}
                          onChange={(e) =>
                            setNewLine({ ...newLine, unit_price: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-left font-mono">
                        {((newLine.quantity || 0) * (newLine.unit_price || 0)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button type="button" size="sm" onClick={addLine}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {lines.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  لم يتم إضافة أي بنود بعد
                </p>
              )}

              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span className="font-mono">{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ضريبة القيمة المضافة (15%):</span>
                    <span className="font-mono">{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-base">
                    <span>الإجمالي:</span>
                    <span className="font-mono">{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={createInvoiceMutation.isPending || lines.length === 0}
              >
                {createInvoiceMutation.isPending && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                حفظ الفاتورة
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
