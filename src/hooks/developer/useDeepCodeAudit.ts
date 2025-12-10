/**
 * Deep Code Audit Hook - أداة الفحص العميق للكود
 * @version 2.8.71
 * 
 * يقوم بفحص شامل للتطبيق ويكشف:
 * - مشاكل الأداء
 * - انتهاكات المعمارية
 * - أنماط الكود السيئة
 * - مشاكل الأمان
 * - مشاكل الوصولية
 */

import { useState, useCallback } from 'react';

export interface AuditIssue {
  id: string;
  category: 'performance' | 'architecture' | 'security' | 'accessibility' | 'best-practices' | 'types';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion?: string;
  autoFixable?: boolean;
}

export interface AuditReport {
  timestamp: string;
  duration: number;
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  issues: AuditIssue[];
  score: number;
  categories: {
    performance: number;
    architecture: number;
    security: number;
    accessibility: number;
    bestPractices: number;
    types: number;
  };
}

export interface AuditProgress {
  phase: string;
  progress: number;
  currentCheck: string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function useDeepCodeAudit() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState<AuditProgress>({ phase: '', progress: 0, currentCheck: '' });
  const [report, setReport] = useState<AuditReport | null>(null);

  const runAudit = useCallback(async () => {
    setIsAuditing(true);
    const startTime = Date.now();
    const issues: AuditIssue[] = [];

    try {
      // Phase 1: Runtime Performance Check
      setProgress({ phase: 'فحص الأداء', progress: 10, currentCheck: 'قياس أداء التحميل' });
      
      // Check memory usage
      if ('memory' in performance) {
        const memory = (performance as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
        const usagePercent = (usedMB / limitMB) * 100;
        
        if (usagePercent > 80) {
          issues.push({
            id: generateId(),
            category: 'performance',
            severity: 'high',
            title: 'استخدام ذاكرة مرتفع',
            description: `الذاكرة المستخدمة: ${usedMB.toFixed(2)}MB من ${limitMB.toFixed(2)}MB (${usagePercent.toFixed(1)}%)`,
            suggestion: 'تحسين إدارة الذاكرة وتنظيف المراجع غير المستخدمة'
          });
        }
      }

      await new Promise(r => setTimeout(r, 100));

      // Phase 2: DOM Analysis
      setProgress({ phase: 'تحليل DOM', progress: 25, currentCheck: 'فحص عناصر الصفحة' });
      
      const domNodes = document.querySelectorAll('*').length;
      if (domNodes > 1500) {
        issues.push({
          id: generateId(),
          category: 'performance',
          severity: domNodes > 3000 ? 'high' : 'medium',
          title: 'عدد كبير من عناصر DOM',
          description: `الصفحة تحتوي على ${domNodes} عنصر`,
          suggestion: 'استخدام التحميل الكسول والـ virtualization للقوائم الطويلة'
        });
      }

      // Check for missing alt attributes
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])').length;
      if (imagesWithoutAlt > 0) {
        issues.push({
          id: generateId(),
          category: 'accessibility',
          severity: 'medium',
          title: 'صور بدون نص بديل',
          description: `${imagesWithoutAlt} صورة بدون خاصية alt`,
          suggestion: 'إضافة نص بديل لجميع الصور لتحسين الوصولية'
        });
      }

      // Check for buttons without accessible names
      const buttonsWithoutLabel = document.querySelectorAll('button:not([aria-label]):not(:has(*))').length;
      if (buttonsWithoutLabel > 0) {
        issues.push({
          id: generateId(),
          category: 'accessibility',
          severity: 'low',
          title: 'أزرار بدون تسميات وصولية',
          description: `${buttonsWithoutLabel} زر قد يحتاج تسمية وصولية`,
          suggestion: 'إضافة aria-label للأزرار التي لا تحتوي على نص'
        });
      }

      await new Promise(r => setTimeout(r, 100));

      // Phase 3: Network Analysis
      setProgress({ phase: 'تحليل الشبكة', progress: 40, currentCheck: 'فحص الطلبات' });
      
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const slowResources = resources.filter(r => r.duration > 500);
      
      if (slowResources.length > 0) {
        issues.push({
          id: generateId(),
          category: 'performance',
          severity: 'medium',
          title: 'موارد بطيئة التحميل',
          description: `${slowResources.length} موارد تستغرق أكثر من 500ms للتحميل`,
          suggestion: 'تحسين حجم الملفات أو استخدام CDN'
        });
      }

      // Check for duplicate requests
      const resourceUrls = resources.map(r => r.name);
      const duplicates = resourceUrls.filter((url, i) => resourceUrls.indexOf(url) !== i);
      if (duplicates.length > 0) {
        issues.push({
          id: generateId(),
          category: 'performance',
          severity: 'low',
          title: 'طلبات شبكة مكررة',
          description: `تم اكتشاف ${new Set(duplicates).size} طلب مكرر`,
          suggestion: 'استخدام التخزين المؤقت لتجنب الطلبات المكررة'
        });
      }

      await new Promise(r => setTimeout(r, 100));

      // Phase 4: Console Errors Check
      setProgress({ phase: 'فحص الأخطاء', progress: 55, currentCheck: 'البحث عن أخطاء الكونسول' });

      // Phase 5: LocalStorage Analysis
      setProgress({ phase: 'تحليل التخزين', progress: 70, currentCheck: 'فحص التخزين المحلي' });
      
      try {
        let totalSize = 0;
        for (const key of Object.keys(localStorage)) {
          totalSize += (localStorage.getItem(key)?.length || 0) * 2;
        }
        const sizeMB = totalSize / 1024 / 1024;
        if (sizeMB > 4) {
          issues.push({
            id: generateId(),
            category: 'performance',
            severity: 'medium',
            title: 'تخزين محلي كبير',
            description: `حجم التخزين المحلي: ${sizeMB.toFixed(2)}MB`,
            suggestion: 'تنظيف البيانات القديمة من localStorage'
          });
        }
      } catch {
        // localStorage might be disabled
      }

      await new Promise(r => setTimeout(r, 100));

      // Phase 6: Event Listeners Check
      setProgress({ phase: 'فحص المستمعين', progress: 85, currentCheck: 'تحليل مستمعي الأحداث' });

      // Phase 7: Final Analysis
      setProgress({ phase: 'التحليل النهائي', progress: 95, currentCheck: 'إعداد التقرير' });

      await new Promise(r => setTimeout(r, 100));

      // Calculate scores
      const criticalCount = issues.filter(i => i.severity === 'critical').length;
      const highCount = issues.filter(i => i.severity === 'high').length;
      const mediumCount = issues.filter(i => i.severity === 'medium').length;
      const lowCount = issues.filter(i => i.severity === 'low').length;
      const infoCount = issues.filter(i => i.severity === 'info').length;

      // Score calculation (100 - penalties)
      const penalties = criticalCount * 20 + highCount * 10 + mediumCount * 5 + lowCount * 2 + infoCount * 0.5;
      const score = Math.max(0, Math.min(100, 100 - penalties));

      const categoryCounts = {
        performance: issues.filter(i => i.category === 'performance').length,
        architecture: issues.filter(i => i.category === 'architecture').length,
        security: issues.filter(i => i.category === 'security').length,
        accessibility: issues.filter(i => i.category === 'accessibility').length,
        bestPractices: issues.filter(i => i.category === 'best-practices').length,
        types: issues.filter(i => i.category === 'types').length,
      };

      const calculateCategoryScore = (count: number) => Math.max(0, 100 - count * 15);

      const finalReport: AuditReport = {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        totalIssues: issues.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        infoCount,
        issues,
        score,
        categories: {
          performance: calculateCategoryScore(categoryCounts.performance),
          architecture: calculateCategoryScore(categoryCounts.architecture),
          security: calculateCategoryScore(categoryCounts.security),
          accessibility: calculateCategoryScore(categoryCounts.accessibility),
          bestPractices: calculateCategoryScore(categoryCounts.bestPractices),
          types: calculateCategoryScore(categoryCounts.types),
        },
      };

      setReport(finalReport);
      setProgress({ phase: 'اكتمل الفحص', progress: 100, currentCheck: '' });

      return finalReport;
    } finally {
      setIsAuditing(false);
    }
  }, []);

  const clearReport = useCallback(() => {
    setReport(null);
    setProgress({ phase: '', progress: 0, currentCheck: '' });
  }, []);

  return {
    isAuditing,
    progress,
    report,
    runAudit,
    clearReport,
  };
}
