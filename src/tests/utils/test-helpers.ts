/**
 * Test Helpers - أدوات مساعدة للاختبارات الحقيقية
 * @version 1.0.0
 */

import { vi } from 'vitest';
import React from 'react';

// ==================== Query Client للاختبارات ====================

/**
 * إنشاء Query Client للاختبارات
 */
export const createTestQueryClient = async () => {
  const { QueryClient } = await import('@tanstack/react-query');
  return new QueryClient({
    defaultOptions: {
      queries: { 
        retry: false, 
        staleTime: 0,
        gcTime: 0
      },
      mutations: { retry: false }
    }
  });
};

/**
 * إنشاء Wrapper للـ hooks مع React Query
 */
export const createQueryWrapper = async () => {
  const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// ==================== Mock Supabase ====================

/**
 * إنشاء Mock Supabase للاختبارات
 */
export const createMockSupabase = (tableData: Record<string, any[]> = {}) => ({
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: tableData[table] || [],
        error: null
      }),
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: tableData[table]?.[0] || null,
          error: null
        }),
        maybeSingle: vi.fn().mockResolvedValue({
          data: tableData[table]?.[0] || null,
          error: null
        })
      }),
      limit: vi.fn().mockResolvedValue({
        data: tableData[table]?.slice(0, 10) || [],
        error: null
      }),
      range: vi.fn().mockResolvedValue({
        data: tableData[table] || [],
        error: null,
        count: tableData[table]?.length || 0
      })
    }),
    insert: vi.fn().mockResolvedValue({ 
      data: { id: 'new-id', ...tableData[table]?.[0] }, 
      error: null 
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ 
        data: { id: '1', ...tableData[table]?.[0] }, 
        error: null 
      })
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null })
    }),
    upsert: vi.fn().mockResolvedValue({
      data: tableData[table]?.[0] || null,
      error: null
    })
  })),
  auth: {
    getSession: vi.fn().mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null
    }),
    onAuthStateChange: vi.fn().mockReturnValue({ 
      data: { 
        subscription: { unsubscribe: vi.fn() } 
      } 
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null
    }),
    signOut: vi.fn().mockResolvedValue({ error: null })
  },
  functions: {
    invoke: vi.fn().mockResolvedValue({ 
      data: { success: true }, 
      error: null 
    })
  },
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ 
        data: { path: 'test.txt' }, 
        error: null 
      }),
      download: vi.fn().mockResolvedValue({ 
        data: new Blob(), 
        error: null 
      }),
      getPublicUrl: vi.fn().mockReturnValue({ 
        data: { publicUrl: 'https://example.com/test.txt' } 
      }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null })
    })
  },
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn()
  })
});

/**
 * Mock Supabase مع محاكاة RLS
 */
export const createMockSupabaseWithRLS = (currentUserId: string = 'user-001') => ({
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockImplementation((field: string, value: string) => ({
        single: vi.fn().mockImplementation(async () => {
          // محاكاة RLS - المستخدم يمكنه رؤية بياناته فقط
          if (field === 'user_id' && value === currentUserId) {
            return { data: { id: '1', user_id: currentUserId }, error: null };
          }
          return { 
            data: null, 
            error: { message: 'Row level security policy violation', code: 'PGRST301' } 
          };
        }),
        maybeSingle: vi.fn().mockImplementation(async () => {
          if (field === 'user_id' && value === currentUserId) {
            return { data: { id: '1', user_id: currentUserId }, error: null };
          }
          return { data: null, error: null };
        })
      }))
    })
  })),
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: { 
        session: { 
          user: { id: currentUserId } 
        } 
      },
      error: null
    })
  }
});

// ==================== بيانات اختبار مشتركة ====================

export const mockTestData = {
  beneficiaries: [
    { id: '1', full_name: 'أحمد محمد', status: 'نشط', category: 'أيتام', national_id: '1234567890', phone: '0501234567' },
    { id: '2', full_name: 'سارة علي', status: 'نشط', category: 'أرامل', national_id: '0987654321', phone: '0559876543' }
  ],
  accounts: [
    { id: '1', code: '1000', name_ar: 'الأصول', account_type: 'asset', is_active: true },
    { id: '2', code: '2000', name_ar: 'الخصوم', account_type: 'liability', is_active: true },
    { id: '3', code: '3000', name_ar: 'حقوق الملكية', account_type: 'equity', is_active: true }
  ],
  properties: [
    { id: '1', name: 'عمارة الوقف', status: 'active', type: 'residential', units_count: 10 },
    { id: '2', name: 'مجمع تجاري', status: 'active', type: 'commercial', units_count: 5 }
  ],
  tenants: [
    { id: '1', full_name: 'محمد أحمد', phone: '0501111111', status: 'active' },
    { id: '2', full_name: 'خالد سعيد', phone: '0502222222', status: 'active' }
  ],
  distributions: [
    { id: '1', status: 'approved', total_amount: 50000, beneficiaries_count: 10 },
    { id: '2', status: 'pending', total_amount: 30000, beneficiaries_count: 6 }
  ],
  journal_entries: [
    { id: '1', entry_number: 'JE-001', entry_date: '2024-01-15', description: 'قيد افتتاحي', status: 'approved' }
  ],
  invoices: [
    { id: '1', invoice_number: 'INV-001', total_amount: 10000, status: 'paid' }
  ],
  profiles: [
    { id: '1', user_id: 'user-001', full_name: 'مدير النظام', role: 'admin' }
  ]
};

// ==================== أدوات فحص المكونات ====================

/**
 * تحقق من render المكون بشكل آمن
 */
export async function safeRender(
  component: React.ReactElement,
  options?: { wrapper?: React.ComponentType<{ children: React.ReactNode }> }
) {
  try {
    const { render, screen, waitFor } = await import('@testing-library/react');
    const result = render(component, options);
    return { 
      success: true, 
      result, 
      screen, 
      waitFor,
      error: null 
    };
  } catch (error) {
    return { 
      success: false, 
      result: null, 
      screen: null, 
      waitFor: null,
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * تحقق من Hook بشكل آمن
 */
export async function safeRenderHook<T>(
  hookFn: () => T,
  options?: { wrapper?: React.ComponentType<{ children: React.ReactNode }> }
) {
  try {
    const { renderHook, waitFor } = await import('@testing-library/react');
    const result = renderHook(hookFn, options);
    return { 
      success: true, 
      result, 
      waitFor,
      error: null 
    };
  } catch (error) {
    return { 
      success: false, 
      result: null, 
      waitFor: null,
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ==================== تصنيف الاختبارات ====================

export type TestType = 'real' | 'fake' | 'partial';

export interface EnhancedTestResult {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  testType: TestType;
  realValidation: string;
  details?: string;
  error?: string;
}

/**
 * تحديد نوع الاختبار
 */
export function classifyTest(details?: string): TestType {
  if (!details) return 'fake';
  
  const realIndicators = [
    'render', 'renderHook', 'fetch', 'query', 'mutation',
    'التصديرات', 'تم الاستيراد', 'موجود', 'يعمل', 'استجابة'
  ];
  
  const fakeIndicators = [
    'مُسجَّل', 'مُعرَّف', 'success: true', 'افتراضي'
  ];
  
  const hasReal = realIndicators.some(i => details.includes(i));
  const hasFake = fakeIndicators.some(i => details.includes(i));
  
  if (hasReal && !hasFake) return 'real';
  if (hasFake && !hasReal) return 'fake';
  return 'partial';
}

/**
 * حساب إحصائيات التغطية الحقيقية
 */
export function calculateRealCoverage(tests: EnhancedTestResult[]) {
  const real = tests.filter(t => t.testType === 'real').length;
  const fake = tests.filter(t => t.testType === 'fake').length;
  const partial = tests.filter(t => t.testType === 'partial').length;
  const total = tests.length;
  
  return {
    real,
    fake,
    partial,
    total,
    realPercentage: total > 0 ? Math.round((real / total) * 100) : 0,
    fakePercentage: total > 0 ? Math.round((fake / total) * 100) : 0,
    partialPercentage: total > 0 ? Math.round((partial / total) * 100) : 0
  };
}
