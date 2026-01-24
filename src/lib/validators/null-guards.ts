/**
 * دوال التحقق من القيم الفارغة (Null Guards)
 * تُستخدم لضمان أمان الأنواع في TypeScript Strict Mode
 */

/**
 * التحقق من أن القيمة ليست null
 * @throws Error إذا كانت القيمة null
 */
export function assertNotNull<T>(
  value: T | null,
  message = 'Value cannot be null'
): asserts value is T {
  if (value === null) {
    throw new Error(message);
  }
}

/**
 * التحقق من أن القيمة ليست undefined
 * @throws Error إذا كانت القيمة undefined
 */
export function assertDefined<T>(
  value: T | undefined,
  message = 'Value cannot be undefined'
): asserts value is T {
  if (value === undefined) {
    throw new Error(message);
  }
}

/**
 * التحقق من أن القيمة موجودة (ليست null أو undefined)
 * @throws Error إذا كانت القيمة null أو undefined
 */
export function assertExists<T>(
  value: T | null | undefined,
  message = 'Value must exist'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * التحقق من أن القيمة ليست null مع إرجاع القيمة
 * @returns القيمة إذا لم تكن null
 * @throws Error إذا كانت القيمة null
 */
export function requireNotNull<T>(
  value: T | null,
  message = 'Value cannot be null'
): T {
  if (value === null) {
    throw new Error(message);
  }
  return value;
}

/**
 * التحقق من أن القيمة موجودة مع إرجاع القيمة
 * @returns القيمة إذا كانت موجودة
 * @throws Error إذا كانت القيمة null أو undefined
 */
export function requireExists<T>(
  value: T | null | undefined,
  message = 'Value must exist'
): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
}

/**
 * تحويل القيمة إلى قيمة افتراضية إذا كانت null
 */
export function withDefault<T>(value: T | null, defaultValue: T): T {
  return value === null ? defaultValue : value;
}

/**
 * تحويل القيمة إلى قيمة افتراضية إذا كانت null أو undefined
 */
export function withDefaultValue<T>(
  value: T | null | undefined,
  defaultValue: T
): T {
  return value === null || value === undefined ? defaultValue : value;
}

/**
 * التحقق من أن القيمة هي نوع معين
 */
export function isOfType<T>(
  value: unknown,
  check: (value: unknown) => value is T
): value is T {
  return check(value);
}

/**
 * Type guard للتحقق من أن القيمة ليست null
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Type guard للتحقق من أن القيمة ليست undefined
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Type guard للتحقق من أن القيمة موجودة
 */
export function exists<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * تصفية المصفوفة من القيم الفارغة
 */
export function filterNulls<T>(array: (T | null)[]): T[] {
  return array.filter(isNotNull);
}

/**
 * تصفية المصفوفة من القيم غير الموجودة
 */
export function filterNullish<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(exists);
}

/**
 * الوصول الآمن للخصائص المتداخلة
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K
): T[K] | undefined {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  return obj[key];
}

/**
 * الوصول الآمن للخصائص المتداخلة مع قيمة افتراضية
 */
export function safeGetWithDefault<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K]
): T[K] {
  if (obj === null || obj === undefined) {
    return defaultValue;
  }
  return obj[key] ?? defaultValue;
}
