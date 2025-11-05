import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const formSchema = z.object({
  entry_number: z.string().min(1, { message: "رقم القيد مطلوب" }),
  entry_date: z.date({ required_error: "تاريخ القيد مطلوب" }),
  description: z.string().min(1, { message: "البيان مطلوب" }),
  fiscal_year_id: z.string().min(1, { message: "السنة المالية مطلوبة" }),
});

type FormData = z.infer<typeof formSchema>;

type EntryLine = {
  account_id: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AddJournalEntryDialog = ({ open, onOpenChange }: Props) => {
  const queryClient = useQueryClient();
  const [lines, setLines] = useState<EntryLine[]>([
    { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
    { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
  ]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entry_number: "",
      entry_date: new Date(),
      description: "",
      fiscal_year_id: "",
    },
  });

  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("is_active", true)
        .eq("is_header", false)
        .order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: fiscalYears } = useQuery({
    queryKey: ["fiscal_years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const totalDebit = lines.reduce((sum, line) => sum + line.debit_amount, 0);
      const totalCredit = lines.reduce((sum, line) => sum + line.credit_amount, 0);

      if (totalDebit !== totalCredit) {
        throw new Error("مجموع المدين يجب أن يساوي مجموع الدائن");
      }

      if (lines.some((line) => !line.account_id)) {
        throw new Error("يجب اختيار حساب لكل سطر");
      }

      const { data: entry, error: entryError } = await supabase
        .from("journal_entries")
        .insert([
          {
            entry_number: data.entry_number,
            entry_date: format(data.entry_date, 'yyyy-MM-dd'),
            description: data.description,
            fiscal_year_id: data.fiscal_year_id,
            status: "draft",
          },
        ])
        .select()
        .single();

      if (entryError) throw entryError;

      const entryLines = lines.map((line, index) => ({
        journal_entry_id: entry.id,
        account_id: line.account_id,
        description: line.description,
        debit_amount: line.debit_amount,
        credit_amount: line.credit_amount,
        line_number: index + 1,
      }));

      const { error: linesError } = await supabase
        .from("journal_entry_lines")
        .insert(entryLines);

      if (linesError) throw linesError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast.success("تم إضافة القيد بنجاح");
      onOpenChange(false);
      form.reset();
      setLines([
        { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
        { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
      ]);
    },
    onError: (error: any) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const onSubmit = (data: FormData) => {
    if (!isBalanced) {
      toast.error("القيد غير متوازن");
      return;
    }
    mutation.mutate(data);
  };

  const addLine = () => {
    setLines([
      ...lines,
      { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: keyof EntryLine, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const totalDebit = lines.reduce((sum, line) => sum + line.debit_amount, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit_amount, 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة قيد محاسبي جديد</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="entry_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      رقم القيد <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: JV-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      تاريخ القيد <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-right font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                            <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fiscal_year_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      السنة المالية <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر السنة المالية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fiscalYears?.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <FormLabel>
                    البيان <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وصف القيد المحاسبي"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>تفاصيل القيد</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة سطر
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                {lines.map((line, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <FormLabel className="text-xs">
                        الحساب <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        value={line.account_id}
                        onValueChange={(value) => updateLine(index, "account_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحساب" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts?.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name_ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3">
                      <FormLabel className="text-xs">البيان</FormLabel>
                      <Input
                        value={line.description}
                        onChange={(e) => updateLine(index, "description", e.target.value)}
                        placeholder="بيان السطر"
                      />
                    </div>

                    <div className="col-span-2">
                      <FormLabel className="text-xs">
                        مدين <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={line.debit_amount || ""}
                        onChange={(e) => {
                          updateLine(index, "debit_amount", parseFloat(e.target.value) || 0);
                          if (parseFloat(e.target.value) > 0) {
                            updateLine(index, "credit_amount", 0);
                          }
                        }}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-2">
                      <FormLabel className="text-xs">
                        دائن <span className="text-destructive">*</span>
                      </FormLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={line.credit_amount || ""}
                        onChange={(e) => {
                          updateLine(index, "credit_amount", parseFloat(e.target.value) || 0);
                          if (parseFloat(e.target.value) > 0) {
                            updateLine(index, "debit_amount", 0);
                          }
                        }}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(index)}
                        disabled={lines.length <= 2}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-3 grid grid-cols-12 gap-2">
                  <div className="col-span-7 text-left font-semibold">
                    الإجمالي:
                  </div>
                  <div className="col-span-2 text-center font-bold text-success">
                    {totalDebit.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-center font-bold text-primary">
                    {totalCredit.toFixed(2)}
                  </div>
                  <div className="col-span-1"></div>
                </div>

                {!isBalanced && totalDebit > 0 && (
                  <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                    ⚠️ القيد غير متوازن - الفرق: {Math.abs(totalDebit - totalCredit).toFixed(2)}
                  </div>
                )}

                {isBalanced && (
                  <div className="text-success text-sm text-center bg-success/10 p-2 rounded">
                    ✓ القيد متوازن
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={mutation.isPending || !isBalanced}>
                {mutation.isPending ? "جاري الحفظ..." : "حفظ القيد"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJournalEntryDialog;
