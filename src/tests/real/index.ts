/**
 * Real Tests Index - فهرس الاختبارات الحقيقية الشاملة
 * @version 2.0.0
 * 
 * تغطية 100% للمستودع:
 * - 83 صفحة
 * - 200+ hook
 * - 60+ خدمة
 * - 53 Edge Function
 * - 80+ مسار
 * - 7 سياقات
 * - 500+ مكون
 * - 42 مكتبة
 */

// الاختبارات الأساسية الموجودة
export { runRealHooksTests } from './hooks.real.tests';
export { runRealComponentsTests } from './components.real.tests';
export { runRealServicesTests } from './services.real.tests';
export { runRealEdgeFunctionsTests } from './edge-functions.real.tests';
export { runRealDatabaseTests } from './database.real.tests';
export { runRealSecurityTests } from './security.real.tests';
export { runRealPerformanceTests } from './performance.real.tests';
export { runRealIntegrationTests } from './integration.real.tests';

// الاختبارات الشاملة الجديدة (تغطية 100%)
export { runAllPagesTests } from './all-pages.real.tests';
export { runAllHooksTests } from './all-hooks.real.tests';
export { runAllServicesTests } from './all-services.real.tests';
export { runAllEdgeFunctionsTests } from './all-edge-functions.real.tests';
export { runAllRoutesTests } from './all-routes.real.tests';
export { runAllContextsTests } from './all-contexts.real.tests';
export { runAllComponentsTests } from './all-components.real.tests';
export { runAllLibrariesTests } from './all-libraries.real.tests';

export type { RealTestResult } from './hooks.real.tests';
export type { PageTestResult } from './all-pages.real.tests';
export type { HookTestResult } from './all-hooks.real.tests';
export type { ServiceTestResult } from './all-services.real.tests';
export type { EdgeFunctionTestResult } from './all-edge-functions.real.tests';
export type { RouteTestResult } from './all-routes.real.tests';
export type { ContextTestResult } from './all-contexts.real.tests';
export type { ComponentTestResult } from './all-components.real.tests';
export type { LibraryTestResult } from './all-libraries.real.tests';

/**
 * تشغيل جميع الاختبارات الحقيقية الشاملة (100%)
 */
export async function runAllRealTests() {
  console.log('🚀 بدء تشغيل جميع الاختبارات الحقيقية الشاملة...');
  console.log('📊 التغطية المستهدفة: 100%\n');
  
  const startTime = Date.now();
  
  // تحميل جميع وحدات الاختبار
  const [
    { runRealHooksTests },
    { runRealComponentsTests },
    { runRealServicesTests },
    { runRealEdgeFunctionsTests },
    { runRealDatabaseTests },
    { runRealSecurityTests },
    { runRealPerformanceTests },
    { runRealIntegrationTests },
    { runAllPagesTests },
    { runAllHooksTests },
    { runAllServicesTests },
    { runAllEdgeFunctionsTests },
    { runAllRoutesTests },
    { runAllContextsTests },
    { runAllComponentsTests },
    { runAllLibrariesTests },
  ] = await Promise.all([
    import('./hooks.real.tests'),
    import('./components.real.tests'),
    import('./services.real.tests'),
    import('./edge-functions.real.tests'),
    import('./database.real.tests'),
    import('./security.real.tests'),
    import('./performance.real.tests'),
    import('./integration.real.tests'),
    import('./all-pages.real.tests'),
    import('./all-hooks.real.tests'),
    import('./all-services.real.tests'),
    import('./all-edge-functions.real.tests'),
    import('./all-routes.real.tests'),
    import('./all-contexts.real.tests'),
    import('./all-components.real.tests'),
    import('./all-libraries.real.tests'),
  ]);
  
  // تشغيل الاختبارات الأساسية
  console.log('📦 تشغيل الاختبارات الأساسية...');
  const basicResults = {
    hooks: await runRealHooksTests(),
    components: await runRealComponentsTests(),
    services: await runRealServicesTests(),
    edgeFunctions: await runRealEdgeFunctionsTests(),
    database: await runRealDatabaseTests(),
    security: await runRealSecurityTests(),
    performance: await runRealPerformanceTests(),
    integration: await runRealIntegrationTests(),
  };
  
  // تشغيل الاختبارات الشاملة
  console.log('\n📦 تشغيل الاختبارات الشاملة (100% تغطية)...');
  const comprehensiveResults = {
    allPages: await runAllPagesTests(),
    allHooks: await runAllHooksTests(),
    allServices: await runAllServicesTests(),
    allEdgeFunctions: await runAllEdgeFunctionsTests(),
    allRoutes: await runAllRoutesTests(),
    allContexts: await runAllContextsTests(),
    allComponents: await runAllComponentsTests(),
    allLibraries: await runAllLibrariesTests(),
  };
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // حساب الإحصائيات الإجمالية
  const allBasicResults = Object.values(basicResults).flat();
  
  // استخراج النتائج من الاختبارات الشاملة
  const comprehensiveResultsArrays = [
    comprehensiveResults.allPages.results || [],
    comprehensiveResults.allHooks.results || [],
    comprehensiveResults.allServices.results || [],
    comprehensiveResults.allEdgeFunctions.results || [],
    comprehensiveResults.allRoutes.results || [],
    comprehensiveResults.allContexts.results || [],
    comprehensiveResults.allComponents.results || [],
    comprehensiveResults.allLibraries.results || [],
  ].flat();
  
  const allResults = [...allBasicResults, ...comprehensiveResultsArrays];
  
  const passed = allResults.filter(r => r && r.status === 'passed').length;
  const failed = allResults.filter(r => r && r.status === 'failed').length;
  const skipped = allResults.filter(r => r && r.status === 'skipped').length;
  const total = allResults.length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 ملخص الاختبارات الحقيقية الشاملة:');
  console.log('='.repeat(60));
  console.log(`   ✅ نجح: ${passed}`);
  console.log(`   ❌ فشل: ${failed}`);
  console.log(`   ⏭️ متجاوز: ${skipped}`);
  console.log(`   📋 الإجمالي: ${total}`);
  console.log(`   📈 نسبة النجاح: ${passRate}%`);
  console.log(`   ⏱️ الوقت: ${duration} ثانية`);
  console.log('='.repeat(60));
  
  // تفصيل حسب الفئة
  console.log('\n📊 تفصيل حسب الفئة:');
  console.log('─'.repeat(40));
  
  const categories = [
    { name: 'الصفحات', results: comprehensiveResults.allPages, target: 83 },
    { name: 'الـ Hooks', results: comprehensiveResults.allHooks, target: 200 },
    { name: 'الخدمات', results: comprehensiveResults.allServices, target: 60 },
    { name: 'Edge Functions', results: comprehensiveResults.allEdgeFunctions, target: 53 },
    { name: 'المسارات', results: comprehensiveResults.allRoutes, target: 80 },
    { name: 'السياقات', results: comprehensiveResults.allContexts, target: 7 },
    { name: 'المكونات', results: comprehensiveResults.allComponents, target: 500 },
    { name: 'المكتبات', results: comprehensiveResults.allLibraries, target: 42 },
  ];
  
  for (const cat of categories) {
    const catPassed = cat.results.passed || 0;
    const catTotal = cat.results.total || 0;
    const catRate = catTotal > 0 ? ((catPassed / catTotal) * 100).toFixed(0) : '0';
    const coverage = ((catTotal / cat.target) * 100).toFixed(0);
    console.log(`   ${cat.name}: ${catPassed}/${catTotal} (${catRate}%) - تغطية: ${coverage}%`);
  }
  
  return {
    basic: basicResults,
    comprehensive: comprehensiveResults,
    summary: {
      passed,
      failed,
      skipped,
      total,
      passRate: parseFloat(passRate),
      duration: parseFloat(duration),
    },
  };
}

/**
 * تشغيل اختبارات فئة محددة فقط
 */
export async function runCategoryTests(category: 
  'pages' | 'hooks' | 'services' | 'edgeFunctions' | 
  'routes' | 'contexts' | 'components' | 'libraries'
) {
  const testFunctions: Record<string, () => Promise<any>> = {
    pages: async () => (await import('./all-pages.real.tests')).runAllPagesTests(),
    hooks: async () => (await import('./all-hooks.real.tests')).runAllHooksTests(),
    services: async () => (await import('./all-services.real.tests')).runAllServicesTests(),
    edgeFunctions: async () => (await import('./all-edge-functions.real.tests')).runAllEdgeFunctionsTests(),
    routes: async () => (await import('./all-routes.real.tests')).runAllRoutesTests(),
    contexts: async () => (await import('./all-contexts.real.tests')).runAllContextsTests(),
    components: async () => (await import('./all-components.real.tests')).runAllComponentsTests(),
    libraries: async () => (await import('./all-libraries.real.tests')).runAllLibrariesTests(),
  };
  
  if (testFunctions[category]) {
    console.log(`🧪 تشغيل اختبارات: ${category}`);
    return await testFunctions[category]();
  }
  
  throw new Error(`فئة غير معروفة: ${category}`);
}
