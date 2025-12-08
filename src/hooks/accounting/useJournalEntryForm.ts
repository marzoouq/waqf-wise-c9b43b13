/**
 * Hook لإدارة نموذج القيد اليومي
 * Journal Entry Form Hook
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Account } from '@/types/accounting';

export interface JournalLine {
  account_id: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
}

export function useJournalEntryForm() {
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
        .select('id, code, name_ar, account_type, account_nature')
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
        .select('id, name, start_date, end_date, is_active')
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

  // إعادة تعيين النموذج
  const resetForm = () => {
    setDescription('');
    setLines([
      { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
      { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
    ]);
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
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حفظ القيد');
    },
  });

  return {
    // Form State
    entryDate,
    setEntryDate,
    description,
    setDescription,
    lines,
    
    // Data
    accounts,
    activeFiscalYear,
    
    // Computed
    totalDebit,
    totalCredit,
    isBalanced,
    
    // Actions
    addLine,
    removeLine,
    updateLine,
    saveEntry,
    resetForm,
    
    // Status
    isSaving: saveEntry.isPending,
  };
}
