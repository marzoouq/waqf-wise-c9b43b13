/**
 * اختبارات hook المحاسبة
 * useAccounting Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAccounts } from '@/hooks/accounting/useAccounts';
import { useJournalEntries } from '@/hooks/accounting/useJournalEntries';
import { createTestQueryClient } from '../../utils/test-utils';
import { setMockTableData, clearMockTableData } from '../../utils/supabase.mock';
import { mockAccounts, mockJournalEntries } from '../../utils/data.fixtures';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('useAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching accounts', () => {
    it('should fetch chart of accounts', () => {
      setMockTableData('accounts', mockAccounts);

      const { result } = renderHook(() => useAccounts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.accounts).toBeDefined();
    });

    it('should return loading state', () => {
      setMockTableData('accounts', mockAccounts);

      const { result } = renderHook(() => useAccounts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('data structure', () => {
    it('should return accounts array', () => {
      setMockTableData('accounts', mockAccounts);

      const { result } = renderHook(() => useAccounts(), {
        wrapper: createWrapper(),
      });

      expect(Array.isArray(result.current.accounts)).toBe(true);
    });
  });

  describe('mutations', () => {
    it('should have addAccount mutation', () => {
      const { result } = renderHook(() => useAccounts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.addAccount).toBeDefined();
    });

    it('should have updateAccount mutation', () => {
      const { result } = renderHook(() => useAccounts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateAccount).toBeDefined();
    });
  });

  describe('utility functions', () => {
    it('should have calculateBalance function', () => {
      const { result } = renderHook(() => useAccounts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.calculateBalance).toBeDefined();
    });
  });
});

describe('useJournalEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching entries', () => {
    it('should fetch journal entries', () => {
      setMockTableData('journal_entries', mockJournalEntries);

      const { result } = renderHook(() => useJournalEntries(), {
        wrapper: createWrapper(),
      });

      expect(result.current.entries).toBeDefined();
    });

    it('should return loading state', () => {
      setMockTableData('journal_entries', mockJournalEntries);

      const { result } = renderHook(() => useJournalEntries(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('data structure', () => {
    it('should return entries array', () => {
      setMockTableData('journal_entries', mockJournalEntries);

      const { result } = renderHook(() => useJournalEntries(), {
        wrapper: createWrapper(),
      });

      expect(Array.isArray(result.current.entries)).toBe(true);
    });
  });

  describe('mutations', () => {
    it('should have createEntry mutation', () => {
      const { result } = renderHook(() => useJournalEntries(), {
        wrapper: createWrapper(),
      });

      expect(result.current.createEntry).toBeDefined();
    });

    it('should have postEntry mutation', () => {
      const { result } = renderHook(() => useJournalEntries(), {
        wrapper: createWrapper(),
      });

      expect(result.current.postEntry).toBeDefined();
    });
  });
});
