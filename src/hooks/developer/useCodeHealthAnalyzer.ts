/**
 * أداة تحليل صحة الكود في وقت التشغيل
 * تكشف المشاكل الحقيقية في التطبيق مباشرة
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';
import { 
  type CodeIssue, 
  type HealthReport,
  issuesRegistry,
  analysisListeners,
  registerIssue,
  getAllCodeIssues,
  clearAllCodeIssues,
  checkDOMIssues,
  checkMemoryIssues,
  checkNetworkIssues,
  checkReactIssues,
  checkPerformanceIssues,
  checkSecurityIssues,
  checkAccessibilityIssues,
  checkSEOIssues,
  checkStorageIssues,
} from './code-health';

// Re-exports for backward compatibility
export type { CodeIssue, HealthReport } from './code-health';
export { registerIssue, getAllCodeIssues, clearAllCodeIssues } from './code-health';

export function useCodeHealthAnalyzer(enabled: boolean = true) {
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<HealthReport | null>(null);
  const analysisInterval = useRef<NodeJS.Timeout | null>(null);

  // الاستماع للتحديثات
  useEffect(() => {
    const listener = (newIssues: CodeIssue[]) => {
      setIssues(newIssues);
    };
    
    if (enabled) {
      analysisListeners.push(listener);
      setIssues(Array.from(issuesRegistry.values()));
    }
    
    return () => {
      const index = analysisListeners.indexOf(listener);
      if (index > -1) analysisListeners.splice(index, 1);
    };
  }, [enabled]);

  // إنشاء التقرير
  const generateReport = useCallback(() => {
    const allIssues = Array.from(issuesRegistry.values());
    
    const categories: Record<string, number> = {};
    let criticalCount = 0, errorCount = 0, warningCount = 0, infoCount = 0;
    
    allIssues.forEach(issue => {
      categories[issue.category] = (categories[issue.category] || 0) + 1;
      switch (issue.type) {
        case 'critical': criticalCount++; break;
        case 'error': errorCount++; break;
        case 'warning': warningCount++; break;
        case 'info': infoCount++; break;
      }
    });
    
    let score = 100 - (criticalCount * 20) - (errorCount * 10) - (warningCount * 3) - infoCount;
    score = Math.max(0, Math.min(100, score));
    
    setReport({ score, totalIssues: allIssues.length, criticalCount, errorCount, warningCount, infoCount, categories, lastAnalysis: new Date() });
  }, []);

  // تحليل شامل
  const runFullAnalysis = useCallback(async () => {
    if (!enabled) return;
    setIsAnalyzing(true);
    
    try {
      checkDOMIssues();
      checkMemoryIssues();
      checkNetworkIssues();
      checkReactIssues();
      checkPerformanceIssues();
      checkSecurityIssues();
      checkAccessibilityIssues();
      checkSEOIssues();
      checkStorageIssues();
      generateReport();
    } catch (error) {
      productionLogger.error('فشل التحليل الشامل', { error });
    } finally {
      setIsAnalyzing(false);
    }
  }, [enabled, generateReport]);

  // مسح المشاكل
  const clearIssues = useCallback(() => {
    issuesRegistry.clear();
    setIssues([]);
    setReport(null);
  }, []);

  // تشغيل التحليل الدوري
  useEffect(() => {
    if (!enabled) return;
    
    const timeout = setTimeout(() => runFullAnalysis(), 1000);
    analysisInterval.current = setInterval(runFullAnalysis, 30000);
    
    return () => {
      clearTimeout(timeout);
      if (analysisInterval.current) clearInterval(analysisInterval.current);
    };
  }, [enabled, runFullAnalysis]);

  return { issues, report, isAnalyzing, runFullAnalysis, clearIssues, registerIssue };
}
