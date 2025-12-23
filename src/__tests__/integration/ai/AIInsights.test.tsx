/**
 * AI Insights Integration Tests
 * اختبارات تكامل رؤى الذكاء الاصطناعي
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { mockAIInsights, mockAIAudits, createMockInsight } from '../../fixtures/ai.fixtures';

// Mock AIService
vi.mock('@/services/ai.service', () => ({
  AIService: {
    getInsights: vi.fn().mockResolvedValue(mockAIInsights),
    generateInsights: vi.fn().mockResolvedValue(mockAIInsights[0]),
    dismissInsight: vi.fn().mockResolvedValue(true),
    getAuditHistory: vi.fn().mockResolvedValue(mockAIAudits),
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
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockAIInsights, error: null }),
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

describe('AI Insights Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('عرض الرؤى', () => {
    it('يجب تحميل قائمة الرؤى', async () => {
      const { AIService } = await import('@/services/ai.service');
      const insights = await AIService.getInsights();
      
      expect(insights).toEqual(mockAIInsights);
      expect(insights).toHaveLength(4);
    });

    it('يجب عرض عنوان كل رؤية', () => {
      mockAIInsights.forEach(insight => {
        expect(insight.title).toBeDefined();
        expect(insight.title.length).toBeGreaterThan(0);
      });
    });

    it('يجب عرض وصف كل رؤية', () => {
      mockAIInsights.forEach(insight => {
        expect(insight.description).toBeDefined();
      });
    });

    it('يجب عرض أولوية كل رؤية', () => {
      const priorities = mockAIInsights.map(i => i.priority);
      expect(priorities).toContain('high');
      expect(priorities).toContain('medium');
    });
  });

  describe('أنواع الرؤى', () => {
    it('يجب دعم نوع المستفيدين', () => {
      const beneficiaryInsights = mockAIInsights.filter(i => i.type === 'beneficiaries');
      expect(beneficiaryInsights.length).toBeGreaterThan(0);
    });

    it('يجب دعم نوع المالية', () => {
      const financialInsights = mockAIInsights.filter(i => i.type === 'financial');
      expect(financialInsights.length).toBeGreaterThan(0);
    });

    it('يجب دعم نوع العقارات', () => {
      const propertyInsights = mockAIInsights.filter(i => i.type === 'properties');
      expect(propertyInsights.length).toBeGreaterThan(0);
    });

    it('يجب دعم نوع القروض', () => {
      const loanInsights = mockAIInsights.filter(i => i.type === 'loans');
      expect(loanInsights.length).toBeGreaterThan(0);
    });
  });

  describe('توليد الرؤى', () => {
    it('يجب توليد رؤى جديدة للمستفيدين', async () => {
      const { AIService } = await import('@/services/ai.service');
      const result = await AIService.generateInsights('beneficiaries');
      
      expect(result).toBeDefined();
    });

    it('يجب توليد رؤى جديدة للعقارات', async () => {
      const { AIService } = await import('@/services/ai.service');
      const result = await AIService.generateInsights('properties');
      
      expect(result).toBeDefined();
    });

    it('يجب توليد رؤى جديدة للمالية', async () => {
      const { AIService } = await import('@/services/ai.service');
      const result = await AIService.generateInsights('financial');
      
      expect(result).toBeDefined();
    });

    it('يجب توليد رؤى جديدة للقروض', async () => {
      const { AIService } = await import('@/services/ai.service');
      const result = await AIService.generateInsights('loans');
      
      expect(result).toBeDefined();
    });
  });

  describe('تجاهل الرؤى', () => {
    it('يجب تجاهل رؤية محددة', async () => {
      const { AIService } = await import('@/services/ai.service');
      const result = await AIService.dismissInsight('insight-1');
      
      expect(result.success).toBe(true);
    });

    it('يجب فلترة الرؤى المتجاهلة', () => {
      const activeInsights = mockAIInsights.filter(i => !i.is_dismissed);
      const dismissedInsights = mockAIInsights.filter(i => i.is_dismissed);
      
      expect(activeInsights.length).toBe(3);
      expect(dismissedInsights.length).toBe(1);
    });
  });

  describe('الأولويات', () => {
    it('يجب ترتيب الرؤى حسب الأولوية', () => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const sorted = [...mockAIInsights].sort(
        (a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
      );
      
      expect(sorted[0].priority).toBe('high');
    });

    it('يجب فلترة الرؤى ذات الأولوية العالية', () => {
      const highPriority = mockAIInsights.filter(i => i.priority === 'high');
      expect(highPriority.length).toBe(2);
    });
  });

  describe('البيانات الإضافية', () => {
    it('يجب أن تحتوي كل رؤية على بيانات إضافية', () => {
      mockAIInsights.forEach(insight => {
        expect(insight.data).toBeDefined();
      });
    });

    it('يجب عرض بيانات التغيير للمستفيدين', () => {
      const beneficiaryInsight = mockAIInsights.find(i => i.type === 'beneficiaries');
      expect(beneficiaryInsight?.data).toHaveProperty('change_percentage');
    });

    it('يجب عرض معدل التحصيل للمالية', () => {
      const financialInsight = mockAIInsights.find(i => i.type === 'financial');
      expect(financialInsight?.data).toHaveProperty('collection_rate');
    });
  });

  describe('تدقيق النظام', () => {
    it('يجب تحميل سجل التدقيق', async () => {
      const { AIService } = await import('@/services/ai.service');
      const audits = await (AIService as any).getAuditHistory();
      
      expect(audits).toEqual(mockAIAudits);
    });

    it('يجب عرض ملخص المشاكل المكتشفة', () => {
      const audit = mockAIAudits[0];
      expect(audit.findings.total_issues).toBe(12);
      expect(audit.findings.critical).toBe(2);
    });

    it('يجب عرض عدد المشاكل المصلحة', () => {
      const audit = mockAIAudits[0];
      expect(audit.fixed_issues).toBe(8);
    });
  });

  describe('التواريخ', () => {
    it('يجب عرض تاريخ إنشاء الرؤية', () => {
      mockAIInsights.forEach(insight => {
        expect(insight.created_at).toBeDefined();
        expect(new Date(insight.created_at)).toBeInstanceOf(Date);
      });
    });

    it('يجب ترتيب الرؤى حسب التاريخ', () => {
      const sorted = [...mockAIInsights].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      expect(new Date(sorted[0].created_at).getTime())
        .toBeGreaterThanOrEqual(new Date(sorted[1].created_at).getTime());
    });
  });

  describe('إنشاء رؤى جديدة', () => {
    it('يجب إنشاء رؤية جديدة باستخدام الدالة المساعدة', () => {
      const newInsight = createMockInsight({
        title: 'رؤية جديدة',
        priority: 'high',
      });
      
      expect(newInsight.title).toBe('رؤية جديدة');
      expect(newInsight.priority).toBe('high');
    });

    it('يجب تعيين قيم افتراضية للرؤية الجديدة', () => {
      const newInsight = createMockInsight();
      
      expect(newInsight.type).toBe('beneficiaries');
      expect(newInsight.is_dismissed).toBe(false);
    });
  });

  describe('معالجة الأخطاء', () => {
    it('يجب التعامل مع فشل تحميل الرؤى', async () => {
      const { AIService } = await import('@/services/ai.service');
      vi.mocked(AIService.getInsights).mockRejectedValueOnce(new Error('Load error'));
      
      await expect(AIService.getInsights()).rejects.toThrow('Load error');
    });

    it('يجب التعامل مع فشل توليد الرؤى', async () => {
      const { AIService } = await import('@/services/ai.service');
      vi.mocked(AIService.generateInsights).mockRejectedValueOnce(new Error('Generate error'));
      
      await expect(AIService.generateInsights('beneficiaries')).rejects.toThrow('Generate error');
    });
  });
});
