import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/ui/use-toast';
import { AccountingService } from '@/services';
import type { Json } from '@/integrations/supabase/types';

export interface MatchingConditions {
  amount_tolerance: number;
  date_range_days: number;
  description_keywords?: string[];
}

export interface AccountMappingConfig {
  debit_account: string;
  credit_account: string;
}

export interface BankMatchingRule {
  id: string;
  rule_name: string;
  description?: string;
  conditions: MatchingConditions;
  account_mapping: AccountMappingConfig;
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

interface JournalEntryLine {
  debit_amount: number;
  credit_amount: number;
  accounts?: { account_type: string } | null;
}

interface JournalEntryWithLines {
  id: string;
  entry_date: string;
  description: string | null;
  status: string | null;
  journal_entry_lines: JournalEntryLine[];
}

function parseConditions(data: Json): MatchingConditions {
  const defaultConditions: MatchingConditions = {
    amount_tolerance: 0,
    date_range_days: 7,
  };
  if (!data || typeof data !== 'object' || Array.isArray(data)) return defaultConditions;
  return data as unknown as MatchingConditions;
}

function parseAccountMapping(data: Json): AccountMappingConfig {
  const defaultMapping: AccountMappingConfig = {
    debit_account: '',
    credit_account: '',
  };
  if (!data || typeof data !== 'object' || Array.isArray(data)) return defaultMapping;
  return data as unknown as AccountMappingConfig;
}

export function useBankMatching() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rules, isLoading: isLoadingRules } = useQuery({
    queryKey: ['bank_matching_rules'],
    queryFn: async () => {
      const data = await AccountingService.getBankMatchingRules();
      return data.map(item => ({
        ...item,
        conditions: parseConditions(item.conditions),
        account_mapping: parseAccountMapping(item.account_mapping),
        is_active: item.is_active ?? false,
        match_count: item.match_count ?? 0,
        priority: item.priority ?? 0,
      })) as BankMatchingRule[];
    },
  });

  const { data: matches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ['bank_reconciliation_matches'],
    queryFn: async () => {
      const data = await AccountingService.getBankReconciliationMatches();
      return data as BankReconciliationMatch[];
    },
  });

  const autoMatch = useMutation({
    mutationFn: async ({ statementId }: { statementId: string }) => {
      const transactions = await AccountingService.getUnmatchedBankTransactions(statementId);
      const entries = await AccountingService.getPostedEntriesForMatching();

      const suggestions: MatchSuggestion[] = [];

      for (const tx of transactions || []) {
        for (const entry of (entries || []) as JournalEntryWithLines[]) {
          const entryAmount = Math.abs(
            entry.journal_entry_lines.reduce(
              (sum: number, line: JournalEntryLine) => sum + (line.debit_amount - line.credit_amount),
              0
            )
          );

          let confidence = 0;

          const amountDiff = Math.abs(Math.abs(tx.amount) - entryAmount);
          if (amountDiff === 0) {
            confidence += 0.4;
          } else if (amountDiff <= Math.abs(tx.amount) * 0.01) {
            confidence += 0.3;
          } else if (amountDiff <= Math.abs(tx.amount) * 0.05) {
            confidence += 0.2;
          }

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

          const txDesc = (tx.description || '').toLowerCase();
          const entryDesc = (entry.description || '').toLowerCase();
          
          if (txDesc && entryDesc) {
            const txWords = txDesc.split(' ');
            const commonWords = txWords.filter((word: string) =>
              entryDesc.includes(word)
            );
            const similarity = commonWords.length / Math.max(
              txWords.length,
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

      suggestions.sort((a, b) => b.confidence - a.confidence);

      const autoMatches = suggestions.filter(s => s.confidence >= 0.9);
      
      for (const match of autoMatches) {
        await AccountingService.createBankMatch({
          bank_transaction_id: match.bankTransactionId,
          journal_entry_id: match.journalEntryId,
          match_type: 'auto',
          confidence_score: match.confidence,
        });
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
      return await AccountingService.createBankMatch({
        bank_transaction_id: bankTransactionId,
        journal_entry_id: journalEntryId,
        match_type: 'manual',
        confidence_score: 1.0,
        notes,
      });
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
      await AccountingService.deleteBankMatch(matchId);
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
