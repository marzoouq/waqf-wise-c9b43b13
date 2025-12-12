/**
 * اختبارات خدمة المحاسبة
 * Accounting Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountingService } from '@/services/accounting.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';
import { mockAccounts, mockJournalEntries } from '../../utils/data.fixtures';

describe('AccountingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAccounts', () => {
    it('should fetch all accounts', async () => {
      setMockTableData('accounts', mockAccounts);

      const result = await AccountingService.getAccounts();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('accounts');
      expect(result).toHaveLength(mockAccounts.length);
    });
  });

  describe('getAccountById', () => {
    it('should fetch account by ID', async () => {
      const testAccount = mockAccounts[0];
      setMockTableData('accounts', [testAccount]);

      const result = await AccountingService.getAccountById(testAccount.id);
      
      expect(result?.id).toBe(testAccount.id);
    });
  });

  describe('createAccount', () => {
    it('should create new account', async () => {
      const newAccount = {
        code: '1.1.5',
        name_ar: 'حساب جديد',
        account_type: 'asset' as const,
        account_nature: 'debit' as const,
        is_header: false,
        is_active: true,
      };

      setMockTableData('accounts', [{ id: 'new-id', ...newAccount }]);

      const result = await AccountingService.createAccount(newAccount);
      
      expect(result).toBeDefined();
    });
  });

  describe('getJournalEntries', () => {
    it('should fetch all journal entries', async () => {
      setMockTableData('journal_entries', mockJournalEntries);

      const result = await AccountingService.getJournalEntries();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('journal_entries');
      expect(result).toHaveLength(mockJournalEntries.length);
    });
  });

  describe('createJournalEntry', () => {
    it('should create journal entry', async () => {
      const newEntry = {
        entry_date: '2024-01-15',
        description: 'قيد جديد',
        lines: [
          { account_id: 'acc-1', debit: 1000, credit: 0 },
          { account_id: 'acc-2', debit: 0, credit: 1000 },
        ],
      };

      setMockTableData('journal_entries', [{ id: 'new-entry', ...newEntry }]);

      const result = await AccountingService.createJournalEntry(newEntry);
      
      expect(result).toBeDefined();
    });
  });

  describe('getTrialBalance', () => {
    it('should calculate trial balance', async () => {
      setMockTableData('accounts', mockAccounts);

      const result = await AccountingService.getTrialBalance();
      
      expect(result).toBeDefined();
    });
  });

  describe('getIncomeStatement', () => {
    it('should generate income statement', async () => {
      setMockTableData('accounts', mockAccounts);

      const result = await AccountingService.getIncomeStatement('2024-01-01', '2024-12-31');
      
      expect(result).toBeDefined();
    });
  });

  describe('getBalanceSheet', () => {
    it('should generate balance sheet', async () => {
      setMockTableData('accounts', mockAccounts);

      const result = await AccountingService.getBalanceSheet('2024-12-31');
      
      expect(result).toBeDefined();
    });
  });

  describe('postJournalEntry', () => {
    it('should post entry', async () => {
      const entryId = mockJournalEntries[0].id;
      setMockTableData('journal_entries', mockJournalEntries);

      await AccountingService.postJournalEntry(entryId, 'user-1');
      
      expect(mockSupabase.from).toHaveBeenCalledWith('journal_entries');
    });
  });
});
