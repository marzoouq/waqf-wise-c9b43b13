import { Database } from '@/integrations/supabase/types';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type JournalEntryLine = Database['public']['Tables']['journal_entry_lines']['Row'];

export const mockJournalEntry = (overrides?: Partial<JournalEntry>): JournalEntry => ({
  id: 'test-je-001',
  entry_number: 'JE-2025-001',
  entry_date: '2025-01-15',
  entry_type: 'manual',
  description: 'قيد توزيع شهري',
  status: 'draft',
  fiscal_year_id: 'test-fiscal-year',
  reference_type: 'distribution',
  reference_id: 'test-dist-001',
  created_by: 'test-user',
  posted: false,
  posted_at: null,
  rejection_reason: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

export const mockJournalEntryLine = (
  journalEntryId: string,
  lineNumber: number,
  overrides?: Partial<JournalEntryLine>
): JournalEntryLine => ({
  id: `test-jel-${lineNumber}`,
  journal_entry_id: journalEntryId,
  line_number: lineNumber,
  account_id: 'test-account',
  debit_amount: lineNumber === 1 ? 100000 : 0,
  credit_amount: lineNumber === 2 ? 100000 : 0,
  description: `سطر ${lineNumber}`,
  created_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

export const mockBalancedJournalEntry = (): {
  entry: JournalEntry;
  lines: JournalEntryLine[];
} => {
  const entry = mockJournalEntry();
  const lines = [
    mockJournalEntryLine(entry.id, 1, {
      account_id: 'debit-account',
      debit_amount: 100000,
      credit_amount: 0,
    }),
    mockJournalEntryLine(entry.id, 2, {
      account_id: 'credit-account',
      debit_amount: 0,
      credit_amount: 100000,
    }),
  ];
  return { entry, lines };
};
