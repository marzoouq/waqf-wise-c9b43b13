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
      expect(result).toBeDefined();
    });
  });

  describe('getAccountById', () => {
    it('should fetch account by ID', async () => {
      const testAccount = mockAccounts[0];
      setMockTableData('accounts', [testAccount]);

      const result = await AccountingService.getAccountById(testAccount.id);
      
      expect(result).toBeDefined();
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

      const result = await AccountingService.getIncomeStatement();
      
      expect(result).toBeDefined();
    });
  });

  describe('getBalanceSheet', () => {
    it('should generate balance sheet', async () => {
      setMockTableData('accounts', mockAccounts);

      const result = await AccountingService.getBalanceSheet();
      
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
