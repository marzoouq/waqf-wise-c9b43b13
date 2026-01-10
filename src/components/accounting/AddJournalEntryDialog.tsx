import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
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
import { format } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useAddJournalEntry } from "@/hooks/accounting/useAddJournalEntry";

const formSchema = z.object({
  entry_number: z.string().min(1, { message: "رقم القيد مطلوب" }),
  entry_date: z.date({ required_error: "تاريخ القيد مطلوب" }),
  description: z.string().min(1, { message: "البيان مطلوب" }),
  fiscal_year_id: z.string().min(1, { message: "السنة المالية مطلوبة" }),
});

type JournalFormData = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AddJournalEntryDialog = ({ open, onOpenChange }: Props) => {
  const form = useForm<JournalFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entry_number: "",
      entry_date: new Date(),
      description: "",
      fiscal_year_id: "",
    },
  });

  const {
    accounts,
    fiscalYears,
    lines,
    totalDebit,
    totalCredit,
    isBalanced,
    addLine,
    removeLine,
    updateLine,
    resetLines,
    mutate,
    isPending,
  } = useAddJournalEntry(form, open, () => {
    onOpenChange(false);
  });

  // تحديد السنة المالية النشطة افتراضياً
  useEffect(() => {
    if (fiscalYears && fiscalYears.length > 0 && !form.getValues("fiscal_year_id")) {
      const activeFiscalYear = fiscalYears.find(fy => fy.is_active && !fy.is_closed);
      if (activeFiscalYear) {
        form.setValue('fiscal_year_id', activeFiscalYear.id);
      }
    }
  }, [fiscalYears, form]);

  const onSubmit = (data: JournalFormData) => {
    if (!isBalanced) {
      return;
    }
    mutate(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    resetLines();
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="إضافة قيد محاسبي جديد"
      size="xl"
    >
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
                            "w-full ps-3 text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                          <CalendarIcon className="me-auto h-4 w-4 opacity-50" />
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                <Plus className="h-4 w-4 ms-2" />
                إضافة سطر
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              {lines.map((line, index) => (
                <div key={`line-${index}-${line.account_id || ''}`} className="grid grid-cols-12 gap-2 items-end">
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
                      min="0"
                      value={line.debit_amount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        updateLine(index, "debit_amount", value);
                        if (value > 0) {
                          updateLine(index, "credit_amount", 0);
                        }
                      }}
                      placeholder="0.00"
                      className="text-right"
                    />
                  </div>

                  <div className="col-span-2">
                    <FormLabel className="text-xs">
                      دائن <span className="text-destructive">*</span>
                    </FormLabel>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.credit_amount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        updateLine(index, "credit_amount", value);
                        if (value > 0) {
                          updateLine(index, "debit_amount", 0);
                        }
                      }}
                      placeholder="0.00"
                      className="text-right"
                    />
                  </div>

                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index)}
                      disabled={lines.length <= 1}
                      className="hover:bg-destructive/10"
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
              onClick={handleClose}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending || !isBalanced}>
              {isPending ? "جاري الحفظ..." : "حفظ القيد"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};

export default AddJournalEntryDialog;
