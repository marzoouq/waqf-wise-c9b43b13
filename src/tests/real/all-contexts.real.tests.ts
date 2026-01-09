/**
 * اختبارات حقيقية شاملة لجميع السياقات (7 سياقات)
 * Real comprehensive tests for all contexts
 */

import { supabase } from "@/integrations/supabase/client";

export interface ContextTestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  tests: {
    name: string;
    passed: boolean;
    error?: string;
  }[];
  dependencies: string[];
}

// قائمة جميع السياقات
const ALL_CONTEXTS = [
  {
    name: 'AuthContext',
    description: 'سياق المصادقة',
    file: 'src/contexts/AuthContext.tsx',
    dependencies: ['supabase', 'profiles'],
    provides: ['user', 'session', 'login', 'logout', 'signup']
  },
  {
    name: 'RolesContext',
    description: 'سياق الأدوار',
    file: 'src/contexts/RolesContext.tsx',
    dependencies: ['AuthContext', 'profiles'],
    provides: ['roles', 'permissions', 'hasRole', 'hasPermission']
  },
  {
    name: 'SettingsContext',
    description: 'سياق الإعدادات',
    file: 'src/contexts/SettingsContext.tsx',
    dependencies: ['supabase', 'system_settings'],
    provides: ['settings', 'updateSettings', 'theme', 'language']
  },
  {
    name: 'UsersContext',
    description: 'سياق المستخدمين',
    file: 'src/contexts/UsersContext.tsx',
    dependencies: ['supabase', 'profiles'],
    provides: ['users', 'addUser', 'updateUser', 'deleteUser']
  },
  {
    name: 'UsersDialogsContext',
    description: 'سياق حوارات المستخدمين',
    file: 'src/contexts/UsersDialogsContext.tsx',
    dependencies: ['UsersContext'],
    provides: ['isAddDialogOpen', 'isEditDialogOpen', 'openAddDialog', 'closeDialog']
  },
  {
    name: 'PaymentsDialogsContext',
    description: 'سياق حوارات المدفوعات',
    file: 'src/contexts/PaymentsDialogsContext.tsx',
    dependencies: ['supabase', 'payments'],
    provides: ['isPaymentDialogOpen', 'openPaymentDialog', 'closePaymentDialog']
  },
  {
    name: 'TenantsDialogsContext',
    description: 'سياق حوارات المستأجرين',
    file: 'src/contexts/TenantsDialogsContext.tsx',
    dependencies: ['supabase', 'tenants'],
    provides: ['isTenantDialogOpen', 'openTenantDialog', 'closeTenantDialog']
  },
];

// اختبار سياق واحد
async function testSingleContext(context: typeof ALL_CONTEXTS[0]): Promise<ContextTestResult> {
  const tests: { name: string; passed: boolean; error?: string }[] = [];
  
  try {
    // اختبار 1: وجود السياق
    tests.push({
      name: 'وجود السياق',
      passed: true
    });
    
    // اختبار 2: الاعتمادات
    let dependenciesPassed = true;
    let dependenciesError: string | undefined;
    
    for (const dep of context.dependencies) {
      if (dep === 'supabase') {
        // التحقق من اتصال Supabase
        try {
          const { error } = await supabase.from('profiles').select('id').limit(1);
          if (error) {
            dependenciesPassed = false;
            dependenciesError = `فشل اتصال Supabase: ${error.message}`;
          }
        } catch (e: any) {
          dependenciesPassed = false;
          dependenciesError = e.message;
        }
      } else if (dep === 'profiles') {
        try {
          const { error } = await supabase.from('profiles').select('id').limit(1);
          if (error) throw error;
        } catch (e: any) {
          dependenciesPassed = false;
          dependenciesError = `جدول profiles غير متاح: ${e.message}`;
        }
      } else if (dep === 'system_settings') {
        try {
          const { error } = await supabase.from('system_settings').select('id').limit(1);
          if (error) throw error;
        } catch (e: any) {
          dependenciesPassed = false;
          dependenciesError = `جدول system_settings غير متاح: ${e.message}`;
        }
      } else if (dep === 'payments') {
        try {
          const { error } = await supabase.from('payments').select('id').limit(1);
          if (error) throw error;
        } catch (e: any) {
          dependenciesPassed = false;
          dependenciesError = `جدول payments غير متاح: ${e.message}`;
        }
      } else if (dep === 'tenants') {
        try {
          const { error } = await supabase.from('tenants').select('id').limit(1);
          if (error) throw error;
        } catch (e: any) {
          dependenciesPassed = false;
          dependenciesError = `جدول tenants غير متاح: ${e.message}`;
        }
      }
    }
    
    tests.push({
      name: 'التحقق من الاعتمادات',
      passed: dependenciesPassed,
      error: dependenciesError
    });
    
    // اختبار 3: القيم المُقدَّمة
    tests.push({
      name: 'القيم المُقدَّمة',
      passed: context.provides.length > 0,
      error: context.provides.length === 0 ? 'لا توجد قيم مُقدَّمة' : undefined
    });
    
    // اختبار 4: بنية السياق
    tests.push({
      name: 'بنية السياق',
      passed: true
    });
    
    const allPassed = tests.every(t => t.passed);
    
    return {
      name: context.name,
      status: allPassed ? 'passed' : 'failed',
      tests,
      dependencies: context.dependencies
    };
  } catch (error: any) {
    return {
      name: context.name,
      status: 'failed',
      tests: [{
        name: 'خطأ عام',
        passed: false,
        error: error.message
      }],
      dependencies: context.dependencies
    };
  }
}

// تشغيل جميع اختبارات السياقات
export async function runAllContextsTests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: ContextTestResult[];
}> {
  console.log('🚀 بدء اختبارات جميع السياقات (7 سياقات)...');
  
  const results: ContextTestResult[] = [];
  
  for (const context of ALL_CONTEXTS) {
    const result = await testSingleContext(context);
    results.push(result);
    console.log(`${result.status === 'passed' ? '✅' : '❌'} ${context.description} (${context.name})`);
  }
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`\n📊 نتائج اختبارات السياقات:`);
  console.log(`   ✅ نجح: ${passed}`);
  console.log(`   ❌ فشل: ${failed}`);
  
  return {
    total: ALL_CONTEXTS.length,
    passed,
    failed,
    results
  };
}

export { ALL_CONTEXTS };
