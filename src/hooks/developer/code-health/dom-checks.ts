/**
 * فحوصات DOM والذاكرة والشبكة
 */

import { registerIssue } from './registry';

/**
 * فحص DOM
 */
export function checkDOMIssues(): void {
  // فحص عدد العناصر
  const allElements = document.querySelectorAll('*');
  if (allElements.length > 3000) {
    registerIssue({
      type: 'warning',
      category: 'DOM',
      message: `عدد عناصر DOM كبير جداً: ${allElements.length}`,
      details: 'يؤثر على الأداء - يُنصح بالتحسين',
    });
  }

  // فحص عمق DOM
  let maxDepth = 0;
  const checkDepth = (el: Element, depth: number) => {
    maxDepth = Math.max(maxDepth, depth);
    Array.from(el.children).forEach(child => checkDepth(child, depth + 1));
  };
  checkDepth(document.body, 0);
  
  if (maxDepth > 32) {
    registerIssue({
      type: 'warning',
      category: 'DOM',
      message: `عمق DOM كبير: ${maxDepth} مستوى`,
      details: 'يُنصح بتقليل تداخل العناصر',
    });
  }

  // فحص الصور بدون alt
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
  if (imagesWithoutAlt.length > 0) {
    registerIssue({
      type: 'warning',
      category: 'Accessibility',
      message: `${imagesWithoutAlt.length} صورة بدون نص بديل (alt)`,
      autoFixable: true,
    });
  }

  // فحص الروابط الفارغة
  const emptyLinks = document.querySelectorAll('a:not([href]), a[href=""], a[href="#"]');
  if (emptyLinks.length > 0) {
    registerIssue({
      type: 'warning',
      category: 'SEO',
      message: `${emptyLinks.length} رابط فارغ أو غير صالح`,
    });
  }

  // فحص النماذج بدون labels
  const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([id])');
  if (inputsWithoutLabels.length > 0) {
    registerIssue({
      type: 'info',
      category: 'Accessibility',
      message: `${inputsWithoutLabels.length} حقل إدخال بدون تسمية`,
    });
  }
}

/**
 * فحص الذاكرة
 */
export function checkMemoryIssues(): void {
  if ('memory' in performance) {
    const memory = (performance as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    
    if (usedPercent > 90) {
      registerIssue({
        type: 'critical',
        category: 'Memory',
        message: `استخدام الذاكرة حرج: ${usedPercent.toFixed(1)}%`,
        details: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB من ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1)}MB`,
      });
    } else if (usedPercent > 75) {
      registerIssue({
        type: 'warning',
        category: 'Memory',
        message: `استخدام الذاكرة مرتفع: ${usedPercent.toFixed(1)}%`,
      });
    }
  }

  // فحص تسرب الذاكرة المحتمل
  const detachedNodes = document.querySelectorAll('[data-detached]');
  if (detachedNodes.length > 10) {
    registerIssue({
      type: 'warning',
      category: 'Memory',
      message: `${detachedNodes.length} عنصر منفصل محتمل`,
      details: 'قد يشير إلى تسرب ذاكرة',
    });
  }
}

/**
 * فحص الشبكة
 */
export function checkNetworkIssues(): void {
  // فحص الاتصال
  if (!navigator.onLine) {
    registerIssue({
      type: 'critical',
      category: 'Network',
      message: 'لا يوجد اتصال بالإنترنت',
    });
  }

  // فحص سرعة الاتصال
  const connection = (navigator as Navigator & { connection?: { effectiveType: string; saveData: boolean } }).connection;
  if (connection) {
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
      registerIssue({
        type: 'warning',
        category: 'Network',
        message: `سرعة اتصال بطيئة: ${connection.effectiveType}`,
      });
    }
    
    if (connection.saveData) {
      registerIssue({
        type: 'info',
        category: 'Network',
        message: 'وضع توفير البيانات مفعل',
      });
    }
  }
}
