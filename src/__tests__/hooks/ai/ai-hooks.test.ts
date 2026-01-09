/**
 * اختبارات Hooks الذكاء الاصطناعي - مبسطة
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) })),
    functions: { invoke: vi.fn().mockResolvedValue({ data: {}, error: null }) },
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) },
  },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('AI Hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useChatbot returns state and functions', async () => {
    const { useChatbot } = await import('@/hooks/ai/useChatbot');
    const { result } = renderHook(() => useChatbot(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('sendMessage');
  });

  it('useAIInsights returns insights', async () => {
    const { useAIInsights } = await import('@/hooks/ai/useAIInsights');
    const { result } = renderHook(() => useAIInsights(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
  });

  it('useIntelligentSearch returns search functionality', async () => {
    const { useIntelligentSearch } = await import('@/hooks/ai/useIntelligentSearch');
    const { result } = renderHook(() => useIntelligentSearch(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});
