/**
 * Beneficiaries Integration Tests - اختبارات المستفيدين
 * @phase 3 - Beneficiary Management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import {
  realBeneficiaries,
  mockBeneficiaries,
  beneficiarySessions,
  mockBeneficiarySessions,
  beneficiaryStats,
  getActiveBeneficiaries,
  getBeneficiaryById,
  getBeneficiariesByCategory,
  getOnlineBeneficiaries,
} from '../../fixtures/beneficiaries.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockBeneficiaries, error: null })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockBeneficiaries[0], error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: { id: 'new-ben' }, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockBeneficiaries[0], error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-admin', role: 'admin' } }, 
        error: null 
      })),
    },
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Beneficiaries Data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Beneficiaries Listing', () => {
    it('should have 14 beneficiaries', () => {
      expect(realBeneficiaries).toHaveLength(14);
    });

    it('should have required fields for each beneficiary', () => {
      realBeneficiaries.forEach((ben) => {
        expect(ben).toHaveProperty('id');
        expect(ben).toHaveProperty('full_name');
        expect(ben).toHaveProperty('national_id');
        expect(ben).toHaveProperty('phone');
        expect(ben).toHaveProperty('category');
        expect(ben).toHaveProperty('status');
      });
    });

    it('should have proper gender distribution', () => {
      const males = realBeneficiaries.filter((b) => b.gender === 'ذكر');
      const females = realBeneficiaries.filter((b) => b.gender === 'أنثى');
      
      expect(males.length).toBeGreaterThan(0);
      expect(females.length).toBeGreaterThan(0);
    });

    it('should calculate correct statistics', () => {
      expect(beneficiaryStats.total).toBe(14);
      expect(beneficiaryStats.active).toBe(14);
      expect(beneficiaryStats.totalReceived).toBeGreaterThan(0);
      expect(beneficiaryStats.totalBalance).toBeGreaterThan(0);
    });
  });

  describe('Beneficiary Categories', () => {
    it('should categorize by sons (ابن)', () => {
      const sons = getBeneficiariesByCategory('ابن');
      expect(sons.length).toBe(beneficiaryStats.sons);
    });

    it('should categorize by daughters (بنت)', () => {
      const daughters = getBeneficiariesByCategory('بنت');
      expect(daughters.length).toBe(beneficiaryStats.daughters);
    });

    it('should categorize by wives (زوجة)', () => {
      const wives = getBeneficiariesByCategory('زوجة');
      expect(wives.length).toBe(beneficiaryStats.wives);
    });

    it('should have correct category distribution', () => {
      expect(beneficiaryStats.sons).toBeGreaterThan(0);
      expect(beneficiaryStats.daughters).toBeGreaterThan(0);
      expect(beneficiaryStats.wives).toBeGreaterThan(0);
    });
  });

  describe('Beneficiary Details', () => {
    it('should get beneficiary by ID', () => {
      const ben = getBeneficiaryById('ben-001');
      expect(ben).toBeDefined();
      expect(ben?.full_name).toBe('محمد مرزوق الثبيتي');
    });

    it('should return undefined for non-existent ID', () => {
      const ben = getBeneficiaryById('non-existent');
      expect(ben).toBeUndefined();
    });

    it('should have bank details for beneficiaries with IBAN', () => {
      const benWithIban = realBeneficiaries.find((b) => b.iban);
      expect(benWithIban).toBeDefined();
      expect(benWithIban?.bank_name).toBeDefined();
    });

    it('should track account balance', () => {
      realBeneficiaries.forEach((ben) => {
        expect(ben.account_balance).toBeGreaterThanOrEqual(0);
      });
    });

    it('should track total received', () => {
      realBeneficiaries.forEach((ben) => {
        if (ben.total_received !== undefined) {
          expect(ben.total_received).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Active Beneficiaries', () => {
    it('should get only active beneficiaries', () => {
      const active = getActiveBeneficiaries();
      active.forEach((ben) => {
        expect(ben.status).toBe('نشط');
      });
    });

    it('should have all beneficiaries as active', () => {
      const active = getActiveBeneficiaries();
      expect(active.length).toBe(realBeneficiaries.length);
    });
  });

  describe('Verification Status', () => {
    it('should have verified beneficiaries', () => {
      const verified = realBeneficiaries.filter((b) => b.verification_status === 'موثق');
      expect(verified.length).toBeGreaterThan(0);
    });

    it('should have eligible beneficiaries', () => {
      const eligible = realBeneficiaries.filter((b) => b.eligibility_status === 'مؤهل');
      expect(eligible.length).toBeGreaterThan(0);
    });
  });

  describe('Head of Family', () => {
    it('should identify head of family', () => {
      const headsOfFamily = realBeneficiaries.filter((b) => b.is_head_of_family);
      expect(headsOfFamily.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Beneficiary Sessions', () => {
  describe('Session Tracking', () => {
    it('should have session data', () => {
      expect(beneficiarySessions).toBeDefined();
      expect(Array.isArray(beneficiarySessions)).toBe(true);
    });

    it('should have required session fields', () => {
      beneficiarySessions.forEach((session) => {
        expect(session).toHaveProperty('id');
        expect(session).toHaveProperty('beneficiary_id');
        expect(session).toHaveProperty('is_online');
        expect(session).toHaveProperty('current_page');
      });
    });

    it('should track online status', () => {
      const onlineSessions = beneficiarySessions.filter((s) => s.is_online);
      const offlineSessions = beneficiarySessions.filter((s) => !s.is_online);
      
      expect(onlineSessions.length + offlineSessions.length).toBe(beneficiarySessions.length);
    });

    it('should get online beneficiaries', () => {
      const online = getOnlineBeneficiaries();
      online.forEach((session) => {
        expect(session.is_online).toBe(true);
      });
    });

    it('should track last activity', () => {
      beneficiarySessions.forEach((session) => {
        expect(session.last_activity).toBeDefined();
      });
    });

    it('should track current section', () => {
      beneficiarySessions.forEach((session) => {
        expect(session).toHaveProperty('current_section');
      });
    });
  });
});

describe('Beneficiary Statistics', () => {
  it('should calculate total correctly', () => {
    expect(beneficiaryStats.total).toBe(realBeneficiaries.length);
  });

  it('should calculate sons correctly', () => {
    const actualSons = realBeneficiaries.filter((b) => b.category === 'ابن').length;
    expect(beneficiaryStats.sons).toBe(actualSons);
  });

  it('should calculate daughters correctly', () => {
    const actualDaughters = realBeneficiaries.filter((b) => b.category === 'بنت').length;
    expect(beneficiaryStats.daughters).toBe(actualDaughters);
  });

  it('should calculate wives correctly', () => {
    const actualWives = realBeneficiaries.filter((b) => b.category === 'زوجة').length;
    expect(beneficiaryStats.wives).toBe(actualWives);
  });

  it('should sum total received correctly', () => {
    const actualTotal = realBeneficiaries.reduce((sum, b) => sum + (b.total_received || 0), 0);
    expect(beneficiaryStats.totalReceived).toBe(actualTotal);
  });

  it('should sum total balance correctly', () => {
    const actualBalance = realBeneficiaries.reduce((sum, b) => sum + (b.account_balance || 0), 0);
    expect(beneficiaryStats.totalBalance).toBe(actualBalance);
  });
});

describe('Beneficiary Location', () => {
  it('should have city for all beneficiaries', () => {
    realBeneficiaries.forEach((ben) => {
      expect(ben.city).toBeDefined();
    });
  });

  it('should have tribe for beneficiaries', () => {
    const withTribe = realBeneficiaries.filter((b) => b.tribe);
    expect(withTribe.length).toBeGreaterThan(0);
  });

  it('should have family name for beneficiaries', () => {
    const withFamily = realBeneficiaries.filter((b) => b.family_name);
    expect(withFamily.length).toBeGreaterThan(0);
  });
});
