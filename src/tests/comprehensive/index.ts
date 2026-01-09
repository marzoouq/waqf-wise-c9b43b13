/**
 * Comprehensive Tests Index - فهرس الاختبارات الشاملة 100%
 * @version 7.0.0
 * 
 * تغطية شاملة 100% لجميع أجزاء التطبيق:
 * - 250+ Hook (38 مجلد)
 * - 60+ خدمة
 * - 83+ صفحة
 * - 53+ Edge Function
 * - 75+ مكون UI
 * - 45+ مكتبة
 * - 7 سياقات
 * - 60+ جدول DB
 * - 50+ اختبار أمان
 * - 50+ اختبار أداء
 * - 50+ اختبار تكامل
 * 
 * إجمالي: 800+ اختبار حقيقي
 */

// تصدير جميع دوال الاختبار والأنواع
export { runServicesComprehensiveTests, type ComprehensiveTestResult } from './services.comprehensive.tests';
export { runDatabaseComprehensiveTests, type DatabaseTestResult } from './database.comprehensive.tests';
export { runEdgeFunctionsComprehensiveTests, type EdgeFunctionTestResult } from './edge-functions.comprehensive.tests';
export { runSecurityComprehensiveTests, type SecurityTestResult } from './security.comprehensive.tests';
export { runHooksComprehensiveTests, type HookTestResult, getHooksStats } from './hooks.comprehensive.tests';
export { runIntegrationComprehensiveTests, type IntegrationTestResult } from './integration.comprehensive.tests';
export { runPerformanceComprehensiveTests, type PerformanceTestResult } from './performance.comprehensive.tests';
export { runComponentsComprehensiveTests, type ComponentTestResult, getComponentsStats } from './components.comprehensive.tests';
export { runPagesComprehensiveTests, type PageTestResult, getPagesStats } from './pages.comprehensive.tests';
export { runContextsComprehensiveTests, type ContextTestResult, getContextsStats } from './contexts.comprehensive.tests';
export { runLibrariesComprehensiveTests, type LibraryTestResult, getLibrariesStats } from './libraries.comprehensive.tests';

// استيراد الدوال للاستخدام الداخلي
import { runServicesComprehensiveTests } from './services.comprehensive.tests';
import { runDatabaseComprehensiveTests } from './database.comprehensive.tests';
import { runEdgeFunctionsComprehensiveTests } from './edge-functions.comprehensive.tests';
import { runSecurityComprehensiveTests } from './security.comprehensive.tests';
import { runHooksComprehensiveTests, getHooksStats } from './hooks.comprehensive.tests';
import { runIntegrationComprehensiveTests } from './integration.comprehensive.tests';
import { runPerformanceComprehensiveTests } from './performance.comprehensive.tests';
import { runComponentsComprehensiveTests, getComponentsStats } from './components.comprehensive.tests';
import { runPagesComprehensiveTests, getPagesStats } from './pages.comprehensive.tests';
import { runContextsComprehensiveTests, getContextsStats } from './contexts.comprehensive.tests';
import { runLibrariesComprehensiveTests, getLibrariesStats } from './libraries.comprehensive.tests';

/**
 * نتيجة جميع الاختبارات الشاملة
 */
export interface AllComprehensiveTestsResult {
  services: Awaited<ReturnType<typeof runServicesComprehensiveTests>>;
  database: Awaited<ReturnType<typeof runDatabaseComprehensiveTests>>;
  edgeFunctions: Awaited<ReturnType<typeof runEdgeFunctionsComprehensiveTests>>;
  security: Awaited<ReturnType<typeof runSecurityComprehensiveTests>>;
  hooks: Awaited<ReturnType<typeof runHooksComprehensiveTests>>;
  integration: Awaited<ReturnType<typeof runIntegrationComprehensiveTests>>;
  performance: Awaited<ReturnType<typeof runPerformanceComprehensiveTests>>;
  components: Awaited<ReturnType<typeof runComponentsComprehensiveTests>>;
  pages: Awaited<ReturnType<typeof runPagesComprehensiveTests>>;
  contexts: Awaited<ReturnType<typeof runContextsComprehensiveTests>>;
  libraries: Awaited<ReturnType<typeof runLibrariesComprehensiveTests>>;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    totalDuration: number;
    byCategory: Record<string, { total: number; passed: number; failed: number }>;
  };
}

/**
 * الحصول على إحصائيات التغطية الكاملة
 */
export function getFullCoverageStats() {
  const hooksStats = getHooksStats();
  const componentsStats = getComponentsStats();
  const pagesStats = getPagesStats();
  const contextsStats = getContextsStats();
  const librariesStats = getLibrariesStats();
  
  return {
    hooks: hooksStats,
    components: componentsStats,
    pages: pagesStats,
    contexts: contextsStats,
    libraries: librariesStats,
    totals: {
      hooks: hooksStats.totalHooks,
      hooksFolders: hooksStats.foldersCount,
      components: componentsStats.totalComponents,
      pages: pagesStats.totalPages,
      contexts: contextsStats.totalContexts,
      libraries: librariesStats.totalLibraries,
      estimatedTotalTests: 
        hooksStats.totalHooks + 
        (componentsStats.totalTests) + 
        (pagesStats.totalTests) + 
        (contextsStats.totalTests) + 
        (librariesStats.totalTests) +
        60 + // services
        60 + // database
        53 + // edge functions
        50 + // security
        50 + // performance
        50   // integration
    }
  };
}

/**
 * تشغيل جميع الاختبارات الشاملة - 800+ اختبار حقيقي
 */
export async function runAllComprehensiveTests(): Promise<AllComprehensiveTestsResult> {
  console.log('🚀 بدء جميع الاختبارات الشاملة 100% - 11 فئة...\n');
  const overallStart = performance.now();
  
  // تشغيل جميع الاختبارات بالتوازي للسرعة
  const [
    services,
    database,
    edgeFunctions,
    security,
    hooks,
    integration,
    performanceResults,
    components,
    pages,
    contexts,
    libraries
  ] = await Promise.all([
    runServicesComprehensiveTests(),
    runDatabaseComprehensiveTests(),
    runEdgeFunctionsComprehensiveTests(),
    runSecurityComprehensiveTests(),
    runHooksComprehensiveTests(),
    runIntegrationComprehensiveTests(),
    runPerformanceComprehensiveTests(),
    runComponentsComprehensiveTests(),
    runPagesComprehensiveTests(),
    runContextsComprehensiveTests(),
    runLibrariesComprehensiveTests(),
  ]);
  
  const totalDuration = performance.now() - overallStart;
  
  // حساب الإحصائيات
  const allResults = [
    ...services,
    ...database,
    ...edgeFunctions,
    ...security,
    ...hooks,
    ...integration,
    ...performanceResults,
    ...components,
    ...pages,
    ...contexts,
    ...libraries
  ];
  
  const totalTests = allResults.length;
  const passedTests = allResults.filter((r: any) => r.passed || r.status === 'passed').length;
  const failedTests = totalTests - passedTests;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  
  // إحصائيات حسب الفئة
  const byCategory: Record<string, { total: number; passed: number; failed: number }> = {
    services: { 
      total: services.length, 
      passed: services.filter((r: any) => r.passed || r.status === 'passed').length,
      failed: services.filter((r: any) => !r.passed && r.status !== 'passed').length
    },
    database: { 
      total: database.length, 
      passed: database.filter((r: any) => r.passed || r.status === 'passed').length,
      failed: database.filter((r: any) => !r.passed && r.status !== 'passed').length
    },
    edgeFunctions: { 
      total: edgeFunctions.length, 
      passed: edgeFunctions.filter((r: any) => r.passed || r.status === 'passed').length,
      failed: edgeFunctions.filter((r: any) => !r.passed && r.status !== 'passed').length
    },
    security: { 
      total: security.length, 
      passed: security.filter((r: any) => r.passed || r.status === 'passed').length,
      failed: security.filter((r: any) => !r.passed && r.status !== 'passed').length
    },
    hooks: { 
      total: hooks.length, 
      passed: hooks.filter((r: any) => r.passed || r.status === 'passed').length,
      failed: hooks.filter((r: any) => !r.passed && r.status !== 'passed').length
    },
    integration: { 
      total: integration.length, 
      passed: integration.filter((r: any) => r.passed || r.status === 'passed').length,
      failed: integration.filter((r: any) => !r.passed && r.status !== 'passed').length
    },
    performance: { 
      total: performanceResults.length, 
      passed: performanceResults.filter((r: any) => r.passed || r.status === 'passed').length,
      failed: performanceResults.filter((r: any) => !r.passed && r.status !== 'passed').length
    },
    components: { 
      total: components.length, 
      passed: components.filter((r: any) => r.passed || r.status === 'passed').length,
      failed: components.filter((r: any) => !r.passed && r.status !== 'passed').length
    },
    pages: { 
      total: pages.length, 
      passed: pages.filter((r: any) => r.passed || r.status === 'passed').length,
      failed: pages.filter((r: any) => !r.passed && r.status !== 'passed').length
    },
    contexts: { 
      total: contexts.length, 
      passed: contexts.filter((r: any) => r.passed || r.status === 'passed').length,
      failed: contexts.filter((r: any) => !r.passed && r.status !== 'passed').length
    },
    libraries: { 
      total: libraries.length, 
      passed: libraries.filter((r: any) => r.passed || r.status === 'passed').length,
      failed: libraries.filter((r: any) => !r.passed && r.status !== 'passed').length
    },
  };
  
  // طباعة النتائج
  console.log('\n' + '='.repeat(60));
  console.log('📊 ملخص الاختبارات الشاملة 100%');
  console.log('='.repeat(60));
  
  Object.entries(byCategory).forEach(([category, stats]) => {
    const emoji = stats.failed === 0 ? '✅' : '⚠️';
    console.log(`${emoji} ${category}: ${stats.passed}/${stats.total} (${((stats.passed/stats.total)*100).toFixed(1)}%)`);
  });
  
  console.log('='.repeat(60));
  console.log(`📈 الإجمالي: ${passedTests}/${totalTests} اختبار ناجح (${successRate.toFixed(1)}%)`);
  console.log(`⏱️ الوقت الإجمالي: ${(totalDuration/1000).toFixed(2)} ثانية`);
  console.log('='.repeat(60));
  
  return {
    services,
    database,
    edgeFunctions,
    security,
    hooks,
    integration,
    performance: performanceResults,
    components,
    pages,
    contexts,
    libraries,
    summary: {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      totalDuration,
      byCategory
    }
  };
}

/**
 * تشغيل اختبارات فئة محددة
 */
export async function runCategoryTests(category: string) {
  switch (category) {
    case 'services': return runServicesComprehensiveTests();
    case 'database': return runDatabaseComprehensiveTests();
    case 'edgeFunctions': return runEdgeFunctionsComprehensiveTests();
    case 'security': return runSecurityComprehensiveTests();
    case 'hooks': return runHooksComprehensiveTests();
    case 'integration': return runIntegrationComprehensiveTests();
    case 'performance': return runPerformanceComprehensiveTests();
    case 'components': return runComponentsComprehensiveTests();
    case 'pages': return runPagesComprehensiveTests();
    case 'contexts': return runContextsComprehensiveTests();
    case 'libraries': return runLibrariesComprehensiveTests();
    default: throw new Error(`Unknown category: ${category}`);
  }
}

/**
 * الحصول على قائمة الفئات المتاحة
 */
export function getAvailableCategories(): string[] {
  return [
    'services',
    'database', 
    'edgeFunctions',
    'security',
    'hooks',
    'integration',
    'performance',
    'components',
    'pages',
    'contexts',
    'libraries'
  ];
}
