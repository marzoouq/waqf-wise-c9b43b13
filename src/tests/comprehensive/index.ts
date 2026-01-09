/**
 * Comprehensive Tests Index - فهرس الاختبارات الشاملة 100%
 * @version 5.0.0
 */

// تصدير جميع دوال الاختبار
export { runServicesComprehensiveTests, type ComprehensiveTestResult } from './services.comprehensive.tests';
export { runDatabaseComprehensiveTests, type DatabaseTestResult } from './database.comprehensive.tests';
export { runEdgeFunctionsComprehensiveTests, type EdgeFunctionTestResult } from './edge-functions.comprehensive.tests';
export { runSecurityComprehensiveTests, type SecurityTestResult } from './security.comprehensive.tests';
export { runHooksComprehensiveTests, type HookTestResult } from './hooks.comprehensive.tests';
export { runIntegrationComprehensiveTests, type IntegrationTestResult } from './integration.comprehensive.tests';

// استيراد الدوال للاستخدام الداخلي
import { runServicesComprehensiveTests } from './services.comprehensive.tests';
import { runDatabaseComprehensiveTests } from './database.comprehensive.tests';
import { runEdgeFunctionsComprehensiveTests } from './edge-functions.comprehensive.tests';
import { runSecurityComprehensiveTests } from './security.comprehensive.tests';
import { runHooksComprehensiveTests } from './hooks.comprehensive.tests';
import { runIntegrationComprehensiveTests } from './integration.comprehensive.tests';

/**
 * تشغيل جميع الاختبارات الشاملة
 */
export async function runAllComprehensiveTests() {
  console.log('🚀 بدء جميع الاختبارات الشاملة 100%...\n');
  
  const results = {
    services: await runServicesComprehensiveTests(),
    database: await runDatabaseComprehensiveTests(),
    edgeFunctions: await runEdgeFunctionsComprehensiveTests(),
    security: await runSecurityComprehensiveTests(),
    hooks: await runHooksComprehensiveTests(),
    integration: await runIntegrationComprehensiveTests(),
  };
  
  const totalTests = Object.values(results).flat().length;
  const passedTests = Object.values(results).flat().filter((r: any) => r.status === 'passed').length;
  
  console.log(`\n📊 النتيجة النهائية: ${passedTests}/${totalTests} اختبار ناجح (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  
  return results;
}
