/**
 * فهرس جميع الاختبارات - تغطية 100%
 * @version 3.1.0
 */

// ✅ اختبارات تغطية 100%
import runServicesComprehensive100Tests from './services.comprehensive.100.tests';
import runHooksComprehensive100Tests, { getHooks100Stats } from './hooks.comprehensive.100.tests';
import runEdgeFunctionsComprehensive100Tests, { getEdgeFunctions100Stats } from './edge-functions.comprehensive.100.tests';
import runSecurity100TestsFn from './security.100.tests';

export {
  runServicesComprehensive100Tests as runServices100Tests,
  runHooksComprehensive100Tests as runHooks100Tests,
  runEdgeFunctionsComprehensive100Tests as runEdgeFunctions100Tests,
  runSecurity100TestsFn as runSecurity100Tests,
  getHooks100Stats,
  getEdgeFunctions100Stats
};

// Seed functions
export { TestDataSeed } from './seed';

// الاختبارات الشاملة السابقة
export * from './comprehensive';

// اختبارات حقيقية
export { runServicesRealTests } from './services.real.tests';
export { runContextsRealTests } from './contexts.real.tests';
export { runPagesRealTests } from './pages.real.tests';
export { runLibrariesRealTests } from './libraries.real.tests';
export { runRealLibTests } from './real-lib.tests';
export { runRealSecurityTests } from './real-security.tests';
export { runRealAPITests } from './real-api.tests';

// اختبارات الأداء
export { runPerformanceLoadTests } from './performance-load.tests';
export { runDataIntegrityTests } from './data-integrity.tests';

// اختبارات الأمان
export { runRBACTests } from './rbac-cross.tests';
export { runRateLimitingTests } from './rate-limiting-real.tests';
export { runBackupRestoreTests } from './backup-restore.tests';

// اختبارات UI
export { runUITests } from './ui-components.tests';
export { runWorkflowTests } from './workflow.tests';
export { runReportTests } from './reports-export.tests';
export { runResponsiveA11yTests } from './responsive-a11y.tests';

// اختبارات الوحدات
export { runHooksTests } from './hooks.tests';
export { runComponentsTests } from './components.tests';
export { runIntegrationTests } from './integration.tests';
export { runServicesTests } from './services.tests';
export { runEdgeFunctionsTests } from './edge-functions.tests';
export { runContextsTests } from './contexts.tests';
export { runLibrariesTests } from './libraries.tests';
export { runPagesTests } from './pages.tests';
export { runTypesTests } from './types.tests';

// اختبارات متقدمة
export { runAdvancedWorkflowTests } from './advanced-workflow.tests';
export { runAdvancedPerformanceTests } from './performance-advanced.tests';
export { runSecurityAdvancedTests } from './security-advanced.tests';
