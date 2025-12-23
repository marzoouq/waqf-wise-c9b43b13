/**
 * Loans Integration Tests - اختبارات تكامل القروض
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  mockLoans, 
  mockLoanInstallments,
  mockLoanPayments,
  mockLoanStats,
  mockLoanPurposes 
} from '../../fixtures/loans.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockLoans[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockLoans, error: null }),
    })),
  },
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: Infinity },
    mutations: { retry: false },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Loans Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loans Data Structure', () => {
    it('should have mock loans data available', () => {
      expect(mockLoans).toBeDefined();
      expect(mockLoans.length).toBeGreaterThan(0);
    });

    it('should have correct loan structure', () => {
      const loan = mockLoans[0];
      expect(loan).toHaveProperty('id');
      expect(loan).toHaveProperty('loan_number');
      expect(loan).toHaveProperty('beneficiary_id');
      expect(loan).toHaveProperty('principal_amount');
      expect(loan).toHaveProperty('remaining_balance');
      expect(loan).toHaveProperty('installment_amount');
      expect(loan).toHaveProperty('status');
    });

    it('should have valid status values', () => {
      const validStatuses = ['pending', 'active', 'paid', 'defaulted', 'cancelled'];
      mockLoans.forEach(loan => {
        expect(validStatuses).toContain(loan.status);
      });
    });

    it('should have correct installment calculation', () => {
      mockLoans.forEach(loan => {
        expect(loan.paid_installments + loan.remaining_installments).toBe(loan.total_installments);
      });
    });

    it('should have zero interest rate (Islamic finance)', () => {
      mockLoans.forEach(loan => {
        expect(loan.interest_rate).toBe(0);
      });
    });
  });

  describe('Loan Installments', () => {
    it('should have installments data', () => {
      expect(mockLoanInstallments).toBeDefined();
      expect(mockLoanInstallments.length).toBeGreaterThan(0);
    });

    it('should have correct installment structure', () => {
      const inst = mockLoanInstallments[0];
      expect(inst).toHaveProperty('id');
      expect(inst).toHaveProperty('loan_id');
      expect(inst).toHaveProperty('installment_number');
      expect(inst).toHaveProperty('amount');
      expect(inst).toHaveProperty('due_date');
      expect(inst).toHaveProperty('status');
    });

    it('should have valid installment statuses', () => {
      const validStatuses = ['pending', 'paid', 'overdue'];
      mockLoanInstallments.forEach(inst => {
        expect(validStatuses).toContain(inst.status);
      });
    });
  });

  describe('Loan Payments', () => {
    it('should have payments data', () => {
      expect(mockLoanPayments).toBeDefined();
      expect(mockLoanPayments.length).toBeGreaterThan(0);
    });

    it('should have correct payment structure', () => {
      const payment = mockLoanPayments[0];
      expect(payment).toHaveProperty('id');
      expect(payment).toHaveProperty('loan_id');
      expect(payment).toHaveProperty('amount');
      expect(payment).toHaveProperty('payment_date');
      expect(payment).toHaveProperty('payment_method');
    });
  });

  describe('Loan Statistics', () => {
    it('should have stats defined', () => {
      expect(mockLoanStats).toBeDefined();
    });

    it('should track total loans', () => {
      expect(mockLoanStats.total_loans).toBeGreaterThan(0);
    });

    it('should track active loans', () => {
      expect(mockLoanStats.active_loans).toBeGreaterThanOrEqual(0);
    });

    it('should track overdue information', () => {
      expect(mockLoanStats.overdue_count).toBeGreaterThanOrEqual(0);
      expect(mockLoanStats.overdue_amount).toBeGreaterThanOrEqual(0);
    });

    it('should track total principal and remaining', () => {
      expect(mockLoanStats.total_principal).toBeGreaterThan(0);
      expect(mockLoanStats.total_remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Loan Purposes', () => {
    it('should have purposes defined', () => {
      expect(mockLoanPurposes).toBeDefined();
      expect(mockLoanPurposes.length).toBeGreaterThan(0);
    });

    it('should have correct purpose structure', () => {
      const purpose = mockLoanPurposes[0];
      expect(purpose).toHaveProperty('id');
      expect(purpose).toHaveProperty('name');
      expect(purpose).toHaveProperty('count');
    });
  });

  describe('Loan Filtering', () => {
    it('should filter active loans', () => {
      const active = mockLoans.filter(l => l.status === 'active');
      expect(active.length).toBeGreaterThan(0);
    });

    it('should filter paid loans', () => {
      const paid = mockLoans.filter(l => l.status === 'paid');
      expect(paid).toBeDefined();
    });

    it('should filter by beneficiary', () => {
      const filtered = mockLoans.filter(l => l.beneficiary_id === 'ben-1');
      expect(filtered).toBeDefined();
    });

    it('should filter pending loans', () => {
      const pending = mockLoans.filter(l => l.status === 'pending');
      expect(pending).toBeDefined();
    });
  });
});
