/**
 * تكامل Sentry لتتبع الأخطاء في الإنتاج
 * يتم تهيئته فقط في بيئة الإنتاج
 */

// ملاحظة: يحتاج المستخدم لإضافة VITE_SENTRY_DSN في secrets
// استخدم: secrets--add_secret لإضافة SENTRY_DSN

interface SentryConfig {
  dsn?: string;
  environment: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

const IS_PROD = import.meta.env.PROD;
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

/**
 * تفعيل Sentry (سيتم تفعيله عندما يضيف المستخدم DSN)
 */
export function initSentry(): void {
  if (!IS_PROD || !SENTRY_DSN) {
    return;
  }

  import("@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    });
  });
}

/**
 * تتبع خطأ يدوياً
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!IS_PROD || !SENTRY_DSN) {
    return;
  }

  import("@sentry/react").then((Sentry) => {
    Sentry.captureException(error, {
      extra: context,
    });
  });
}

/**
 * تتبع رسالة مخصصة
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (!IS_PROD || !SENTRY_DSN) {
    return;
  }

  import("@sentry/react").then((Sentry) => {
    Sentry.captureMessage(message, level);
  });
}
