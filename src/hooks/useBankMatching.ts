import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export interface BankMatchingRule {
  id: string;
  rule_name: string;
  description?: string;
  conditions: {
    amount_tolerance: number;
    date_range_days: number;
    description_keywords?: string[];
  };
  account_mapping: {
    debit_account: string;
    credit_account: string;
  };
  priority: number;
  is_active: boolean;
  match_count: number;
}

export interface BankReconciliationMatch {
  id: string;
  bank_transaction_id: string;
  journal_entry_id: string;
  match_type: 'auto' | 'manual' | 'suggested';
  confidence_score: number;
  matching_rule_id?: string;
  matched_at: string;
  notes?: string;
}

export interface MatchSuggestion {
  bankTransactionId: string;
  journalEntryId: string;
  confidence: number;
  reason: string;
  rule?: BankMatchingRule;
}

export function useBankMatching() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rules, isLoading: isLoadingRules } = useQuery({
    queryKey: ['bank_matching_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_matching_rules')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        conditions: item.conditions as any,
        account_mapping: item.account_mapping as any,
      })) as BankMatchingRule[];
    },
  });

  const { data: matches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ['bank_reconciliation_matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_reconciliation_matches')
        .select('*')
        .order('matched_at', { ascending: false });

      if (error) throw error;
      return data as BankReconciliationMatch[];
    },
  });

  const autoMatch = useMutation({
    mutationFn: async ({ statementId }: { statementId: string }) => {
      // جلب العمليات البنكية غير المطابقة
      const { data: transactions, error: txError } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('statement_id', statementId)
        .eq('is_matched', false);

      if (txError) throw txError;

      // جلب القيود المحاسبية غير المطابقة
      const { data: entries, error: entriesError } = await supabase
        .from('journal_entries')
        .select('*, journal_entry_lines(*, accounts(*))')
        .eq('status', 'posted');

      if (entriesError) throw entriesError;

      const suggestions: MatchSuggestion[] = [];

      // خوارزمية المطابقة
      for (const tx of transactions || []) {
        for (const entry of entries || []) {
          const entryAmount = Math.abs(
            entry.journal_entry_lines.reduce(
              (sum: number, line: any) => sum + (line.debit_amount - line.credit_amount),
              0
            )
          );

          let confidence = 0;

          // مطابقة المبلغ (40%)
          const amountDiff = Math.abs(Math.abs(tx.amount) - entryAmount);
          if (amountDiff === 0) {
            confidence += 0.4;
          } else if (amountDiff <= Math.abs(tx.amount) * 0.01) {
            confidence += 0.3;
          } else if (amountDiff <= Math.abs(tx.amount) * 0.05) {
            confidence += 0.2;
          }

          // مطابقة التاريخ (30%)
          const txDate = new Date(tx.transaction_date);
          const entryDate = new Date(entry.entry_date);
          const daysDiff = Math.abs(
            (txDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff <= 3) {
            confidence += 0.3;
          } else if (daysDiff <= 7) {
            confidence += 0.2;
          } else if (daysDiff <= 14) {
            confidence += 0.1;
          }

          // مطابقة الوصف (30%)
          const txDesc = (tx.description || '').toLowerCase();
          const entryDesc = (entry.description || '').toLowerCase();
          
          if (txDesc && entryDesc) {
            const commonWords = txDesc.split(' ').filter((word: string) =>
              entryDesc.includes(word)
            );
            const similarity = commonWords.length / Math.max(
              txDesc.split(' ').length,
              entryDesc.split(' ').length
            );

            if (similarity > 0.7) {
              confidence += 0.3;
            } else if (similarity > 0.4) {
              confidence += 0.2;
            } else if (similarity > 0.2) {
              confidence += 0.1;
            }
          }

          if (confidence >= 0.7) {
            suggestions.push({
              bankTransactionId: tx.id,
              journalEntryId: entry.id,
              confidence,
              reason: `تطابق ${(confidence * 100).toFixed(0)}%: مبلغ متقارب وتاريخ متقارب`,
            });
          }
        }
      }

      // ترتيب حسب الثقة
      suggestions.sort((a, b) => b.confidence - a.confidence);

      // تطبيق المطابقات العالية الثقة (>90%)
      const autoMatches = suggestions.filter(s => s.confidence >= 0.9);
      
      for (const match of autoMatches) {
        await supabase.from('bank_reconciliation_matches').insert({
          bank_transaction_id: match.bankTransactionId,
          journal_entry_id: match.journalEntryId,
          match_type: 'auto',
          confidence_score: match.confidence,
        });

        await supabase
          .from('bank_transactions')
          .update({ is_matched: true, journal_entry_id: match.journalEntryId })
          .eq('id', match.bankTransactionId);
      }

      return { suggestions, autoMatched: autoMatches.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bank_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank_reconciliation_matches'] });
      toast({
        title: 'تمت المطابقة التلقائية',
        description: `تم مطابقة ${data.autoMatched} عملية تلقائياً، و ${data.suggestions.length - data.autoMatched} اقتراح للمراجعة`,
      });
    },
  });

  const manualMatch = useMutation({
    mutationFn: async ({
      bankTransactionId,
      journalEntryId,
      notes,
    }: {
      bankTransactionId: string;
      journalEntryId: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('bank_reconciliation_matches')
        .insert({
          bank_transaction_id: bankTransactionId,
          journal_entry_id: journalEntryId,
          match_type: 'manual',
          confidence_score: 1.0,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('bank_transactions')
        .update({ is_matched: true, journal_entry_id: journalEntryId })
        .eq('id', bankTransactionId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank_reconciliation_matches'] });
      toast({
        title: 'تمت المطابقة',
        description: 'تم ربط العملية البنكية بالقيد المحاسبي بنجاح',
      });
    },
  });

  const unmatch = useMutation({
    mutationFn: async (matchId: string) => {
      const { data: match, error: fetchError } = await supabase
        .from('bank_reconciliation_matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('bank_reconciliation_matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      await supabase
        .from('bank_transactions')
        .update({ is_matched: false, journal_entry_id: null })
        .eq('id', match.bank_transaction_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank_reconciliation_matches'] });
      toast({
        title: 'تم الإلغاء',
        description: 'تم إلغاء المطابقة بنجاح',
      });
    },
  });

  return {
    rules: rules || [],
    matches: matches || [],
    isLoading: isLoadingRules || isLoadingMatches,
    autoMatch: autoMatch.mutateAsync,
    manualMatch: manualMatch.mutateAsync,
    unmatch: unmatch.mutateAsync,
  };
}
