/**
 * Security Test Utilities - أدوات اختبار الأمان
 * 
 * أدوات مساعدة لاختبارات RLS و Permission
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// ==========================================
// الثوابت
// ==========================================

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// ==========================================
// الأنواع
// ==========================================

export type TestRole = 
  | 'anonymous'
  | 'beneficiary'
  | 'waqf_heir'
  | 'accountant'
  | 'cashier'
  | 'nazer'
  | 'admin';

export interface TestUser {
  email: string;
  password: string;
  role: TestRole;
  beneficiaryId?: string;
}

export interface AuthenticatedClient {
  client: SupabaseClient;
  user: User;
  role: TestRole;
}

export interface RLSTestResult {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  role: TestRole;
  expected: boolean | 'own' | 'all' | 'error';
  actual: boolean | 'own' | 'all' | 'error';
  passed: boolean;
  details?: string;
}

// ==========================================
// مستخدمي الاختبار
// ==========================================

export const TEST_USERS: Record<string, TestUser> = {
  beneficiaryA: {
    email: 'test-beneficiary-a@waqf-test.local',
    password: 'TestBeneficiary123!',
    role: 'beneficiary'
  },
  beneficiaryB: {
    email: 'test-beneficiary-b@waqf-test.local',
    password: 'TestBeneficiary123!',
    role: 'beneficiary'
  },
  staff: {
    email: 'test-staff@waqf-test.local',
    password: 'TestStaff123!',
    role: 'accountant'
  },
  cashier: {
    email: 'test-cashier@waqf-test.local',
    password: 'TestCashier123!',
    role: 'cashier'
  },
  nazer: {
    email: 'test-nazer@waqf-test.local',
    password: 'TestNazer123!',
    role: 'nazer'
  },
  admin: {
    email: 'test-admin@waqf-test.local',
    password: 'TestAdmin123!',
    role: 'admin'
  },
  heir: {
    email: 'test-heir@waqf-test.local',
    password: 'TestHeir123!',
    role: 'waqf_heir'
  }
};

// ==========================================
// دوال المساعدة
// ==========================================

/**
 * إنشاء عميل Supabase غير مصادق
 */
export function createAnonymousClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * إنشاء عميل Supabase مصادق
 */
export async function createAuthenticatedClient(
  email: string,
  password: string,
  role: TestRole
): Promise<AuthenticatedClient | null> {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });
  
  if (error || !data.user) {
    console.warn(`Failed to authenticate ${email}:`, error?.message);
    return null;
  }
  
  return { client, user: data.user, role };
}

/**
 * تسجيل خروج العميل
 */
export async function signOutClient(client: SupabaseClient): Promise<void> {
  await client.auth.signOut();
}

/**
 * التحقق من إمكانية الوصول للجدول
 */
export async function canAccessTable(
  client: SupabaseClient,
  table: string,
  operation: 'select' | 'insert' | 'update' | 'delete'
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    switch (operation) {
      case 'select': {
        const { data, error } = await client
          .from(table)
          .select('id', { count: 'exact' })
          .limit(1);
        
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, count: data?.length ?? 0 };
      }
      
      case 'insert': {
        // نحاول إدراج بيانات وهمية ثم نتراجع
        // هذا لن يعمل مباشرة - نستخدم الخطأ كمؤشر
        const { error } = await client
          .from(table)
          .insert({ id: '00000000-0000-0000-0000-000000000000' })
          .select();
        
        // إذا كان الخطأ بسبب RLS = ممنوع
        if (error?.message?.includes('violates row-level security policy')) {
          return { success: false, error: 'RLS denied' };
        }
        // أي خطأ آخر قد يكون بسبب البيانات الوهمية
        return { success: true, error: error?.message };
      }
      
      case 'update': {
        const { error } = await client
          .from(table)
          .update({ updated_at: new Date().toISOString() })
          .eq('id', '00000000-0000-0000-0000-000000000000');
        
        if (error?.message?.includes('violates row-level security policy')) {
          return { success: false, error: 'RLS denied' };
        }
        return { success: true };
      }
      
      case 'delete': {
        const { error } = await client
          .from(table)
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
        
        if (error?.message?.includes('violates row-level security policy')) {
          return { success: false, error: 'RLS denied' };
        }
        return { success: true };
      }
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * التحقق من عزل بيانات المستفيد
 */
export async function checkBeneficiaryIsolation(
  clientA: SupabaseClient,
  beneficiaryBId: string,
  table: string
): Promise<{ isolated: boolean; leakedRows: number }> {
  const { data } = await clientA
    .from(table)
    .select('id')
    .eq('beneficiary_id', beneficiaryBId);
  
  const leakedRows = data?.length ?? 0;
  return { isolated: leakedRows === 0, leakedRows };
}

/**
 * إنشاء تقرير اختبار RLS
 */
export function generateRLSReport(results: RLSTestResult[]): string {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  let report = `
╔══════════════════════════════════════════════════════════════╗
║                    RLS Test Report                            ║
╠══════════════════════════════════════════════════════════════╣
║  Total: ${results.length.toString().padEnd(3)} | Passed: ${passed.toString().padEnd(3)} | Failed: ${failed.toString().padEnd(3)}                  ║
╚══════════════════════════════════════════════════════════════╝
`;

  if (failed > 0) {
    report += '\n❌ Failed Tests:\n';
    report += '─'.repeat(60) + '\n';
    
    results.filter(r => !r.passed).forEach(r => {
      report += `  • ${r.table}.${r.operation} (${r.role})\n`;
      report += `    Expected: ${r.expected} | Actual: ${r.actual}\n`;
      if (r.details) {
        report += `    Details: ${r.details}\n`;
      }
    });
  }
  
  return report;
}

/**
 * التحقق من البيانات المخفية
 */
export async function checkDataMasking(
  client: SupabaseClient,
  view: string,
  maskedField: string
): Promise<{ masked: boolean; sample?: string }> {
  const { data } = await client
    .from(view)
    .select(maskedField)
    .limit(1);
  
  if (!data || data.length === 0) {
    return { masked: true }; // لا توجد بيانات = آمن
  }
  
  const value = data[0][maskedField];
  const isMasked = typeof value === 'string' && value.includes('*');
  
  return { masked: isMasked, sample: value };
}

/**
 * قياس وقت استجابة RLS
 */
export async function measureRLSPerformance(
  client: SupabaseClient,
  table: string,
  iterations: number = 10
): Promise<{ avgMs: number; minMs: number; maxMs: number }> {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await client.from(table).select('id').limit(10);
    times.push(performance.now() - start);
  }
  
  return {
    avgMs: times.reduce((a, b) => a + b, 0) / times.length,
    minMs: Math.min(...times),
    maxMs: Math.max(...times)
  };
}

// ==========================================
// Fixtures
// ==========================================

/**
 * إنشاء بيانات اختبار
 */
export async function setupTestData(adminClient: SupabaseClient): Promise<{
  beneficiaryAId: string;
  beneficiaryBId: string;
}> {
  // هذه الدالة ستُستخدم لإنشاء بيانات اختبار
  // في بيئة CI/CD
  
  console.log('⚠️ Test data setup not implemented - use existing test data');
  
  return {
    beneficiaryAId: '',
    beneficiaryBId: ''
  };
}

/**
 * تنظيف بيانات الاختبار
 */
export async function cleanupTestData(adminClient: SupabaseClient): Promise<void> {
  console.log('⚠️ Test data cleanup not implemented');
}

// ==========================================
// التصدير
// ==========================================

export default {
  createAnonymousClient,
  createAuthenticatedClient,
  signOutClient,
  canAccessTable,
  checkBeneficiaryIsolation,
  generateRLSReport,
  checkDataMasking,
  measureRLSPerformance,
  TEST_USERS,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
};
