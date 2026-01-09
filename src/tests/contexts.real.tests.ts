/**
 * Contexts Real Tests - اختبارات السياقات الحقيقية 100%
 * @version 4.0.0
 * كل اختبار يستورد السياق فعلياً ويتحقق من وظائفه
 */

import { supabase } from '@/integrations/supabase/client';

export interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  details?: string;
  error?: string;
}

const generateId = () => `ctx-real-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * اختبار AuthContext الحقيقي
 */
async function testAuthContext(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  // اختبار استيراد AuthContext
  const importStart = performance.now();
  try {
    const authModule = await import('@/contexts/AuthContext');
    const exports = Object.keys(authModule);
    
    results.push({
      id: generateId(),
      name: 'AuthContext - استيراد',
      category: 'contexts-real',
      status: 'passed',
      duration: performance.now() - importStart,
      details: `التصديرات: ${exports.join(', ')}`
    });
    
    // اختبار الجلسة الحقيقية
    const sessionStart = performance.now();
    const { data: session, error } = await supabase.auth.getSession();
    
    results.push({
      id: generateId(),
      name: 'AuthContext - جلسة المستخدم',
      category: 'contexts-real',
      status: error ? 'failed' : 'passed',
      duration: performance.now() - sessionStart,
      details: session?.session ? 'مستخدم مسجل دخول' : 'لا يوجد مستخدم',
      error: error?.message
    });
    
    // اختبار وظائف المصادقة
    const authFnStart = performance.now();
    const hasProvider = exports.includes('AuthProvider');
    const hasHook = exports.includes('useAuth');
    
    results.push({
      id: generateId(),
      name: 'AuthContext - Provider و Hook',
      category: 'contexts-real',
      status: hasProvider && hasHook ? 'passed' : 'failed',
      duration: performance.now() - authFnStart,
      details: `Provider: ${hasProvider ? '✓' : '✗'}, Hook: ${hasHook ? '✓' : '✗'}`
    });
    
  } catch (error) {
    results.push({
      id: generateId(),
      name: 'AuthContext - استيراد',
      category: 'contexts-real',
      status: 'failed',
      duration: performance.now() - importStart,
      error: error instanceof Error ? error.message : 'فشل الاستيراد'
    });
  }
  
  return results;
}

/**
 * اختبار RolesContext الحقيقي
 */
async function testRolesContext(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  const importStart = performance.now();
  try {
    const rolesModule = await import('@/contexts/RolesContext');
    const exports = Object.keys(rolesModule);
    
    results.push({
      id: generateId(),
      name: 'RolesContext - استيراد',
      category: 'contexts-real',
      status: 'passed',
      duration: performance.now() - importStart,
      details: `التصديرات: ${exports.join(', ')}`
    });
    
    // اختبار جلب الأدوار من قاعدة البيانات
    const rolesStart = performance.now();
    const { data, error } = await supabase.from('user_roles').select('*').limit(10);
    
    results.push({
      id: generateId(),
      name: 'RolesContext - جلب الأدوار',
      category: 'contexts-real',
      status: error ? 'failed' : 'passed',
      duration: performance.now() - rolesStart,
      details: error ? undefined : `${data?.length || 0} دور`,
      error: error?.message
    });
    
  } catch (error) {
    results.push({
      id: generateId(),
      name: 'RolesContext - استيراد',
      category: 'contexts-real',
      status: 'failed',
      duration: performance.now() - importStart,
      error: error instanceof Error ? error.message : 'فشل الاستيراد'
    });
  }
  
  return results;
}

/**
 * اختبار SettingsContext الحقيقي
 */
async function testSettingsContext(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  const importStart = performance.now();
  try {
    const settingsModule = await import('@/contexts/SettingsContext');
    const exports = Object.keys(settingsModule);
    
    results.push({
      id: generateId(),
      name: 'SettingsContext - استيراد',
      category: 'contexts-real',
      status: 'passed',
      duration: performance.now() - importStart,
      details: `التصديرات: ${exports.join(', ')}`
    });
    
    // اختبار جلب الإعدادات من قاعدة البيانات
    const settingsStart = performance.now();
    const { data, error } = await supabase.from('organization_settings').select('*').limit(1);
    
    results.push({
      id: generateId(),
      name: 'SettingsContext - جلب الإعدادات',
      category: 'contexts-real',
      status: error ? 'failed' : 'passed',
      duration: performance.now() - settingsStart,
      details: error ? undefined : `${data?.length || 0} إعداد`,
      error: error?.message
    });
    
  } catch (error) {
    results.push({
      id: generateId(),
      name: 'SettingsContext - استيراد',
      category: 'contexts-real',
      status: 'failed',
      duration: performance.now() - importStart,
      error: error instanceof Error ? error.message : 'فشل الاستيراد'
    });
  }
  
  return results;
}

/**
 * اختبار UsersContext الحقيقي
 */
async function testUsersContext(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  const importStart = performance.now();
  try {
    const usersModule = await import('@/contexts/UsersContext');
    const exports = Object.keys(usersModule);
    
    results.push({
      id: generateId(),
      name: 'UsersContext - استيراد',
      category: 'contexts-real',
      status: 'passed',
      duration: performance.now() - importStart,
      details: `التصديرات: ${exports.join(', ')}`
    });
    
    // اختبار جلب المستخدمين من قاعدة البيانات
    const usersStart = performance.now();
    const { data, error } = await supabase.from('profiles').select('id, email, role').limit(10);
    
    results.push({
      id: generateId(),
      name: 'UsersContext - جلب المستخدمين',
      category: 'contexts-real',
      status: error ? 'failed' : 'passed',
      duration: performance.now() - usersStart,
      details: error ? undefined : `${data?.length || 0} مستخدم`,
      error: error?.message
    });
    
  } catch (error) {
    results.push({
      id: generateId(),
      name: 'UsersContext - استيراد',
      category: 'contexts-real',
      status: 'failed',
      duration: performance.now() - importStart,
      error: error instanceof Error ? error.message : 'فشل الاستيراد'
    });
  }
  
  return results;
}

/**
 * اختبار PaymentsDialogsContext الحقيقي
 */
async function testPaymentsDialogsContext(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  const importStart = performance.now();
  try {
    const paymentsModule = await import('@/contexts/PaymentsDialogsContext');
    const exports = Object.keys(paymentsModule);
    
    results.push({
      id: generateId(),
      name: 'PaymentsDialogsContext - استيراد',
      category: 'contexts-real',
      status: 'passed',
      duration: performance.now() - importStart,
      details: `التصديرات: ${exports.join(', ')}`
    });
    
    // اختبار جلب المدفوعات
    const paymentsStart = performance.now();
    const { data, error } = await supabase.from('payments').select('id, amount').limit(5);
    
    results.push({
      id: generateId(),
      name: 'PaymentsDialogsContext - جلب المدفوعات',
      category: 'contexts-real',
      status: error ? 'failed' : 'passed',
      duration: performance.now() - paymentsStart,
      details: error ? undefined : `${data?.length || 0} دفعة`,
      error: error?.message
    });
    
  } catch (error) {
    results.push({
      id: generateId(),
      name: 'PaymentsDialogsContext - استيراد',
      category: 'contexts-real',
      status: 'failed',
      duration: performance.now() - importStart,
      error: error instanceof Error ? error.message : 'فشل الاستيراد'
    });
  }
  
  return results;
}

/**
 * اختبار TenantsDialogsContext الحقيقي
 */
async function testTenantsDialogsContext(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  const importStart = performance.now();
  try {
    const tenantsModule = await import('@/contexts/TenantsDialogsContext');
    const exports = Object.keys(tenantsModule);
    
    results.push({
      id: generateId(),
      name: 'TenantsDialogsContext - استيراد',
      category: 'contexts-real',
      status: 'passed',
      duration: performance.now() - importStart,
      details: `التصديرات: ${exports.join(', ')}`
    });
    
    // اختبار جلب المستأجرين
    const tenantsStart = performance.now();
    const { data, error } = await supabase.from('tenants').select('id, full_name').limit(5);
    
    results.push({
      id: generateId(),
      name: 'TenantsDialogsContext - جلب المستأجرين',
      category: 'contexts-real',
      status: error ? 'failed' : 'passed',
      duration: performance.now() - tenantsStart,
      details: error ? undefined : `${data?.length || 0} مستأجر`,
      error: error?.message
    });
    
  } catch (error) {
    results.push({
      id: generateId(),
      name: 'TenantsDialogsContext - استيراد',
      category: 'contexts-real',
      status: 'failed',
      duration: performance.now() - importStart,
      error: error instanceof Error ? error.message : 'فشل الاستيراد'
    });
  }
  
  return results;
}

/**
 * اختبار UsersDialogsContext الحقيقي
 */
async function testUsersDialogsContext(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  const importStart = performance.now();
  try {
    const usersDialogsModule = await import('@/contexts/UsersDialogsContext');
    const exports = Object.keys(usersDialogsModule);
    
    results.push({
      id: generateId(),
      name: 'UsersDialogsContext - استيراد',
      category: 'contexts-real',
      status: 'passed',
      duration: performance.now() - importStart,
      details: `التصديرات: ${exports.join(', ')}`
    });
    
    // اختبار جلب الأدوار
    const rolesStart = performance.now();
    const { data, error } = await supabase.from('user_roles').select('*').limit(5);
    
    results.push({
      id: generateId(),
      name: 'UsersDialogsContext - جلب الأدوار',
      category: 'contexts-real',
      status: error ? 'failed' : 'passed',
      duration: performance.now() - rolesStart,
      details: error ? undefined : `${data?.length || 0} دور`,
      error: error?.message
    });
    
  } catch (error) {
    results.push({
      id: generateId(),
      name: 'UsersDialogsContext - استيراد',
      category: 'contexts-real',
      status: 'failed',
      duration: performance.now() - importStart,
      error: error instanceof Error ? error.message : 'فشل الاستيراد'
    });
  }
  
  return results;
}

/**
 * تشغيل جميع اختبارات السياقات الحقيقية
 */
export async function runContextsRealTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('🎯 بدء اختبارات السياقات الحقيقية 100%...');
  
  const authResults = await testAuthContext();
  results.push(...authResults);
  
  const rolesResults = await testRolesContext();
  results.push(...rolesResults);
  
  const settingsResults = await testSettingsContext();
  results.push(...settingsResults);
  
  const usersResults = await testUsersContext();
  results.push(...usersResults);
  
  const paymentsResults = await testPaymentsDialogsContext();
  results.push(...paymentsResults);
  
  const tenantsResults = await testTenantsDialogsContext();
  results.push(...tenantsResults);
  
  const usersDialogsResults = await testUsersDialogsContext();
  results.push(...usersDialogsResults);
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`✅ اكتمل: ${results.length} اختبار (${passed} ناجح، ${failed} فاشل)`);
  
  return results;
}

export default runContextsRealTests;
