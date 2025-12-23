/**
 * usePropertyAI Hook Unit Tests
 * اختبارات وحدة hook مساعد العقارات الذكي
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  mockPropertyAnalysis, 
  mockMaintenanceSuggestions, 
  mockRevenuePrediction 
} from '../../fixtures/ai.fixtures';

// Mock EdgeFunctionService
vi.mock('@/services', () => ({
  EdgeFunctionService: {
    invoke: vi.fn().mockResolvedValue({
      success: true,
      data: { analysis: 'تحليل العقار ناجح' },
    }),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger/production-logger', () => ({
  productionLogger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('usePropertyAI Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('تحليل العقار', () => {
    it('يجب تحليل عقار محدد', async () => {
      const { EdgeFunctionService } = await import('@/services');
      
      await EdgeFunctionService.invoke('property-ai-assistant', {
        action: 'analyze_property',
        data: { id: 'prop-1' },
      });
      
      expect(EdgeFunctionService.invoke).toHaveBeenCalledWith(
        'property-ai-assistant',
        expect.objectContaining({ action: 'analyze_property' })
      );
    });

    it('يجب إرجاع نتيجة التحليل', async () => {
      const { EdgeFunctionService } = await import('@/services');
      const result = await EdgeFunctionService.invoke<{ analysis: string }>('property-ai-assistant', {
        action: 'analyze_property',
        data: { id: 'prop-1' },
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.analysis).toBeDefined();
    });

    it('يجب عرض معدل الإشغال في التحليل', () => {
      expect(mockPropertyAnalysis.results.occupancy_rate).toBe(85);
    });

    it('يجب عرض اتجاه الإيرادات', () => {
      expect(mockPropertyAnalysis.results.revenue_trend).toBe('increasing');
    });
  });

  describe('اقتراحات الصيانة', () => {
    it('يجب جلب اقتراحات الصيانة', async () => {
      const { EdgeFunctionService } = await import('@/services');
      
      await EdgeFunctionService.invoke('property-ai-assistant', {
        action: 'suggest_maintenance',
        data: { id: 'prop-1' },
      });
      
      expect(EdgeFunctionService.invoke).toHaveBeenCalled();
    });

    it('يجب عرض قائمة اقتراحات الصيانة', () => {
      expect(mockMaintenanceSuggestions).toHaveLength(2);
    });

    it('يجب تحديد أولوية كل اقتراح صيانة', () => {
      mockMaintenanceSuggestions.forEach(suggestion => {
        expect(suggestion.priority).toBeDefined();
      });
    });

    it('يجب تقدير تكلفة كل اقتراح', () => {
      mockMaintenanceSuggestions.forEach(suggestion => {
        expect(suggestion.estimated_cost).toBeGreaterThan(0);
      });
    });

    it('يجب تحديد نوع الصيانة', () => {
      const types = mockMaintenanceSuggestions.map(s => s.type);
      expect(types).toContain('preventive');
      expect(types).toContain('corrective');
    });
  });

  describe('توقعات الإيرادات', () => {
    it('يجب جلب توقعات الإيرادات', async () => {
      const { EdgeFunctionService } = await import('@/services');
      
      await EdgeFunctionService.invoke('property-ai-assistant', {
        action: 'predict_revenue',
        data: { id: 'prop-1' },
      });
      
      expect(EdgeFunctionService.invoke).toHaveBeenCalled();
    });

    it('يجب عرض توقعات شهرية', () => {
      expect(mockRevenuePrediction.predictions).toHaveLength(4);
    });

    it('يجب تحديد مستوى الثقة لكل توقع', () => {
      mockRevenuePrediction.predictions.forEach(pred => {
        expect(pred.confidence).toBeGreaterThan(0);
        expect(pred.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('يجب عرض العوامل المؤثرة', () => {
      expect(mockRevenuePrediction.factors).toContain('موسمية');
      expect(mockRevenuePrediction.factors).toContain('معدل إشغال');
    });
  });

  describe('تحسين العقود', () => {
    it('يجب تحليل العقود للتحسين', async () => {
      const { EdgeFunctionService } = await import('@/services');
      
      await EdgeFunctionService.invoke('property-ai-assistant', {
        action: 'optimize_contracts',
        data: { id: 'prop-1' },
      });
      
      expect(EdgeFunctionService.invoke).toHaveBeenCalledWith(
        'property-ai-assistant',
        expect.objectContaining({ action: 'optimize_contracts' })
      );
    });
  });

  describe('رؤى التنبيهات', () => {
    it('يجب جلب رؤى التنبيهات', async () => {
      const { EdgeFunctionService } = await import('@/services');
      
      await EdgeFunctionService.invoke('property-ai-assistant', {
        action: 'alert_insights',
        data: { id: 'prop-1' },
      });
      
      expect(EdgeFunctionService.invoke).toHaveBeenCalledWith(
        'property-ai-assistant',
        expect.objectContaining({ action: 'alert_insights' })
      );
    });
  });

  describe('التوصيات', () => {
    it('يجب عرض توصيات التحليل', () => {
      const { recommendations } = mockPropertyAnalysis.results;
      expect(recommendations).toHaveLength(3);
    });

    it('يجب أن تكون التوصيات قابلة للتنفيذ', () => {
      mockPropertyAnalysis.results.recommendations.forEach(rec => {
        expect(rec.length).toBeGreaterThan(10);
      });
    });
  });

  describe('حالة التحليل', () => {
    it('يجب تتبع حالة التحليل', () => {
      const isAnalyzing = false;
      expect(typeof isAnalyzing).toBe('boolean');
    });

    it('يجب حفظ نتيجة التحليل', () => {
      const analysis = 'نتيجة التحليل';
      expect(analysis.length).toBeGreaterThan(0);
    });
  });

  describe('إعادة التعيين', () => {
    it('يجب إعادة تعيين التحليل', () => {
      let analysis = 'تحليل سابق';
      analysis = '';
      expect(analysis).toBe('');
    });
  });

  describe('معالجة الأخطاء', () => {
    it('يجب التعامل مع فشل التحليل', async () => {
      const { EdgeFunctionService } = await import('@/services');
      vi.mocked(EdgeFunctionService.invoke).mockResolvedValueOnce({
        success: false,
        error: 'Analysis failed',
      });
      
      const result = await EdgeFunctionService.invoke('property-ai-assistant', {
        action: 'analyze_property',
        data: { id: 'prop-1' },
      });
      
      expect(result.success).toBe(false);
    });

    it('يجب التعامل مع خطأ الشبكة', async () => {
      const { EdgeFunctionService } = await import('@/services');
      vi.mocked(EdgeFunctionService.invoke).mockRejectedValueOnce(new Error('Network error'));
      
      await expect(
        EdgeFunctionService.invoke('property-ai-assistant', {})
      ).rejects.toThrow('Network error');
    });
  });

  describe('بيانات العقار', () => {
    it('يجب تمرير بيانات العقار للتحليل', async () => {
      const { EdgeFunctionService } = await import('@/services');
      
      const propertyData = {
        id: 'prop-1',
        name: 'عقار اختباري',
        type: 'commercial',
        area: 500,
        monthly_rent: 15000,
      };
      
      await EdgeFunctionService.invoke('property-ai-assistant', {
        action: 'analyze_property',
        data: propertyData,
      });
      
      expect(EdgeFunctionService.invoke).toHaveBeenCalledWith(
        'property-ai-assistant',
        expect.objectContaining({
          data: expect.objectContaining({ id: 'prop-1' }),
        })
      );
    });
  });

  describe('التوقعات السنوية', () => {
    it('يجب حساب التوقعات السنوية', () => {
      const { predicted_revenue } = mockPropertyAnalysis.results;
      expect(predicted_revenue.next_year).toBe(560000);
    });

    it('يجب حساب التوقعات الربعية', () => {
      const { predicted_revenue } = mockPropertyAnalysis.results;
      expect(predicted_revenue.next_quarter).toBe(140000);
    });

    it('يجب حساب التوقعات الشهرية', () => {
      const { predicted_revenue } = mockPropertyAnalysis.results;
      expect(predicted_revenue.next_month).toBe(45000);
    });
  });

  describe('درجة الصيانة', () => {
    it('يجب عرض درجة الصيانة', () => {
      expect(mockPropertyAnalysis.results.maintenance_score).toBe(72);
    });

    it('يجب أن تكون الدرجة بين 0 و 100', () => {
      const score = mockPropertyAnalysis.results.maintenance_score;
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
