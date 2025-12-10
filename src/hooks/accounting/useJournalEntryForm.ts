/**
 * Hook لإدارة نموذج القيد اليومي
 * @version 2.8.73 - Refactored to use JournalEntryFormService
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JournalEntryFormService } from '@/services/accounting.service';
import { toast } from 'sonner';
import { Account } from '@/types/accounting';
import { QUERY_KEYS } from '@/lib/query-keys';

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
    queryKey: QUERY_KEYS.ACCOUNTS,
    queryFn: () => JournalEntryFormService.getAccountsForEntry() as Promise<Account[]>,
  });

  // جلب السنة المالية النشطة
  const { data: activeFiscalYear } = useQuery({
    queryKey: QUERY_KEYS.ACTIVE_FISCAL_YEAR,
    queryFn: () => JournalEntryFormService.getActiveFiscalYear(),
  });

  // حساب المجاميع
  const totalDebit = lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const addLine = () => {
    setLines([...lines, { account_id: '', description: '', debit_amount: 0, credit_amount: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: keyof JournalLine, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const resetForm = () => {
    setDescription('');
    setLines([
      { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
      { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
    ]);
  };

  const saveEntry = useMutation({
    mutationFn: async () => {
      if (!activeFiscalYear) throw new Error('لا توجد سنة مالية نشطة');
      if (!isBalanced) throw new Error('القيد غير متوازن');

      return JournalEntryFormService.createJournalEntry({
        entryDate,
        description,
        fiscalYearId: activeFiscalYear.id,
        lines,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
      toast.success('تم حفظ القيد بنجاح');
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حفظ القيد');
    },
  });

  return {
    entryDate, setEntryDate, description, setDescription, lines,
    accounts, activeFiscalYear,
    totalDebit, totalCredit, isBalanced,
    addLine, removeLine, updateLine, saveEntry, resetForm,
    isSaving: saveEntry.isPending,
  };
}
