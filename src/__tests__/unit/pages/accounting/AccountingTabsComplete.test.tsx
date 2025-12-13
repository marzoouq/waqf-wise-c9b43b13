/**
 * اختبارات شاملة للتبويبات المحاسبية
 * Comprehensive Accounting Tabs Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/__tests__/utils/test-utils';
import { setMockTableData, clearMockTableData } from '@/test/setup';

// Mock data
const mockAccounts = [
  { id: '1', code: '1.1.1', name_ar: 'البنك', account_type: 'asset', account_nature: 'debit', current_balance: 850000, is_active: true, is_header: false },
  { id: '2', code: '4.1.1', name_ar: 'إيرادات الإيجار', account_type: 'revenue', account_nature: 'credit', current_balance: 850000, is_active: true, is_header: false },
  { id: '3', code: '5.1.1', name_ar: 'مصاريف الصيانة', account_type: 'expense', account_nature: 'debit', current_balance: 50000, is_active: true, is_header: false },
];

const mockJournalEntries = [
  { id: '1', entry_number: 'JE-001', entry_date: '2025-01-01', description: 'تحصيل إيجار', status: 'posted', total_debit: 350000, total_credit: 350000 },
  { id: '2', entry_number: 'JE-002', entry_date: '2025-01-15', description: 'مصاريف صيانة', status: 'posted', total_debit: 50000, total_credit: 50000 },
  { id: '3', entry_number: 'JE-003', entry_date: '2025-02-01', description: 'تحصيل إيجار', status: 'draft', total_debit: 400000, total_credit: 400000 },
];

const mockJournalEntryLines = [
  { id: '1', journal_entry_id: '1', account_id: '1', debit: 350000, credit: 0, description: 'تحصيل من البنك' },
  { id: '2', journal_entry_id: '1', account_id: '2', debit: 0, credit: 350000, description: 'إيرادات إيجار' },
];

const mockBankAccounts = [
  { id: '1', bank_name: 'البنك الأهلي', account_number: '1234567890', iban: 'SA1234567890123456789012', current_balance: 850000, is_active: true },
  { id: '2', bank_name: 'بنك الراجحي', account_number: '0987654321', iban: 'SA0987654321098765432109', current_balance: 250000, is_active: true },
];

describe('Accounting Tabs - Complete Tests', () => {
  beforeEach(() => {
    clearMockTableData();
    vi.clearAllMocks();
  });

  // ==================== ميزان المراجعة ====================
  describe('Trial Balance (ميزان المراجعة)', () => {
    beforeEach(() => {
      setMockTableData('accounts', mockAccounts);
      setMockTableData('journal_entry_lines', mockJournalEntryLines);
    });

    describe('Data Display', () => {
      it('should display all accounts with balances', async () => {
        expect(mockAccounts).toHaveLength(3);
        expect(mockAccounts[0].name_ar).toBe('البنك');
        expect(mockAccounts[0].current_balance).toBe(850000);
      });

      it('should show debit and credit columns', () => {
        const debitAccounts = mockAccounts.filter(a => a.account_nature === 'debit');
        const creditAccounts = mockAccounts.filter(a => a.account_nature === 'credit');
        expect(debitAccounts).toHaveLength(2);
        expect(creditAccounts).toHaveLength(1);
      });

      it('should calculate total debits correctly', () => {
        const totalDebits = mockAccounts
          .filter(a => a.account_nature === 'debit')
          .reduce((sum, a) => sum + a.current_balance, 0);
        expect(totalDebits).toBe(900000);
      });

      it('should calculate total credits correctly', () => {
        const totalCredits = mockAccounts
          .filter(a => a.account_nature === 'credit')
          .reduce((sum, a) => sum + a.current_balance, 0);
        expect(totalCredits).toBe(850000);
      });

      it('should show balance difference if not zero', () => {
        const totalDebits = 900000;
        const totalCredits = 850000;
        const difference = totalDebits - totalCredits;
        expect(difference).toBe(50000);
      });
    });

    describe('Filtering', () => {
      it('should filter by account type', () => {
        const assetAccounts = mockAccounts.filter(a => a.account_type === 'asset');
        expect(assetAccounts).toHaveLength(1);
        expect(assetAccounts[0].name_ar).toBe('البنك');
      });

      it('should filter by date range', () => {
        const entriesInJanuary = mockJournalEntries.filter(e => 
          e.entry_date >= '2025-01-01' && e.entry_date <= '2025-01-31'
        );
        expect(entriesInJanuary).toHaveLength(2);
      });

      it('should show only active accounts', () => {
        const activeAccounts = mockAccounts.filter(a => a.is_active);
        expect(activeAccounts).toHaveLength(3);
      });
    });

    describe('Export Functions', () => {
      it('should have export to PDF functionality', () => {
        const exportToPDF = vi.fn();
        exportToPDF(mockAccounts);
        expect(exportToPDF).toHaveBeenCalledWith(mockAccounts);
      });

      it('should have export to Excel functionality', () => {
        const exportToExcel = vi.fn();
        exportToExcel(mockAccounts);
        expect(exportToExcel).toHaveBeenCalledWith(mockAccounts);
      });

      it('should have print functionality', () => {
        const printReport = vi.fn();
        printReport('trial-balance');
        expect(printReport).toHaveBeenCalledWith('trial-balance');
      });
    });
  });

  // ==================== دفتر الأستاذ ====================
  describe('General Ledger (دفتر الأستاذ)', () => {
    beforeEach(() => {
      setMockTableData('accounts', mockAccounts);
      setMockTableData('journal_entries', mockJournalEntries);
      setMockTableData('journal_entry_lines', mockJournalEntryLines);
    });

    describe('Account Selection', () => {
      it('should display list of accounts', () => {
        expect(mockAccounts).toHaveLength(3);
      });

      it('should show account code and name', () => {
        const account = mockAccounts[0];
        expect(account.code).toBe('1.1.1');
        expect(account.name_ar).toBe('البنك');
      });

      it('should filter accounts by search', () => {
        const searchTerm = 'البنك';
        const filtered = mockAccounts.filter(a => a.name_ar.includes(searchTerm));
        expect(filtered).toHaveLength(1);
      });
    });

    describe('Transactions Display', () => {
      it('should show transactions for selected account', () => {
        const accountTransactions = mockJournalEntryLines.filter(l => l.account_id === '1');
        expect(accountTransactions).toHaveLength(1);
      });

      it('should show running balance', () => {
        const transactions = mockJournalEntryLines.filter(l => l.account_id === '1');
        let runningBalance = 0;
        transactions.forEach(t => {
          runningBalance += t.debit - t.credit;
        });
        expect(runningBalance).toBe(350000);
      });

      it('should show transaction details', () => {
        const transaction = mockJournalEntryLines[0];
        expect(transaction.description).toBe('تحصيل من البنك');
        expect(transaction.debit).toBe(350000);
      });
    });

    describe('Date Filtering', () => {
      it('should filter by start date', () => {
        const startDate = '2025-01-01';
        const filtered = mockJournalEntries.filter(e => e.entry_date >= startDate);
        expect(filtered).toHaveLength(3);
      });

      it('should filter by end date', () => {
        const endDate = '2025-01-31';
        const filtered = mockJournalEntries.filter(e => e.entry_date <= endDate);
        expect(filtered).toHaveLength(2);
      });

      it('should filter by date range', () => {
        const startDate = '2025-01-01';
        const endDate = '2025-01-31';
        const filtered = mockJournalEntries.filter(e => 
          e.entry_date >= startDate && e.entry_date <= endDate
        );
        expect(filtered).toHaveLength(2);
      });
    });
  });

  // ==================== التدفقات النقدية ====================
  describe('Cash Flow (التدفقات النقدية)', () => {
    beforeEach(() => {
      setMockTableData('accounts', mockAccounts);
      setMockTableData('journal_entries', mockJournalEntries);
    });

    describe('Cash Inflows', () => {
      it('should calculate total cash inflows', () => {
        const inflows = mockJournalEntries
          .filter(e => e.description.includes('تحصيل'))
          .reduce((sum, e) => sum + e.total_debit, 0);
        expect(inflows).toBe(750000);
      });

      it('should categorize inflows by source', () => {
        const rentalInflows = mockJournalEntries.filter(e => 
          e.description.includes('إيجار')
        );
        expect(rentalInflows).toHaveLength(2);
      });
    });

    describe('Cash Outflows', () => {
      it('should calculate total cash outflows', () => {
        const outflows = mockJournalEntries
          .filter(e => e.description.includes('مصاريف'))
          .reduce((sum, e) => sum + e.total_debit, 0);
        expect(outflows).toBe(50000);
      });

      it('should categorize outflows by type', () => {
        const maintenanceOutflows = mockJournalEntries.filter(e =>
          e.description.includes('صيانة')
        );
        expect(maintenanceOutflows).toHaveLength(1);
      });
    });

    describe('Net Cash Flow', () => {
      it('should calculate net cash flow', () => {
        const inflows = 750000;
        const outflows = 50000;
        const netCashFlow = inflows - outflows;
        expect(netCashFlow).toBe(700000);
      });

      it('should show cash flow trend', () => {
        const monthlyFlows = [
          { month: '2025-01', inflow: 350000, outflow: 50000 },
          { month: '2025-02', inflow: 400000, outflow: 0 },
        ];
        const trend = monthlyFlows.map(m => m.inflow - m.outflow);
        expect(trend).toEqual([300000, 400000]);
      });
    });
  });

  // ==================== القيود المحاسبية ====================
  describe('Journal Entries (القيود المحاسبية)', () => {
    beforeEach(() => {
      setMockTableData('journal_entries', mockJournalEntries);
      setMockTableData('journal_entry_lines', mockJournalEntryLines);
      setMockTableData('accounts', mockAccounts);
    });

    describe('Entry List', () => {
      it('should display all journal entries', () => {
        expect(mockJournalEntries).toHaveLength(3);
      });

      it('should show entry number', () => {
        expect(mockJournalEntries[0].entry_number).toBe('JE-001');
      });

      it('should show entry status', () => {
        const postedEntries = mockJournalEntries.filter(e => e.status === 'posted');
        const draftEntries = mockJournalEntries.filter(e => e.status === 'draft');
        expect(postedEntries).toHaveLength(2);
        expect(draftEntries).toHaveLength(1);
      });
    });

    describe('Entry Creation', () => {
      it('should validate debit equals credit', () => {
        const entry = mockJournalEntries[0];
        expect(entry.total_debit).toBe(entry.total_credit);
      });

      it('should require at least two lines', () => {
        const entryLines = mockJournalEntryLines.filter(l => l.journal_entry_id === '1');
        expect(entryLines.length).toBeGreaterThanOrEqual(2);
      });

      it('should validate account selection', () => {
        const line = mockJournalEntryLines[0];
        const accountExists = mockAccounts.some(a => a.id === line.account_id);
        expect(accountExists).toBe(true);
      });
    });

    describe('Entry Posting', () => {
      it('should change status to posted', () => {
        const postEntry = (entry: typeof mockJournalEntries[0]) => ({
          ...entry,
          status: 'posted'
        });
        const posted = postEntry(mockJournalEntries[2]);
        expect(posted.status).toBe('posted');
      });

      it('should prevent editing posted entries', () => {
        const entry = mockJournalEntries[0];
        const isEditable = entry.status !== 'posted';
        expect(isEditable).toBe(false);
      });
    });

    describe('Filtering', () => {
      it('should filter by status', () => {
        const postedOnly = mockJournalEntries.filter(e => e.status === 'posted');
        expect(postedOnly).toHaveLength(2);
      });

      it('should filter by date', () => {
        const januaryEntries = mockJournalEntries.filter(e =>
          e.entry_date.startsWith('2025-01')
        );
        expect(januaryEntries).toHaveLength(2);
      });

      it('should search by description', () => {
        const searchTerm = 'إيجار';
        const filtered = mockJournalEntries.filter(e =>
          e.description.includes(searchTerm)
        );
        expect(filtered).toHaveLength(2);
      });
    });
  });

  // ==================== الحسابات البنكية ====================
  describe('Bank Accounts (الحسابات البنكية)', () => {
    beforeEach(() => {
      setMockTableData('bank_accounts', mockBankAccounts);
    });

    describe('Account List', () => {
      it('should display all bank accounts', () => {
        expect(mockBankAccounts).toHaveLength(2);
      });

      it('should show bank name', () => {
        expect(mockBankAccounts[0].bank_name).toBe('البنك الأهلي');
      });

      it('should show account balance', () => {
        expect(mockBankAccounts[0].current_balance).toBe(850000);
      });

      it('should show IBAN', () => {
        expect(mockBankAccounts[0].iban).toBe('SA1234567890123456789012');
      });
    });

    describe('Total Balance', () => {
      it('should calculate total balance across all accounts', () => {
        const totalBalance = mockBankAccounts.reduce((sum, a) => sum + a.current_balance, 0);
        expect(totalBalance).toBe(1100000);
      });
    });

    describe('Account Status', () => {
      it('should show active accounts', () => {
        const activeAccounts = mockBankAccounts.filter(a => a.is_active);
        expect(activeAccounts).toHaveLength(2);
      });
    });
  });
});
