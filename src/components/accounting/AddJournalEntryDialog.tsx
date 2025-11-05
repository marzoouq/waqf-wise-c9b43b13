import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type FormData = {
  entry_number: string;
  entry_date: string;
  description: string;
  fiscal_year_id: string;
};

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

  const { register, handleSubmit, reset } = useForm<FormData>();

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
            entry_date: data.entry_date,
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
      reset();
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_number">رقم القيد *</Label>
              <Input
                id="entry_number"
                {...register("entry_number", { required: true })}
                placeholder="مثال: JV-2024-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_date">التاريخ *</Label>
              <Input
                id="entry_date"
                type="date"
                {...register("entry_date", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscal_year_id">السنة المالية *</Label>
              <Select
                onValueChange={(value) => {
                  const input = document.getElementById("fiscal_year_id") as HTMLInputElement;
                  if (input) input.value = value;
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر السنة المالية" />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears?.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                id="fiscal_year_id"
                {...register("fiscal_year_id", { required: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">البيان *</Label>
            <Textarea
              id="description"
              {...register("description", { required: true })}
              placeholder="وصف القيد المحاسبي"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>تفاصيل القيد</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة سطر
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Label className="text-xs">الحساب</Label>
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
                    <Label className="text-xs">البيان</Label>
                    <Input
                      value={line.description}
                      onChange={(e) => updateLine(index, "description", e.target.value)}
                      placeholder="بيان السطر"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">مدين</Label>
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
                    <Label className="text-xs">دائن</Label>
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
                <div className="col-span-2 text-center font-bold">
                  {totalDebit.toFixed(2)}
                </div>
                <div className="col-span-2 text-center font-bold">
                  {totalCredit.toFixed(2)}
                </div>
                <div className="col-span-1"></div>
              </div>

              {!isBalanced && totalDebit > 0 && (
                <div className="text-destructive text-sm text-center">
                  ⚠️ القيد غير متوازن - الفرق: {Math.abs(totalDebit - totalCredit).toFixed(2)}
                </div>
              )}

              {isBalanced && (
                <div className="text-green-600 text-sm text-center">
                  ✓ القيد متوازن
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={mutation.isPending || !isBalanced}>
              {mutation.isPending ? "جاري الحفظ..." : "حفظ القيد"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJournalEntryDialog;
