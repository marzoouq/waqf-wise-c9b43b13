// أدوات المطور المتقدمة

export { useErrorNotifications } from './useErrorNotifications';
export { useRenderTracker, getRenderReport, resetRenderRegistry } from './useRenderTracker';
export { useDuplicateDetector, trackApiRequest, resetDuplicateRegistry } from './useDuplicateDetector';
export { useMemoryMonitor, getMemorySnapshots, resetMemorySnapshots } from './useMemoryMonitor';
export { usePerformanceGuard, getAllPerformanceIssues } from './usePerformanceGuard';
export { useDeepDiagnostics } from './useDeepDiagnostics';

// أدوات التحليل المتقدمة الجديدة
export { useCodeHealthAnalyzer, registerIssue, getAllCodeIssues, clearAllCodeIssues } from './useCodeHealthAnalyzer';
export { useRealTimeMonitor, getAllEvents } from './useRealTimeMonitor';
export { useComponentProfiler, useProfiledComponent, startComponentRender, registerComponentMount, registerComponentUnmount, getAllComponentProfiles, resetComponentProfiles } from './useComponentProfiler';
