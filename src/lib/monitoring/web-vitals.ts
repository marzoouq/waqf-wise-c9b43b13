/**
 * Enhanced Web Vitals Monitoring
 * تتبع محسّن لمؤشرات أداء الويب الأساسية مع تقييم وتحليل متقدم
 */

interface VitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
}

const IS_PROD = import.meta.env.PROD;
const IS_DEV = import.meta.env.DEV;

// عتبات الأداء حسب معايير Google
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
};

/**
 * تقييم الأداء بناءً على القيمة والعتبات
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * تهيئة Web Vitals monitoring محسّن
 */
export function initWebVitals(): void {
  import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    onLCP((metric) => sendToAnalytics({ 
      ...metric, 
      rating: getRating('LCP', metric.value) 
    }));
    
    onCLS((metric) => sendToAnalytics({ 
      ...metric, 
      rating: getRating('CLS', metric.value) 
    }));
    
    onFCP((metric) => sendToAnalytics({ 
      ...metric, 
      rating: getRating('FCP', metric.value) 
    }));
    
    onTTFB((metric) => sendToAnalytics({ 
      ...metric, 
      rating: getRating('TTFB', metric.value) 
    }));
    
    onINP((metric) => sendToAnalytics({ 
      ...metric, 
      rating: getRating('INP', metric.value) 
    }));
  });
}

/**
 * إرسال metrics للتحليلات مع تحسينات
 */
function sendToAnalytics(metric: VitalsMetric): void {
  // طباعة في وضع التطوير للتصحيح
  if (IS_DEV) {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${emoji} ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
      delta: Math.round(metric.delta)
    });
  }
  
  if (IS_PROD) {
    const body = JSON.stringify({
      ...metric,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
    
    // استخدم sendBeacon لإرسال بيانات الأداء بشكل موثوق
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', body);
    } else {
      fetch('/api/analytics', {
        body,
        method: 'POST',
        keepalive: true,
      }).catch(() => {
        // تجاهل الأخطاء في إرسال التحليلات
      });
    }
  }
}

/**
 * تتبع أداء مخصص
 */
export function trackPerformance(metricName: string, value: number): void {
  if (IS_PROD) {
    sendToAnalytics({
      name: metricName,
      value,
      rating: 'good',
      delta: value,
      id: crypto.randomUUID(),
    });
  }
}

/**
 * قياس وقت تنفيذ دالة
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    trackPerformance(name, duration);
  }
}

/**
 * قياس وقت تنفيذ دالة متزامنة
 */
export function measure<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    const duration = performance.now() - start;
    trackPerformance(name, duration);
  }
}
