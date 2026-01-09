/**
 * Real Tests Index - فهرس الاختبارات الحقيقية
 * @version 1.0.0
 */

export { runRealHooksTests } from './hooks.real.tests';
export { runRealComponentsTests } from './components.real.tests';
export { runRealServicesTests } from './services.real.tests';
export { runRealEdgeFunctionsTests } from './edge-functions.real.tests';
export { runRealDatabaseTests } from './database.real.tests';
export { runRealSecurityTests } from './security.real.tests';
export { runRealPerformanceTests } from './performance.real.tests';
export { runRealIntegrationTests } from './integration.real.tests';

export type { RealTestResult } from './hooks.real.tests';

/**
 * تشغيل جميع الاختبارات الحقيقية
 */
export async function runAllRealTests() {
  const { runRealHooksTests } = await import('./hooks.real.tests');
  const { runRealComponentsTests } = await import('./components.real.tests');
  const { runRealServicesTests } = await import('./services.real.tests');
  const { runRealEdgeFunctionsTests } = await import('./edge-functions.real.tests');
  const { runRealDatabaseTests } = await import('./database.real.tests');
  const { runRealSecurityTests } = await import('./security.real.tests');
  const { runRealPerformanceTests } = await import('./performance.real.tests');
  const { runRealIntegrationTests } = await import('./integration.real.tests');
  
  console.log('🚀 بدء تشغيل جميع الاختبارات الحقيقية...');
  
  const results = {
    hooks: await runRealHooksTests(),
    components: await runRealComponentsTests(),
    services: await runRealServicesTests(),
    edgeFunctions: await runRealEdgeFunctionsTests(),
    database: await runRealDatabaseTests(),
    security: await runRealSecurityTests(),
    performance: await runRealPerformanceTests(),
    integration: await runRealIntegrationTests(),
  };
  
  // إجمالي الإحصائيات
  const allResults = Object.values(results).flat();
  const passed = allResults.filter(r => r.status === 'passed').length;
  const failed = allResults.filter(r => r.status === 'failed').length;
  const skipped = allResults.filter(r => r.status === 'skipped').length;
  
  console.log('\n📊 ملخص الاختبارات الحقيقية:');
  console.log(`   ✅ نجح: ${passed}`);
  console.log(`   ❌ فشل: ${failed}`);
  console.log(`   ⏭️ متجاوز: ${skipped}`);
  console.log(`   📋 الإجمالي: ${allResults.length}`);
  
  return results;
}
