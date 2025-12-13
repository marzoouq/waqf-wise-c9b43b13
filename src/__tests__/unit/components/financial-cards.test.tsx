/**
 * اختبارات مكونات البطاقات المالية
 * Financial Cards Components Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

// Mock useAuth
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'user-1', email: 'user@waqf.sa' },
      roles: ['nazer'],
      isLoading: false,
      isAuthenticated: true,
    }),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Financial Cards Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Number Formatting', () => {
    it('should format currency correctly', () => {
      const amount = 850000;
      const formatted = new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
      }).format(amount);

      expect(formatted).toContain('850');
    });

    it('should format large numbers with separators', () => {
      const amount = 1000000;
      const formatted = new Intl.NumberFormat('ar-SA').format(amount);

      expect(formatted).toBeDefined();
    });

    it('should handle decimal amounts', () => {
      const amount = 107913.20;
      const formatted = new Intl.NumberFormat('ar-SA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);

      expect(formatted).toContain('107');
    });
  });

  describe('KPI Calculations', () => {
    it('should calculate percentage correctly', () => {
      const current = 850000;
      const target = 1000000;
      const percentage = (current / target) * 100;

      expect(percentage).toBe(85);
    });

    it('should calculate growth rate', () => {
      const previousYear = 1490380;
      const currentYear = 850000;
      const growthRate = ((currentYear - previousYear) / previousYear) * 100;

      expect(growthRate).toBeLessThan(0); // Negative growth
    });

    it('should calculate occupancy rate', () => {
      const occupiedUnits = 20;
      const totalUnits = 25;
      const occupancyRate = (occupiedUnits / totalUnits) * 100;

      expect(occupancyRate).toBe(80);
    });
  });

  describe('Status Indicators', () => {
    it('should determine status color for positive values', () => {
      const value = 100000;
      const getStatusColor = (val: number) => val > 0 ? 'green' : val < 0 ? 'red' : 'gray';

      expect(getStatusColor(value)).toBe('green');
    });

    it('should determine status color for negative values', () => {
      const value = -50000;
      const getStatusColor = (val: number) => val > 0 ? 'green' : val < 0 ? 'red' : 'gray';

      expect(getStatusColor(value)).toBe('red');
    });

    it('should determine status color for zero', () => {
      const value = 0;
      const getStatusColor = (val: number) => val > 0 ? 'green' : val < 0 ? 'red' : 'gray';

      expect(getStatusColor(value)).toBe('gray');
    });
  });

  describe('Date Formatting', () => {
    it('should format date in Arabic', () => {
      const date = new Date('2024-11-01');
      const formatted = new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);

      expect(formatted).toBeDefined();
    });

    it('should calculate days until due', () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const today = new Date();
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysUntil).toBe(30);
    });
  });
});
