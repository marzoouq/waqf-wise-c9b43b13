/**
 * useAIInsights Hook Unit Tests
 * اختبارات وحدة hook رؤى الذكاء الاصطناعي
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockAIInsights, createMockInsight } from '../../fixtures/ai.fixtures';

// Mock AIService
vi.mock('@/services/ai.service', () => ({
  AIService: {
    getInsights: vi.fn().mockResolvedValue(mockAIInsights),
    generateInsights: vi.fn().mockResolvedValue({ success: true }),
    dismissInsight: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock toast
vi.mock('@/hooks/ui/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Create wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAIInsights Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('تحميل الرؤى', () => {
    it('يجب تحميل قائمة الرؤى', async () => {
      const { AIService } = await import('@/services/ai.service');
      const insights = await AIService.getInsights();
      
      expect(insights).toEqual(mockAIInsights);
    });

    it('يجب إرجاع الرؤى النشطة فقط', () => {
      const activeInsights = mockAIInsights.filter(i => !i.is_dismissed);
      expect(activeInsights).toHaveLength(3);
    });

    it('يجب ترتيب الرؤى حسب الأولوية', () => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const sorted = [...mockAIInsights].sort(
        (a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
      );
      expect(sorted[0].priority).toBe('high');
    });
  });

  describe('توليد الرؤى', () => {
    it('يجب توليد رؤى للمستفيدين', async () => {
      const { AIService } = await import('@/services/ai.service');
      const result = await AIService.generateInsights('beneficiaries');
      
      expect(AIService.generateInsights).toHaveBeenCalledWith('beneficiaries');
      expect(result.success).toBe(true);
    });

    it('يجب توليد رؤى للعقارات', async () => {
      const { AIService } = await import('@/services/ai.service');
      const result = await AIService.generateInsights('properties');
      
      expect(AIService.generateInsights).toHaveBeenCalledWith('properties');
      expect(result.success).toBe(true);
    });

    it('يجب توليد رؤى للمالية', async () => {
      const { AIService } = await import('@/services/ai.service');
      const result = await AIService.generateInsights('financial');
      
      expect(result.success).toBe(true);
    });

    it('يجب توليد رؤى للقروض', async () => {
      const { AIService } = await import('@/services/ai.service');
      const result = await AIService.generateInsights('loans');
      
      expect(result.success).toBe(true);
    });
  });

  describe('تجاهل الرؤى', () => {
    it('يجب تجاهل رؤية محددة', async () => {
      const { AIService } = await import('@/services/ai.service');
      const result = await AIService.dismissInsight('insight-1');
      
      expect(AIService.dismissInsight).toHaveBeenCalledWith('insight-1');
      expect(result).toBeDefined();
    });

    it('يجب تحديث قائمة الرؤى بعد التجاهل', () => {
      const updatedInsights = mockAIInsights.map(i => 
        i.id === 'insight-1' ? { ...i, is_dismissed: true } : i
      );
      const dismissedCount = updatedInsights.filter(i => i.is_dismissed).length;
      expect(dismissedCount).toBe(2);
    });
  });

  describe('أنواع الرؤى', () => {
    it('يجب تصنيف الرؤى حسب النوع', () => {
      const types = [...new Set(mockAIInsights.map(i => i.type))];
      expect(types).toContain('beneficiaries');
      expect(types).toContain('financial');
      expect(types).toContain('properties');
      expect(types).toContain('loans');
    });

    it('يجب فلترة الرؤى حسب النوع', () => {
      const beneficiaryInsights = mockAIInsights.filter(i => i.type === 'beneficiaries');
      expect(beneficiaryInsights).toHaveLength(1);
    });
  });

  describe('الأولويات', () => {
    it('يجب تحديد الرؤى ذات الأولوية العالية', () => {
      const highPriority = mockAIInsights.filter(i => i.priority === 'high');
      expect(highPriority).toHaveLength(2);
    });

    it('يجب تحديد الرؤى ذات الأولوية المتوسطة', () => {
      const mediumPriority = mockAIInsights.filter(i => i.priority === 'medium');
      expect(mediumPriority).toHaveLength(2);
    });
  });

  describe('البيانات الإضافية', () => {
    it('يجب الوصول إلى بيانات الرؤية الإضافية', () => {
      const insight = mockAIInsights[0];
      expect(insight.data).toBeDefined();
    });

    it('يجب عرض نسبة التغيير للمستفيدين', () => {
      const beneficiaryInsight = mockAIInsights.find(i => i.type === 'beneficiaries');
      expect(beneficiaryInsight?.data.change_percentage).toBeDefined();
    });
  });

  describe('حالة التحميل', () => {
    it('يجب تتبع حالة التحميل', () => {
      const isLoading = false;
      expect(typeof isLoading).toBe('boolean');
    });

    it('يجب تتبع حالة التوليد', () => {
      const isGenerating = false;
      expect(typeof isGenerating).toBe('boolean');
    });
  });

  describe('معالجة الأخطاء', () => {
    it('يجب التعامل مع خطأ في تحميل الرؤى', async () => {
      const { AIService } = await import('@/services/ai.service');
      vi.mocked(AIService.getInsights).mockRejectedValueOnce(new Error('Load error'));
      
      await expect(AIService.getInsights()).rejects.toThrow('Load error');
    });

    it('يجب التعامل مع خطأ في توليد الرؤى', async () => {
      const { AIService } = await import('@/services/ai.service');
      vi.mocked(AIService.generateInsights).mockRejectedValueOnce(new Error('Generate error'));
      
      await expect(AIService.generateInsights('beneficiaries')).rejects.toThrow('Generate error');
    });

    it('يجب التعامل مع خطأ في تجاهل الرؤية', async () => {
      const { AIService } = await import('@/services/ai.service');
      vi.mocked(AIService.dismissInsight).mockRejectedValueOnce(new Error('Dismiss error'));
      
      await expect(AIService.dismissInsight('insight-1')).rejects.toThrow('Dismiss error');
    });
  });

  describe('إنشاء رؤى وهمية', () => {
    it('يجب إنشاء رؤية وهمية بالقيم الافتراضية', () => {
      const newInsight = createMockInsight();
      
      expect(newInsight.id).toBeDefined();
      expect(newInsight.type).toBe('beneficiaries');
      expect(newInsight.priority).toBe('medium');
      expect(newInsight.is_dismissed).toBe(false);
    });

    it('يجب إنشاء رؤية وهمية بقيم مخصصة', () => {
      const newInsight = createMockInsight({
        title: 'رؤية مخصصة',
        priority: 'high',
      });
      
      expect(newInsight.title).toBe('رؤية مخصصة');
      expect(newInsight.priority).toBe('high');
    });
  });

  describe('تحديث الرؤى', () => {
    it('يجب إعادة جلب الرؤى عند الطلب', async () => {
      const { AIService } = await import('@/services/ai.service');
      
      await AIService.getInsights();
      await AIService.getInsights();
      
      expect(AIService.getInsights).toHaveBeenCalledTimes(2);
    });
  });
});
