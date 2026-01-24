/**
 * أنواع مساعدة لـ TypeScript Strict Mode
 * تُستخدم لتحويل الأنواع وضمان أمان الأنواع
 */

/**
 * إزالة null من جميع خصائص الكائن بشكل عميق
 */
export type NonNullableDeep<T> = T extends object
  ? { [K in keyof T]: NonNullableDeep<NonNullable<T[K]>> }
  : NonNullable<T>;

/**
 * إزالة null من المستوى الأول فقط
 */
export type NonNullableShallow<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

/**
 * جعل جميع الخصائص إلزامية وغير nullable
 */
export type RequiredNonNullable<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

/**
 * جعل خصائص محددة إلزامية
 */
export type RequireKeys<T, K extends keyof T> = T & {
  [P in K]-?: NonNullable<T[P]>;
};

/**
 * جعل خصائص محددة اختيارية
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P];
};

/**
 * استخراج الخصائص غير الـ null
 */
export type NonNullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? never : K;
}[keyof T];

/**
 * استخراج الخصائص التي قد تكون null
 */
export type NullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? K : never;
}[keyof T];

/**
 * نوع القيمة المُرجعة من Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * نوع آمن للـ Array access
 */
export type SafeArrayAccess<T> = T | undefined;

/**
 * نوع النتيجة (نجاح أو فشل)
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * إنشاء نتيجة نجاح
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * إنشاء نتيجة فشل
 */
export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * نوع القيمة المُحققة (بعد التحقق من null)
 */
export interface Validated<T> {
  value: T;
  validated: true;
}

/**
 * تغليف قيمة كـ validated
 */
export function validated<T>(value: T): Validated<T> {
  return { value, validated: true };
}

/**
 * نوع البيانات من قاعدة البيانات (قد تحتوي null)
 */
export type DBRow<T> = {
  [K in keyof T]: T[K] | null;
};

/**
 * نوع البيانات بعد التحقق (بدون null للحقول المطلوبة)
 */
export type ValidatedRow<T, RequiredFields extends keyof T> = Omit<
  T,
  RequiredFields
> & {
  [K in RequiredFields]: NonNullable<T[K]>;
};

/**
 * نوع الخطأ المُهيكل
 */
export interface StructuredError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * إنشاء خطأ مُهيكل
 */
export function createError(
  code: string,
  message: string,
  field?: string,
  details?: Record<string, unknown>
): StructuredError {
  return { code, message, field, details };
}

/**
 * نوع الاستجابة من API
 */
export type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: StructuredError };

/**
 * نوع الصفحة من API
 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Type guard للتحقق من نجاح النتيجة
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard للتحقق من فشل النتيجة
 */
export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false;
}

/**
 * استخراج القيمة من النتيجة أو رمي الخطأ
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (isSuccess(result)) {
    return result.data;
  }
  throw result.error;
}

/**
 * استخراج القيمة من النتيجة أو إرجاع قيمة افتراضية
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (isSuccess(result)) {
    return result.data;
  }
  return defaultValue;
}
