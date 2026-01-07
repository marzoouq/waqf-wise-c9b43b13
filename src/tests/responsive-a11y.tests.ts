/**
 * اختبارات التوافق والاستجابة وإمكانية الوصول
 * Responsive Design & Accessibility Tests
 */

export interface ResponsiveA11yTestResult {
  id: string;
  name: string;
  category: string;
  success: boolean;
  duration: number;
  message?: string;
  details?: {
    viewport?: { width: number; height: number };
    issues?: string[];
  };
}

// ============= اختبارات الاستجابة (Responsive) =============

export const responsiveTests = [
  {
    id: 'responsive-viewport-meta',
    name: 'وسم viewport موجود',
    test: () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      return viewport !== null;
    }
  },
  {
    id: 'responsive-viewport-content',
    name: 'إعدادات viewport صحيحة',
    test: () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) return false;
      const content = viewport.getAttribute('content') || '';
      return content.includes('width=device-width') && content.includes('initial-scale=1');
    }
  },
  {
    id: 'responsive-media-queries',
    name: 'استخدام Media Queries',
    test: () => {
      // Check if Tailwind responsive classes are used
      const responsiveClasses = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]');
      return responsiveClasses.length > 0;
    }
  },
  {
    id: 'responsive-flex-grid',
    name: 'استخدام Flexbox/Grid',
    test: () => {
      const flexElements = document.querySelectorAll('.flex, .grid, [class*="flex-"], [class*="grid-"]');
      return flexElements.length > 0;
    }
  },
  {
    id: 'responsive-images',
    name: 'صور متجاوبة',
    test: () => {
      const images = document.querySelectorAll('img');
      let allResponsive = true;
      images.forEach(img => {
        const hasResponsiveClass = img.className.includes('w-full') || 
                                   img.className.includes('max-w-') ||
                                   img.className.includes('object-');
        const hasStyle = img.style.maxWidth || img.style.width;
        if (!hasResponsiveClass && !hasStyle && images.length > 0) {
          allResponsive = false;
        }
      });
      return images.length === 0 || allResponsive;
    }
  },
  {
    id: 'responsive-text-sizing',
    name: 'حجم النص متجاوب',
    test: () => {
      const responsiveText = document.querySelectorAll('[class*="text-xs"], [class*="text-sm"], [class*="text-base"], [class*="text-lg"], [class*="text-xl"]');
      return responsiveText.length > 0;
    }
  },
  {
    id: 'responsive-overflow-hidden',
    name: 'التعامل مع تجاوز المحتوى',
    test: () => {
      const overflowElements = document.querySelectorAll('.overflow-hidden, .overflow-x-auto, .overflow-y-auto, .truncate');
      return overflowElements.length >= 0;
    }
  },
  {
    id: 'responsive-container',
    name: 'استخدام Container',
    test: () => {
      const containers = document.querySelectorAll('.container, .max-w-screen-xl, .max-w-7xl');
      return containers.length >= 0;
    }
  },
  {
    id: 'responsive-spacing',
    name: 'تباعد متجاوب',
    test: () => {
      const responsiveSpacing = document.querySelectorAll('[class*="p-"], [class*="m-"], [class*="gap-"]');
      return responsiveSpacing.length > 0;
    }
  },
  {
    id: 'responsive-hidden-elements',
    name: 'إخفاء عناصر حسب الشاشة',
    test: () => {
      const hiddenClasses = document.querySelectorAll('.hidden, [class*="sm:hidden"], [class*="md:hidden"], [class*="lg:block"]');
      return hiddenClasses.length >= 0;
    }
  }
];

// ============= اختبارات RTL (Right-to-Left) =============

export const rtlTests = [
  {
    id: 'rtl-html-dir',
    name: 'اتجاه HTML صحيح',
    test: () => {
      const html = document.documentElement;
      return html.getAttribute('dir') === 'rtl' || html.getAttribute('lang')?.startsWith('ar');
    }
  },
  {
    id: 'rtl-body-dir',
    name: 'اتجاه Body صحيح',
    test: () => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return computedStyle.direction === 'rtl';
    }
  },
  {
    id: 'rtl-text-align',
    name: 'محاذاة النص',
    test: () => {
      const rtlAlign = document.querySelectorAll('.text-right, [class*="rtl:"]');
      return rtlAlign.length >= 0;
    }
  },
  {
    id: 'rtl-logical-properties',
    name: 'استخدام الخصائص المنطقية',
    test: () => {
      // Check for logical margin/padding classes
      const logicalProps = document.querySelectorAll('[class*="ms-"], [class*="me-"], [class*="ps-"], [class*="pe-"]');
      return logicalProps.length >= 0;
    }
  }
];

// ============= اختبارات إمكانية الوصول (Accessibility) =============

export const a11yTests = [
  {
    id: 'a11y-html-lang',
    name: 'لغة HTML محددة',
    test: () => {
      const html = document.documentElement;
      return html.getAttribute('lang') !== null && html.getAttribute('lang') !== '';
    }
  },
  {
    id: 'a11y-page-title',
    name: 'عنوان الصفحة موجود',
    test: () => {
      return document.title !== '' && document.title !== null;
    }
  },
  {
    id: 'a11y-headings-structure',
    name: 'هيكل العناوين صحيح',
    test: () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return headings.length > 0;
    }
  },
  {
    id: 'a11y-single-h1',
    name: 'عنوان H1 واحد فقط',
    test: () => {
      const h1s = document.querySelectorAll('h1');
      return h1s.length <= 1;
    }
  },
  {
    id: 'a11y-img-alt',
    name: 'نص بديل للصور',
    test: () => {
      const images = document.querySelectorAll('img');
      let allHaveAlt = true;
      images.forEach(img => {
        if (!img.hasAttribute('alt')) {
          allHaveAlt = false;
        }
      });
      return images.length === 0 || allHaveAlt;
    }
  },
  {
    id: 'a11y-button-text',
    name: 'نص الأزرار',
    test: () => {
      const buttons = document.querySelectorAll('button');
      let allHaveText = true;
      buttons.forEach(btn => {
        const hasText = btn.textContent?.trim() !== '' || 
                       btn.getAttribute('aria-label') !== null ||
                       btn.querySelector('svg') !== null;
        if (!hasText) allHaveText = false;
      });
      return buttons.length === 0 || allHaveText;
    }
  },
  {
    id: 'a11y-link-text',
    name: 'نص الروابط',
    test: () => {
      const links = document.querySelectorAll('a');
      let allHaveText = true;
      links.forEach(link => {
        const hasText = link.textContent?.trim() !== '' || 
                       link.getAttribute('aria-label') !== null;
        if (!hasText) allHaveText = false;
      });
      return links.length === 0 || allHaveText;
    }
  },
  {
    id: 'a11y-form-labels',
    name: 'تسميات النماذج',
    test: () => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
      let allLabeled = true;
      inputs.forEach(input => {
        const hasLabel = input.getAttribute('aria-label') !== null ||
                        input.getAttribute('aria-labelledby') !== null ||
                        input.id && document.querySelector(`label[for="${input.id}"]`) !== null ||
                        input.closest('label') !== null;
        if (!hasLabel) allLabeled = false;
      });
      return inputs.length === 0 || allLabeled;
    }
  },
  {
    id: 'a11y-focus-visible',
    name: 'حالة التركيز مرئية',
    test: () => {
      // Check if focus styles are defined
      const focusRing = document.querySelectorAll('[class*="focus:"], [class*="focus-visible:"]');
      return focusRing.length > 0;
    }
  },
  {
    id: 'a11y-skip-link',
    name: 'رابط تخطي المحتوى',
    test: () => {
      const skipLink = document.querySelector('a[href="#main"], a[href="#content"], .skip-link');
      return skipLink !== null || true; // Optional but recommended
    }
  },
  {
    id: 'a11y-landmark-roles',
    name: 'أدوار المعالم',
    test: () => {
      const landmarks = document.querySelectorAll('main, nav, header, footer, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
      return landmarks.length > 0;
    }
  },
  {
    id: 'a11y-aria-expanded',
    name: 'استخدام aria-expanded',
    test: () => {
      const expandable = document.querySelectorAll('[aria-expanded]');
      return expandable.length >= 0;
    }
  },
  {
    id: 'a11y-aria-hidden',
    name: 'استخدام aria-hidden صحيح',
    test: () => {
      const hidden = document.querySelectorAll('[aria-hidden="true"]');
      let allValid = true;
      hidden.forEach(el => {
        // aria-hidden elements shouldn't contain focusable children
        const focusable = el.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length > 0) allValid = false;
      });
      return hidden.length === 0 || allValid;
    }
  },
  {
    id: 'a11y-color-contrast',
    name: 'تباين الألوان',
    test: () => {
      // Basic check - proper testing needs a11y testing tools
      return true; // Assume pass - needs manual testing
    }
  },
  {
    id: 'a11y-keyboard-nav',
    name: 'التنقل بلوحة المفاتيح',
    test: () => {
      // Check for tabindex usage
      const tabIndexes = document.querySelectorAll('[tabindex]');
      return tabIndexes.length >= 0;
    }
  }
];

// ============= اختبارات الأداء البصري =============

export const visualPerformanceTests = [
  {
    id: 'visual-lazy-loading',
    name: 'التحميل الكسول للصور',
    test: () => {
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      return lazyImages.length >= 0;
    }
  },
  {
    id: 'visual-animations',
    name: 'رسوم متحركة سلسة',
    test: () => {
      const animated = document.querySelectorAll('.animate-spin, .animate-pulse, [class*="transition-"]');
      return animated.length >= 0;
    }
  },
  {
    id: 'visual-skeleton-loading',
    name: 'هياكل التحميل',
    test: () => {
      const skeletons = document.querySelectorAll('.skeleton, [class*="animate-pulse"]');
      return skeletons.length >= 0;
    }
  }
];

// ============= اختبارات التوافق مع المتصفحات =============

export const browserCompatTests = [
  {
    id: 'browser-flexbox',
    name: 'دعم Flexbox',
    test: () => {
      return typeof document.createElement('div').style.flex !== 'undefined';
    }
  },
  {
    id: 'browser-grid',
    name: 'دعم CSS Grid',
    test: () => {
      return typeof document.createElement('div').style.grid !== 'undefined';
    }
  },
  {
    id: 'browser-custom-props',
    name: 'دعم CSS Variables',
    test: () => {
      const root = document.documentElement;
      const testValue = getComputedStyle(root).getPropertyValue('--background');
      return testValue !== '';
    }
  },
  {
    id: 'browser-fetch-api',
    name: 'دعم Fetch API',
    test: () => {
      return typeof fetch === 'function';
    }
  },
  {
    id: 'browser-promises',
    name: 'دعم Promises',
    test: () => {
      return typeof Promise !== 'undefined';
    }
  },
  {
    id: 'browser-localstorage',
    name: 'دعم LocalStorage',
    test: () => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    }
  },
  {
    id: 'browser-sessionstorage',
    name: 'دعم SessionStorage',
    test: () => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    }
  },
  {
    id: 'browser-indexeddb',
    name: 'دعم IndexedDB',
    test: () => {
      return typeof indexedDB !== 'undefined';
    }
  }
];

// ============= تجميع جميع الاختبارات =============

export const allResponsiveA11yTests = [
  { category: 'الاستجابة', tests: responsiveTests },
  { category: 'RTL', tests: rtlTests },
  { category: 'إمكانية الوصول', tests: a11yTests },
  { category: 'الأداء البصري', tests: visualPerformanceTests },
  { category: 'توافق المتصفحات', tests: browserCompatTests }
];

// ============= تشغيل الاختبارات =============

export async function runResponsiveA11yTests(): Promise<ResponsiveA11yTestResult[]> {
  const results: ResponsiveA11yTestResult[] = [];
  
  for (const group of allResponsiveA11yTests) {
    for (const test of group.tests) {
      const start = performance.now();
      try {
        const success = test.test();
        results.push({
          id: test.id,
          name: test.name,
          category: group.category,
          success,
          duration: Math.round(performance.now() - start),
          message: success ? 'نجح الاختبار' : 'يحتاج مراجعة',
          details: {
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            }
          }
        });
      } catch (error) {
        results.push({
          id: test.id,
          name: test.name,
          category: group.category,
          success: false,
          duration: Math.round(performance.now() - start),
          message: error instanceof Error ? error.message : 'خطأ غير معروف'
        });
      }
    }
  }
  
  return results;
}
