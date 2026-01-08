/**
 * Integration Tests - اختبارات التكامل الحقيقية
 * @version 3.0.0
 * اختبارات تكامل حقيقية مع قاعدة البيانات و Edge Functions والتخزين
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
  recommendation?: string;
}

const generateId = () => `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// الجداول الأساسية للفحص
const CORE_TABLES = [
  'profiles',
  'beneficiaries',
  'properties',
  'property_units',
  'tenants',
  'contracts',
  'accounts',
  'journal_entries',
  'distributions',
  'payment_vouchers',
  'notifications',
  'families',
  'user_roles',
];

// العلاقات للفحص
const TABLE_RELATIONS = [
  { parent: 'families', child: 'beneficiaries', foreignKey: 'family_id' },
  { parent: 'properties', child: 'property_units', foreignKey: 'property_id' },
  { parent: 'property_units', child: 'contracts', foreignKey: 'unit_id' },
  { parent: 'accounts', child: 'journal_entry_lines', foreignKey: 'account_id' },
  { parent: 'distributions', child: 'heir_distributions', foreignKey: 'distribution_id' },
];

// Edge Functions للفحص الحقيقي
const EDGE_FUNCTIONS_TO_PING = [
  'chatbot',
  'db-health-check',
  'generate-ai-insights',
  'log-error',
];

/**
 * اختبار الاتصال بقاعدة البيانات
 */
async function testDatabaseConnection(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    // محاولة استعلام بسيط
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      // RLS خطأ يعني الاتصال ناجح
      if (error.message.includes('RLS') || 
          error.code === 'PGRST301' || 
          error.message.includes('permission') ||
          error.message.includes('policy')) {
        return {
          id: generateId(),
          name: 'الاتصال بقاعدة البيانات',
          status: 'passed',
          duration: performance.now() - startTime,
          category: 'integration-database',
          details: 'متصل (محمي بـ RLS)'
        };
      }
      
      return {
        id: generateId(),
        name: 'الاتصال بقاعدة البيانات',
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'integration-database',
        error: error.message
      };
    }
    
    return {
      id: generateId(),
      name: 'الاتصال بقاعدة البيانات',
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'integration-database',
      details: 'متصل بنجاح'
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: 'الاتصال بقاعدة البيانات',
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'integration-database',
      error: error instanceof Error ? error.message : 'فشل الاتصال'
    };
  }
}

/**
 * اختبار وجود جدول
 */
async function testTableExists(tableName: string): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const { error, count } = await (supabase
      .from(tableName as any)
      .select('*', { count: 'exact', head: true }));
    
    if (error) {
      // RLS خطأ يعني الجدول موجود
      if (error.message.includes('RLS') || 
          error.code === 'PGRST301' || 
          error.message.includes('permission')) {
        return {
          id: generateId(),
          name: `جدول ${tableName}`,
          status: 'passed',
          duration: performance.now() - startTime,
          category: 'integration-database',
          details: 'موجود (محمي بـ RLS)'
        };
      }
      
      // الجدول غير موجود
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return {
          id: generateId(),
          name: `جدول ${tableName}`,
          status: 'failed',
          duration: performance.now() - startTime,
          category: 'integration-database',
          error: 'الجدول غير موجود',
          recommendation: `أنشئ الجدول ${tableName} في قاعدة البيانات`
        };
      }
      
      return {
        id: generateId(),
        name: `جدول ${tableName}`,
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'integration-database',
        error: error.message
      };
    }
    
    return {
      id: generateId(),
      name: `جدول ${tableName}`,
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'integration-database',
      details: `موجود (${count ?? 'N/A'} سجل)`
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: `جدول ${tableName}`,
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'integration-database',
      error: error instanceof Error ? error.message : 'خطأ'
    };
  }
}

/**
 * اختبار العلاقة بين جدولين
 */
async function testTableRelation(
  parentTable: string, 
  childTable: string, 
  foreignKey: string
): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    // محاولة استعلام JOIN
    const { error } = await (supabase
      .from(childTable as any)
      .select(`id, ${parentTable}(id)`)
      .limit(1));
    
    if (error) {
      // RLS لا يعني فشل العلاقة
      if (error.message.includes('RLS') || error.message.includes('permission')) {
        return {
          id: generateId(),
          name: `علاقة ${childTable} → ${parentTable}`,
          status: 'passed',
          duration: performance.now() - startTime,
          category: 'integration-database',
          details: 'العلاقة موجودة (محمية بـ RLS)'
        };
      }
      
      // خطأ في العلاقة
      if (error.message.includes('relationship') || error.message.includes('foreign key')) {
        return {
          id: generateId(),
          name: `علاقة ${childTable} → ${parentTable}`,
          status: 'failed',
          duration: performance.now() - startTime,
          category: 'integration-database',
          error: 'العلاقة غير موجودة أو خاطئة',
          recommendation: `أضف Foreign Key على ${foreignKey} في ${childTable}`
        };
      }
      
      return {
        id: generateId(),
        name: `علاقة ${childTable} → ${parentTable}`,
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'integration-database',
        error: error.message.slice(0, 100)
      };
    }
    
    return {
      id: generateId(),
      name: `علاقة ${childTable} → ${parentTable}`,
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'integration-database',
      details: 'العلاقة صحيحة'
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: `علاقة ${childTable} → ${parentTable}`,
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'integration-database',
      error: error instanceof Error ? error.message : 'خطأ'
    };
  }
}

/**
 * اختبار Edge Function حقيقي
 */
async function testEdgeFunctionPing(funcName: string): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const { error } = await supabase.functions.invoke(funcName, {
      body: { testMode: true, ping: true }
    });
    
    const responseTime = performance.now() - startTime;
    
    if (error) {
      // أخطاء المصادقة تعني الوظيفة موجودة
      if (error.message?.includes('401') || 
          error.message?.includes('403') || 
          error.message?.includes('Unauthorized')) {
        return {
          id: generateId(),
          name: `Edge Function: ${funcName}`,
          status: 'passed',
          duration: responseTime,
          category: 'integration-edge',
          details: `موجودة (${Math.round(responseTime)}ms)`
        };
      }
      
      // 404 = غير موجودة
      if (error.message?.includes('404')) {
        return {
          id: generateId(),
          name: `Edge Function: ${funcName}`,
          status: 'failed',
          duration: responseTime,
          category: 'integration-edge',
          error: 'غير موجودة (404)'
        };
      }
      
      return {
        id: generateId(),
        name: `Edge Function: ${funcName}`,
        status: 'failed',
        duration: responseTime,
        category: 'integration-edge',
        error: error.message?.slice(0, 50)
      };
    }
    
    return {
      id: generateId(),
      name: `Edge Function: ${funcName}`,
      status: 'passed',
      duration: responseTime,
      category: 'integration-edge',
      details: `تستجيب (${Math.round(responseTime)}ms)`
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: `Edge Function: ${funcName}`,
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'integration-edge',
      error: error instanceof Error ? error.message.slice(0, 50) : 'خطأ'
    };
  }
}

/**
 * اختبار نظام المصادقة
 */
async function testAuthSystem(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        id: generateId(),
        name: 'نظام المصادقة',
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'integration-auth',
        error: error.message
      };
    }
    
    return {
      id: generateId(),
      name: 'نظام المصادقة',
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'integration-auth',
      details: data.session ? 'مُسجَّل الدخول' : 'غير مُسجَّل (طبيعي)'
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: 'نظام المصادقة',
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'integration-auth',
      error: error instanceof Error ? error.message : 'خطأ'
    };
  }
}

/**
 * اختبار نظام Realtime
 */
async function testRealtimeSystem(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const channel = supabase.channel('integration-test');
    
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
      
      channel.subscribe((status) => {
        clearTimeout(timeout);
        if (status === 'SUBSCRIBED') {
          resolve();
        } else if (status === 'CHANNEL_ERROR') {
          reject(new Error('Channel error'));
        }
      });
    });
    
    await supabase.removeChannel(channel);
    
    return {
      id: generateId(),
      name: 'نظام Realtime',
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'integration-realtime',
      details: 'الاشتراكات تعمل'
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: 'نظام Realtime',
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'integration-realtime',
      error: error instanceof Error ? error.message : 'فشل الاشتراك'
    };
  }
}

/**
 * اختبار نظام Storage
 */
async function testStorageSystem(): Promise<TestResult> {
  const startTime = performance.now();
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      // RLS على Storage
      if (error.message.includes('permission') || error.message.includes('not authorized')) {
        return {
          id: generateId(),
          name: 'نظام Storage',
          status: 'passed',
          duration: performance.now() - startTime,
          category: 'integration-storage',
          details: 'متاح (يتطلب صلاحيات)'
        };
      }
      
      return {
        id: generateId(),
        name: 'نظام Storage',
        status: 'failed',
        duration: performance.now() - startTime,
        category: 'integration-storage',
        error: error.message
      };
    }
    
    return {
      id: generateId(),
      name: 'نظام Storage',
      status: 'passed',
      duration: performance.now() - startTime,
      category: 'integration-storage',
      details: `${data?.length || 0} buckets`
    };
    
  } catch (error) {
    return {
      id: generateId(),
      name: 'نظام Storage',
      status: 'failed',
      duration: performance.now() - startTime,
      category: 'integration-storage',
      error: error instanceof Error ? error.message : 'خطأ'
    };
  }
}

/**
 * تشغيل جميع اختبارات التكامل الحقيقية
 */
export async function runIntegrationTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('🔗 بدء اختبارات التكامل الحقيقية...');
  
  // 1. اختبار الاتصال بقاعدة البيانات
  const dbResult = await testDatabaseConnection();
  results.push(dbResult);
  
  if (dbResult.status === 'failed') {
    console.log('❌ فشل الاتصال بقاعدة البيانات، تخطي باقي اختبارات DB');
  } else {
    // 2. اختبار الجداول الأساسية
    for (const table of CORE_TABLES) {
      const tableResult = await testTableExists(table);
      results.push(tableResult);
    }
    
    // 3. اختبار العلاقات
    for (const relation of TABLE_RELATIONS) {
      const relationResult = await testTableRelation(
        relation.parent,
        relation.child,
        relation.foreignKey
      );
      results.push(relationResult);
    }
  }
  
  // 4. اختبار نظام المصادقة
  const authResult = await testAuthSystem();
  results.push(authResult);
  
  // 5. اختبار نظام Realtime
  const realtimeResult = await testRealtimeSystem();
  results.push(realtimeResult);
  
  // 6. اختبار نظام Storage
  const storageResult = await testStorageSystem();
  results.push(storageResult);
  
  // 7. اختبار Edge Functions
  for (const func of EDGE_FUNCTIONS_TO_PING) {
    const funcResult = await testEdgeFunctionPing(func);
    results.push(funcResult);
    
    // تأخير لتجنب rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // إحصائيات
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  console.log(`✅ اكتمل اختبار التكامل: ${results.length} اختبار (${passed} ناجح، ${failed} فاشل، ${skipped} متجاوز)`);
  
  return results;
}

// للتوافق مع الإصدار السابق
export const allIntegrationTests = [];

export function getIntegrationTestsStats() {
  return {
    total: CORE_TABLES.length + TABLE_RELATIONS.length + EDGE_FUNCTIONS_TO_PING.length + 4,
    categories: {
      database: CORE_TABLES.length + TABLE_RELATIONS.length + 1,
      edge: EDGE_FUNCTIONS_TO_PING.length,
      system: 3
    }
  };
}
