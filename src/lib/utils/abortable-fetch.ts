/**
 * Abortable Fetch Utility
 * يوفر fetch مع دعم AbortController و timeout تلقائي
 * لمنع memory leaks والطلبات العالقة
 */

export interface AbortableFetchOptions extends RequestInit {
  timeout?: number; // timeout بالميلي ثانية (افتراضي: 30 ثانية)
}

/**
 * إنشاء AbortController مع timeout تلقائي
 */
export function createAbortController(timeout: number = 30000): {
  controller: AbortController;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return {
    controller,
    cleanup: () => clearTimeout(timeoutId),
  };
}

/**
 * fetch مع دعم AbortController و timeout
 * @param url - رابط الطلب
 * @param options - خيارات الطلب مع timeout اختياري
 * @returns Promise بالبيانات
 */
export async function abortableFetch<T>(
  url: string,
  options: AbortableFetchOptions = {}
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options;
  const { controller, cleanup } = createAbortController(timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return await response.json();
  } finally {
    cleanup();
  }
}

/**
 * fetch مع AbortController خارجي (للإلغاء اليدوي)
 */
export async function abortableFetchWithController<T>(
  url: string,
  controller: AbortController,
  options: Omit<RequestInit, 'signal'> = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return await response.json();
}
