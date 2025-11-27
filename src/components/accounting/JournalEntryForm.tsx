import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { Account } from '@/types/accounting';

interface JournalLine {
  account_id: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
}

/**
 * مكون نموذج القيد اليومي
 */
export function JournalEntryForm() {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<JournalLine[]>([
    { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
    { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
  ]);

  const queryClient = useQueryClient();

  // جلب الحسابات
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_header', false)
        .eq('is_active', true)
        .order('code');

      if (error) throw error;
      return data as Account[];
    },
  });

  // جلب السنة المالية النشطة
  const { data: activeFiscalYear } = useQuery({
    queryKey: ['active-fiscal-year'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiscal_years')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // حساب المجاميع
  const totalDebit = lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  // إضافة سطر جديد
  const addLine = () => {
    setLines([...lines, { account_id: '', description: '', debit_amount: 0, credit_amount: 0 }]);
  };

  // حذف سطر
  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  // تحديث سطر
  const updateLine = (index: number, field: keyof JournalLine, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  // حفظ القيد
  const saveEntry = useMutation({
    mutationFn: async () => {
      if (!activeFiscalYear) {
        throw new Error('لا توجد سنة مالية نشطة');
      }

      if (!isBalanced) {
        throw new Error('القيد غير متوازن');
      }

      // إنشاء رقم القيد
      const entryNumber = `JE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      // إنشاء القيد
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert([
          {
            entry_number: entryNumber,
            entry_date: entryDate,
            description,
            fiscal_year_id: activeFiscalYear.id,
            status: 'draft',
          },
        ])
        .select()
        .single();

      if (entryError) throw entryError;

      // إضافة الأسطر
      const linesData = lines.map((line, index) => ({
        journal_entry_id: entry.id,
        account_id: line.account_id,
        line_number: index + 1,
        description: line.description,
        debit_amount: line.debit_amount || 0,
        credit_amount: line.credit_amount || 0,
      }));

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(linesData);

      if (linesError) throw linesError;

      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast.success('تم حفظ القيد بنجاح');
      // إعادة تعيين النموذج
      setDescription('');
      setLines([
        { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
        { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
      ]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل حفظ القيد');
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          قيد يومي جديد
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* معلومات القيد */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entry_date">تاريخ القيد</Label>
            <Input
              id="entry_date"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>السنة المالية</Label>
            <Input
              value={activeFiscalYear?.name || 'لا توجد سنة نشطة'}
              disabled
              className="bg-muted"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">البيان</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف القيد..."
            rows={2}
          />
        </div>

        {/* أسطر القيد */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>أسطر القيد</Label>
            <Button variant="outline" size="sm" onClick={addLine}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة سطر
            </Button>
          </div>

          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4 space-y-1">
                  <Label className="text-xs">الحساب</Label>
                  <Select
                    value={line.account_id}
                    onValueChange={(value) => updateLine(index, 'account_id', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="اختر حساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.code} - {acc.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">البيان</Label>
                  <Input
                    value={line.description}
                    onChange={(e) => updateLine(index, 'description', e.target.value)}
                    placeholder="البيان"
                    className="h-9"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">مدين</Label>
                  <Input
                    type="number"
                    value={line.debit_amount || ''}
                    onChange={(e) =>
                      updateLine(index, 'debit_amount', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                    className="h-9 text-left font-mono"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">دائن</Label>
                  <Input
                    type="number"
                    value={line.credit_amount || ''}
                    onChange={(e) =>
                      updateLine(index, 'credit_amount', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                    className="h-9 text-left font-mono"
                  />
                </div>

                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(index)}
                    disabled={lines.length <= 2}
                    className="h-9 w-full"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* المجاميع */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">إجمالي المدين</p>
              <p className="text-lg font-bold font-mono">
                {totalDebit.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">إجمالي الدائن</p>
              <p className="text-lg font-bold font-mono">
                {totalCredit.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div
              className={`text-center p-3 rounded-lg ${
                isBalanced ? 'bg-green-100 dark:bg-green-950' : 'bg-destructive/10'
              }`}
            >
              <p className="text-xs text-muted-foreground mb-1">الفرق</p>
              <p className={`text-lg font-bold font-mono ${isBalanced ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                {Math.abs(totalDebit - totalCredit).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* زر الحفظ */}
        <Button
          onClick={() => saveEntry.mutate()}
          disabled={!isBalanced || saveEntry.isPending}
          className="w-full"
          size="lg"
        >
          <Save className="h-4 w-4 ml-2" />
          {saveEntry.isPending ? 'جاري الحفظ...' : 'حفظ القيد'}
        </Button>

        {!isBalanced && totalDebit !== 0 && (
          <p className="text-sm text-destructive text-center">
            ⚠️ القيد غير متوازن. يجب أن يتساوى إجمالي المدين مع إجمالي الدائن
          </p>
        )}
      </CardContent>
    </Card>
  );
}
