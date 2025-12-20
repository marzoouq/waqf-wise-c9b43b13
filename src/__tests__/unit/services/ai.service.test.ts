/**
 * اختبارات خدمة الذكاء الاصطناعي
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIService } from '@/services/ai.service';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    },
  },
}));

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInsights', () => {
    it('should fetch insights from smart_alerts table', async () => {
      const mockInsights = [
        {
          id: '1',
          title: 'رؤية 1',
          description: 'وصف الرؤية',
          alert_type: 'info',
          severity: 'low',
          data: {},
          created_at: '2024-01-15',
          is_dismissed: false,
        },
      ];

      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: mockInsights, error: null })),
          })),
        })),
      }));

      (supabase.from as any) = mockFrom;

      const result = await AIService.getInsights();

      expect(mockFrom).toHaveBeenCalledWith('smart_alerts');
      expect(result).toEqual(mockInsights);
    });

    it('should throw error when fetch fails', async () => {
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve({ data: null, error: new Error('Database error') })
            ),
          })),
        })),
      }));

      (supabase.from as any) = mockFrom;

      await expect(AIService.getInsights()).rejects.toThrow();
    });

    it('should return empty array when no insights', async () => {
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      }));

      (supabase.from as any) = mockFrom;

      const result = await AIService.getInsights();
      expect(result).toEqual([]);
    });
  });

  describe('generateInsights', () => {
    it('should invoke edge function with correct report type', async () => {
      const mockInvoke = vi.fn(() =>
        Promise.resolve({ data: { success: true }, error: null })
      );
      (supabase.functions.invoke as any) = mockInvoke;

      await AIService.generateInsights('beneficiaries');

      expect(mockInvoke).toHaveBeenCalledWith('generate-ai-insights', {
        body: { reportType: 'beneficiaries' },
      });
    });

    it('should support all report types', async () => {
      const mockInvoke = vi.fn(() =>
        Promise.resolve({ data: { success: true }, error: null })
      );
      (supabase.functions.invoke as any) = mockInvoke;

      const reportTypes = ['beneficiaries', 'properties', 'financial', 'loans'] as const;

      for (const type of reportTypes) {
        await AIService.generateInsights(type);
        expect(mockInvoke).toHaveBeenCalledWith('generate-ai-insights', {
          body: { reportType: type },
        });
      }
    });

    it('should throw error when edge function fails', async () => {
      const mockInvoke = vi.fn(() =>
        Promise.resolve({ data: null, error: new Error('Function error') })
      );
      (supabase.functions.invoke as any) = mockInvoke;

      await expect(AIService.generateInsights('beneficiaries')).rejects.toThrow();
    });
  });

  describe('dismissInsight', () => {
    it('should update insight to dismissed', async () => {
      const mockEq = vi.fn(() => Promise.resolve({ error: null }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ update: mockUpdate }));

      (supabase.from as any) = mockFrom;

      await AIService.dismissInsight('insight-123');

      expect(mockFrom).toHaveBeenCalledWith('smart_alerts');
      expect(mockUpdate).toHaveBeenCalledWith({ is_dismissed: true });
      expect(mockEq).toHaveBeenCalledWith('id', 'insight-123');
    });

    it('should throw error when update fails', async () => {
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: new Error('Update error') })),
        })),
      }));

      (supabase.from as any) = mockFrom;

      await expect(AIService.dismissInsight('insight-123')).rejects.toThrow();
    });
  });
});
