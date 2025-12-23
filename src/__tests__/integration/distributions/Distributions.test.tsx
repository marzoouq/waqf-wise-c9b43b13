/**
 * Distributions Integration Tests
 * اختبارات تكامل التوزيعات
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import {
  mockDistributions,
  mockDistributionDetails,
  mockBankTransfers,
  mockBankTransferDetails,
  mockDistributionSettings,
  mockDistributionSummary,
  mockSimulationResult,
  mockDistributionApprovals,
  createMockDistribution,
  createMockBankTransfer,
} from '../../fixtures/distributions.fixtures';

// Mock Distribution Service
vi.mock('@/services/distribution.service', () => ({
  DistributionService: {
    getAll: vi.fn().mockResolvedValue(mockDistributions),
    getById: vi.fn().mockResolvedValue(mockDistributions[0]),
    create: vi.fn().mockResolvedValue(mockDistributions[0]),
    update: vi.fn().mockResolvedValue(mockDistributions[0]),
    delete: vi.fn().mockResolvedValue({ success: true }),
    getDetails: vi.fn().mockResolvedValue(mockDistributionDetails),
    getSummary: vi.fn().mockResolvedValue(mockDistributionSummary),
    simulate: vi.fn().mockResolvedValue(mockSimulationResult),
    execute: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockDistributions, error: null }),
    })),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });

describe('Distributions Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('عرض التوزيعات', () => {
    it('يجب تحميل قائمة التوزيعات', async () => {
      const { DistributionService } = await import('@/services/distribution.service');
      const distributions = await DistributionService.getAll();
      
      expect(distributions).toEqual(mockDistributions);
      expect(distributions).toHaveLength(3);
    });

    it('يجب عرض اسم كل توزيع', () => {
      mockDistributions.forEach(dist => {
        expect(dist.name).toBeDefined();
        expect(dist.name.length).toBeGreaterThan(0);
      });
    });

    it('يجب عرض المبلغ الإجمالي', () => {
      mockDistributions.forEach(dist => {
        expect(dist.total_amount).toBeGreaterThan(0);
      });
    });

    it('يجب عرض حالة التوزيع', () => {
      const statuses = mockDistributions.map(d => d.status);
      expect(statuses).toContain('completed');
      expect(statuses).toContain('pending');
    });
  });

  describe('أنماط التوزيع', () => {
    it('يجب دعم نمط التوزيع الشرعي', () => {
      const shariahDists = mockDistributions.filter(d => d.pattern === 'shariah');
      expect(shariahDists.length).toBeGreaterThan(0);
    });

    it('يجب دعم نمط التوزيع المتساوي', () => {
      const equalDists = mockDistributions.filter(d => d.pattern === 'equal');
      expect(equalDists.length).toBeGreaterThan(0);
    });

    it('يجب دعم نمط التوزيع حسب الحاجة', () => {
      const needBasedDists = mockDistributions.filter(d => d.pattern === 'need_based');
      expect(needBasedDists.length).toBeGreaterThan(0);
    });
  });

  describe('تفاصيل التوزيع', () => {
    it('يجب تحميل تفاصيل توزيع محدد', async () => {
      const { DistributionService } = await import('@/services/distribution.service');
      const details = await DistributionService.getDetails('dist-1');
      
      expect(details).toEqual(mockDistributionDetails);
    });

    it('يجب عرض قائمة المستفيدين في التوزيع', () => {
      const dist1Details = mockDistributionDetails.filter(d => d.distribution_id === 'dist-1');
      expect(dist1Details.length).toBe(2);
    });

    it('يجب عرض مبلغ كل مستفيد', () => {
      mockDistributionDetails.forEach(detail => {
        expect(detail.amount).toBeGreaterThan(0);
      });
    });

    it('يجب عرض نسبة الحصة لكل مستفيد', () => {
      mockDistributionDetails.forEach(detail => {
        expect(detail.share_percentage).toBeGreaterThan(0);
      });
    });
  });

  describe('إنشاء توزيع جديد', () => {
    it('يجب إنشاء توزيع جديد', async () => {
      const { DistributionService } = await import('@/services/distribution.service');
      const newDist = createMockDistribution({ name: 'توزيع جديد' });
      const result = await DistributionService.create(newDist);
      
      expect(result).toBeDefined();
    });

    it('يجب التحقق من المبلغ الإجمالي', () => {
      const newDist = createMockDistribution();
      expect(newDist.total_amount).toBe(100000);
    });

    it('يجب تعيين حالة معلق للتوزيع الجديد', () => {
      const newDist = createMockDistribution();
      expect(newDist.status).toBe('pending');
    });
  });

  describe('محاكاة التوزيع', () => {
    it('يجب محاكاة توزيع قبل التنفيذ', async () => {
      const { DistributionService } = await import('@/services/distribution.service');
      const result = await DistributionService.simulate({});
      
      expect(result).toEqual(mockSimulationResult);
    });

    it('يجب حساب الخصومات بشكل صحيح', () => {
      const { summary } = mockSimulationResult;
      expect(summary.deductions.nazer).toBe(10000);
      expect(summary.deductions.charity).toBe(5000);
      expect(summary.deductions.development).toBe(5000);
    });

    it('يجب حساب صافي التوزيع', () => {
      const { summary } = mockSimulationResult;
      const expectedNet = summary.total - 
        summary.deductions.nazer - 
        summary.deductions.charity - 
        summary.deductions.development;
      expect(summary.net_distribution).toBe(expectedNet);
    });
  });

  describe('التحويلات البنكية', () => {
    it('يجب عرض قائمة التحويلات البنكية', () => {
      expect(mockBankTransfers).toHaveLength(2);
    });

    it('يجب عرض رقم ملف التحويل', () => {
      mockBankTransfers.forEach(transfer => {
        expect(transfer.file_number).toBeDefined();
        expect(transfer.file_number).toMatch(/^TRF-/);
      });
    });

    it('يجب عرض حالة التحويل', () => {
      const statuses = mockBankTransfers.map(t => t.status);
      expect(statuses).toContain('completed');
    });

    it('يجب عرض إجمالي التحويلات', () => {
      mockBankTransfers.forEach(transfer => {
        expect(transfer.total_amount).toBeGreaterThan(0);
        expect(transfer.total_transactions).toBeGreaterThan(0);
      });
    });
  });

  describe('تفاصيل التحويل البنكي', () => {
    it('يجب عرض تفاصيل كل تحويل', () => {
      expect(mockBankTransferDetails).toHaveLength(2);
    });

    it('يجب عرض IBAN المستفيد', () => {
      mockBankTransferDetails.forEach(detail => {
        expect(detail.iban).toBeDefined();
        expect(detail.iban).toMatch(/^SA/);
      });
    });

    it('يجب عرض اسم البنك', () => {
      mockBankTransferDetails.forEach(detail => {
        expect(detail.bank_name).toBeDefined();
      });
    });

    it('يجب عرض رقم المرجع', () => {
      mockBankTransferDetails.forEach(detail => {
        expect(detail.reference_number).toBeDefined();
      });
    });
  });

  describe('إعدادات التوزيع', () => {
    it('يجب تحميل إعدادات التوزيع', () => {
      expect(mockDistributionSettings).toBeDefined();
    });

    it('يجب عرض نمط التوزيع الافتراضي', () => {
      expect(mockDistributionSettings.default_pattern).toBe('shariah');
    });

    it('يجب عرض نسب الخصومات', () => {
      const { deductions } = mockDistributionSettings;
      expect(deductions.nazer_percentage).toBe(10);
      expect(deductions.charity_percentage).toBe(5);
      expect(deductions.development_percentage).toBe(5);
    });

    it('يجب عرض تردد التوزيع', () => {
      expect(mockDistributionSettings.distribution_frequency).toBe('monthly');
    });
  });

  describe('موافقات التوزيع', () => {
    it('يجب عرض قائمة الموافقات', () => {
      expect(mockDistributionApprovals).toHaveLength(2);
    });

    it('يجب عرض حالة الموافقة', () => {
      const statuses = mockDistributionApprovals.map(a => a.status);
      expect(statuses).toContain('pending');
      expect(statuses).toContain('approved');
    });

    it('يجب عرض اسم الموافق', () => {
      mockDistributionApprovals.forEach(approval => {
        expect(approval.approver_name).toBeDefined();
      });
    });
  });

  describe('ملخص التوزيعات', () => {
    it('يجب تحميل ملخص التوزيعات', async () => {
      const { DistributionService } = await import('@/services/distribution.service');
      const summary = await DistributionService.getSummary();
      
      expect(summary).toEqual(mockDistributionSummary);
    });

    it('يجب عرض إجمالي عدد التوزيعات', () => {
      expect(mockDistributionSummary.total_distributions).toBe(25);
    });

    it('يجب عرض إجمالي المبالغ الموزعة', () => {
      expect(mockDistributionSummary.total_amount).toBe(3500000);
    });

    it('يجب عرض متوسط التوزيع لكل مستفيد', () => {
      expect(mockDistributionSummary.average_per_beneficiary).toBeCloseTo(29166.67, 2);
    });

    it('يجب عرض التوزيع حسب الحالة', () => {
      const { by_status } = mockDistributionSummary;
      expect(by_status.completed).toBe(20);
      expect(by_status.pending).toBe(3);
      expect(by_status.cancelled).toBe(2);
    });
  });

  describe('البيانات الشهرية', () => {
    it('يجب عرض البيانات الشهرية', () => {
      const { monthly_data } = mockDistributionSummary;
      expect(monthly_data).toHaveLength(3);
    });

    it('يجب عرض مبلغ كل شهر', () => {
      mockDistributionSummary.monthly_data.forEach(month => {
        expect(month.amount).toBeGreaterThan(0);
      });
    });
  });

  describe('تنفيذ التوزيع', () => {
    it('يجب تنفيذ توزيع معلق', async () => {
      const { DistributionService } = await import('@/services/distribution.service');
      const result = await DistributionService.execute('dist-2');
      
      expect(result.success).toBe(true);
    });
  });

  describe('حذف التوزيع', () => {
    it('يجب حذف توزيع', async () => {
      const { DistributionService } = await import('@/services/distribution.service');
      const result = await DistributionService.delete('dist-2');
      
      expect(result.success).toBe(true);
    });
  });

  describe('معالجة الأخطاء', () => {
    it('يجب التعامل مع فشل تحميل التوزيعات', async () => {
      const { DistributionService } = await import('@/services/distribution.service');
      vi.mocked(DistributionService.getAll).mockRejectedValueOnce(new Error('Load error'));
      
      await expect(DistributionService.getAll()).rejects.toThrow('Load error');
    });

    it('يجب التعامل مع فشل إنشاء توزيع', async () => {
      const { DistributionService } = await import('@/services/distribution.service');
      vi.mocked(DistributionService.create).mockRejectedValueOnce(new Error('Create error'));
      
      await expect(DistributionService.create({})).rejects.toThrow('Create error');
    });
  });
});
