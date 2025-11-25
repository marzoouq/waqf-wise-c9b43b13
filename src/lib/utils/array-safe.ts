/**
 * Safe Array Operations
 * عمليات آمنة على المصفوفات لمنع أخطاء undefined/null
 */

/**
 * Filter آمن يتحقق من وجود المصفوفة أولاً
 */
export function safeFilter<T>(
  array: T[] | undefined | null,
  predicate: (value: T, index: number, array: T[]) => boolean
): T[] {
  if (!Array.isArray(array)) {
    return [];
  }
  return array.filter(predicate);
}

/**
 * Map آمن يتحقق من وجود المصفوفة أولاً
 */
export function safeMap<T, U>(
  array: T[] | undefined | null,
  callback: (value: T, index: number, array: T[]) => U
): U[] {
  if (!Array.isArray(array)) {
    return [];
  }
  return array.map(callback);
}

/**
 * Find آمن يتحقق من وجود المصفوفة أولاً
 */
export function safeFind<T>(
  array: T[] | undefined | null,
  predicate: (value: T, index: number, array: T[]) => boolean
): T | undefined {
  if (!Array.isArray(array)) {
    return undefined;
  }
  return array.find(predicate);
}

/**
 * Sort آمن يتحقق من وجود المصفوفة أولاً
 */
export function safeSort<T>(
  array: T[] | undefined | null,
  compareFn?: (a: T, b: T) => number
): T[] {
  if (!Array.isArray(array)) {
    return [];
  }
  return [...array].sort(compareFn);
}

/**
 * Slice آمن يتحقق من وجود المصفوفة أولاً
 */
export function safeSlice<T>(
  array: T[] | undefined | null,
  start?: number,
  end?: number
): T[] {
  if (!Array.isArray(array)) {
    return [];
  }
  return array.slice(start, end);
}

/**
 * Reduce آمن يتحقق من وجود المصفوفة أولاً
 */
export function safeReduce<T, U>(
  array: T[] | undefined | null,
  callback: (accumulator: U, currentValue: T, currentIndex: number, array: T[]) => U,
  initialValue: U
): U {
  if (!Array.isArray(array)) {
    return initialValue;
  }
  return array.reduce(callback, initialValue);
}

/**
 * Some آمن يتحقق من وجود المصفوفة أولاً
 */
export function safeSome<T>(
  array: T[] | undefined | null,
  predicate: (value: T, index: number, array: T[]) => boolean
): boolean {
  if (!Array.isArray(array)) {
    return false;
  }
  return array.some(predicate);
}

/**
 * Every آمن يتحقق من وجود المصفوفة أولاً
 */
export function safeEvery<T>(
  array: T[] | undefined | null,
  predicate: (value: T, index: number, array: T[]) => boolean
): boolean {
  if (!Array.isArray(array)) {
    return true;
  }
  return array.every(predicate);
}

/**
 * Length آمن يعيد 0 إذا لم تكن مصفوفة
 */
export function safeLength(array: unknown[] | undefined | null): number {
  if (!Array.isArray(array)) {
    return 0;
  }
  return array.length;
}

/**
 * تحقق من أن القيمة مصفوفة صالحة
 */
export function isValidArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value !== null && value !== undefined;
}

/**
 * ضمان أن القيمة مصفوفة (تحويل إلى مصفوفة فارغة إذا لم تكن)
 */
export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [value];
}
