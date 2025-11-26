/**
 * مساعدات آمنة للعمل مع المصفوفات
 * تمنع أخطاء "Cannot read properties of undefined"
 */

/**
 * فلترة آمنة - تتحقق من وجود المصفوفة قبل الفلترة
 */
export function safeFilter<T>(
  array: T[] | null | undefined,
  predicate: (value: T, index: number, array: T[]) => boolean
): T[] {
  if (!array || !Array.isArray(array)) {
    return [];
  }
  return array.filter(predicate);
}

/**
 * خريطة آمنة - تتحقق من وجود المصفوفة قبل التحويل
 */
export function safeMap<T, U>(
  array: T[] | null | undefined,
  callback: (value: T, index: number, array: T[]) => U
): U[] {
  if (!array || !Array.isArray(array)) {
    return [];
  }
  return array.map(callback);
}

/**
 * بحث آمن - تتحقق من وجود المصفوفة قبل البحث
 */
export function safeFind<T>(
  array: T[] | null | undefined,
  predicate: (value: T, index: number, array: T[]) => boolean
): T | undefined {
  if (!array || !Array.isArray(array)) {
    return undefined;
  }
  return array.find(predicate);
}

/**
 * طول آمن - تحصل على طول المصفوفة بشكل آمن
 */
export function safeLength(array: unknown[] | null | undefined): number {
  if (!array || !Array.isArray(array)) {
    return 0;
  }
  return array.length;
}

/**
 * ترتيب آمن - ترتب المصفوفة بشكل آمن
 */
export function safeSort<T>(
  array: T[] | null | undefined,
  compareFn?: (a: T, b: T) => number
): T[] {
  if (!array || !Array.isArray(array)) {
    return [];
  }
  return [...array].sort(compareFn);
}

/**
 * تقليل آمن - يطبق reduce بشكل آمن
 */
export function safeReduce<T, U>(
  array: T[] | null | undefined,
  callback: (accumulator: U, currentValue: T, currentIndex: number, array: T[]) => U,
  initialValue: U
): U {
  if (!array || !Array.isArray(array)) {
    return initialValue;
  }
  return array.reduce(callback, initialValue);
}

/**
 * تحقق من أن القيمة مصفوفة
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * تحويل آمن إلى مصفوفة
 */
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
