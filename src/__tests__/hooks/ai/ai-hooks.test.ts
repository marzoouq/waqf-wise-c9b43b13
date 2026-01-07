/**
 * اختبارات Hooks الذكاء الاصطناعي - مبسطة
 */

import { describe, it, expect } from 'vitest';

describe('AI Hooks', () => {
  it('useChatbot should be importable', async () => {
    const module = await import('@/hooks/ai/useChatbot');
    expect(module.useChatbot).toBeDefined();
  });

  it('useAIInsights should be importable', async () => {
    const module = await import('@/hooks/ai/useAIInsights');
    expect(module.useAIInsights).toBeDefined();
  });

  it('useAISystemAudit should be importable', async () => {
    const module = await import('@/hooks/ai/useAISystemAudit');
    expect(module.useAISystemAudit).toBeDefined();
  });

  it('useIntelligentSearch should be importable', async () => {
    const module = await import('@/hooks/ai/useIntelligentSearch');
    expect(module.useIntelligentSearch).toBeDefined();
  });

  it('usePropertyAI should be importable', async () => {
    const module = await import('@/hooks/ai/usePropertyAI');
    expect(module.usePropertyAI).toBeDefined();
  });
});
