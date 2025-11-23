/**
 * Web Vitals Monitoring
 * تتبع مؤشرات أداء الويب الأساسية
 */

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

const IS_PROD = import.meta.env.PROD;

/**
 * تهيئة Web Vitals monitoring
 */
export function initWebVitals(): void {
  if (!IS_PROD) {
    console.info('ℹ️ Web Vitals monitoring (development mode)');
  }

  // TODO: Uncomment when user adds web-vitals package
  /*
  import('web-vitals').then(({ onCLS, onFID, onLCP, onFCP, onTTFB }) => {
    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  });
  */
}

/**
 * إرسال metrics للتحليلات
 */
function sendToAnalytics(metric: Metric): void {
  const body = JSON.stringify(metric);
  
  if (IS_PROD) {
    // استخدم sendBeacon لإرسال بيانات الأداء بشكل موثوق
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', body);
    } else {
      fetch('/api/analytics', {
        body,
        method: 'POST',
        keepalive: true,
      });
    }
  } else {
    console.info(`📊 ${metric.name}:`, {
      value: `${metric.value.toFixed(2)}ms`,
      rating: metric.rating,
    });
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
  } else {
    console.info(`📊 ${metricName}: ${value.toFixed(2)}ms`);
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
