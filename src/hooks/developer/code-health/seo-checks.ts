/**
 * فحوصات SEO والتخزين وإمكانية الوصول
 */

import { registerIssue } from './registry';

/**
 * فحص إمكانية الوصول
 */
export function checkAccessibilityIssues(): void {
  // فحص تباين الألوان (تقريبي)
  const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label');
  let lowContrastCount = 0;
  
  textElements.forEach(el => {
    const style = window.getComputedStyle(el);
    const color = style.color;
    const bg = style.backgroundColor;
    
    // فحص بسيط للنص الأبيض على خلفية فاتحة
    if (color === 'rgb(255, 255, 255)' && bg.includes('255')) {
      lowContrastCount++;
    }
  });
  
  if (lowContrastCount > 5) {
    registerIssue({
      type: 'warning',
      category: 'Accessibility',
      message: `${lowContrastCount} عنصر بتباين منخفض محتمل`,
    });
  }

  // فحص حجم النص
  const smallText = document.querySelectorAll('*');
  let tooSmallCount = 0;
  smallText.forEach(el => {
    const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
    if (fontSize < 12 && el.textContent?.trim()) {
      tooSmallCount++;
    }
  });
  
  if (tooSmallCount > 10) {
    registerIssue({
      type: 'info',
      category: 'Accessibility',
      message: `${tooSmallCount} عنصر بخط صغير (<12px)`,
    });
  }

  // فحص أزرار بدون نص
  const buttonsWithoutText = document.querySelectorAll('button:empty:not([aria-label])');
  if (buttonsWithoutText.length > 0) {
    registerIssue({
      type: 'warning',
      category: 'Accessibility',
      message: `${buttonsWithoutText.length} زر بدون نص أو تسمية`,
    });
  }
}

/**
 * فحص SEO
 */
export function checkSEOIssues(): void {
  // فحص العنوان
  const title = document.title;
  if (!title || title.length < 10) {
    registerIssue({
      type: 'warning',
      category: 'SEO',
      message: 'عنوان الصفحة قصير أو مفقود',
    });
  } else if (title.length > 60) {
    registerIssue({
      type: 'info',
      category: 'SEO',
      message: `عنوان الصفحة طويل (${title.length} حرف)`,
    });
  }

  // فحص meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    registerIssue({
      type: 'warning',
      category: 'SEO',
      message: 'meta description مفقود',
    });
  }

  // فحص H1
  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 0) {
    registerIssue({
      type: 'warning',
      category: 'SEO',
      message: 'لا يوجد عنوان H1 في الصفحة',
    });
  } else if (h1s.length > 1) {
    registerIssue({
      type: 'info',
      category: 'SEO',
      message: `${h1s.length} عناوين H1 في الصفحة (يُفضل واحد)`,
    });
  }

  // فحص canonical
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    registerIssue({
      type: 'info',
      category: 'SEO',
      message: 'رابط canonical مفقود',
    });
  }
}

/**
 * فحص التخزين
 */
export function checkStorageIssues(): void {
  // فحص حجم localStorage
  let localStorageSize = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      localStorageSize += localStorage[key].length * 2; // UTF-16
    }
  }
  
  const localStorageMB = localStorageSize / 1024 / 1024;
  if (localStorageMB > 4) {
    registerIssue({
      type: 'warning',
      category: 'Storage',
      message: `localStorage ممتلئ: ${localStorageMB.toFixed(1)}MB`,
      details: 'قد يتسبب في أخطاء عند الإضافة',
    });
  }

  // فحص sessionStorage
  let sessionStorageSize = 0;
  for (const key in sessionStorage) {
    if (Object.prototype.hasOwnProperty.call(sessionStorage, key)) {
      sessionStorageSize += sessionStorage[key].length * 2;
    }
  }
  
  const sessionStorageMB = sessionStorageSize / 1024 / 1024;
  if (sessionStorageMB > 4) {
    registerIssue({
      type: 'warning',
      category: 'Storage',
      message: `sessionStorage ممتلئ: ${sessionStorageMB.toFixed(1)}MB`,
    });
  }

  // فحص الكوكيز
  const cookiesSize = document.cookie.length;
  if (cookiesSize > 4000) {
    registerIssue({
      type: 'warning',
      category: 'Storage',
      message: `حجم الكوكيز كبير: ${(cookiesSize/1024).toFixed(1)}KB`,
    });
  }
}
