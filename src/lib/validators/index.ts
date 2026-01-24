/**
 * مصدرات دوال التحقق
 * نقطة الدخول الموحدة لجميع دوال التحقق
 */

// دوال التحقق من القيم الفارغة
export {
  assertNotNull,
  assertDefined,
  assertExists,
  requireNotNull,
  requireExists,
  withDefault,
  withDefaultValue,
  isOfType,
  isNotNull,
  isDefined,
  exists,
  filterNulls,
  filterNullish,
  safeGet,
  safeGetWithDefault,
} from './null-guards';

// دوال التحقق المالي
export {
  type ValidatedAmount,
  type ValidationResult,
  assertPositiveAmount,
  assertNonNegativeAmount,
  validateAmount,
  validatePositiveAmount,
  roundAmount,
  formatAmountSAR,
  assertSufficientBalance,
  validateJournalBalance,
  validateSaudiIBAN,
  validateSaudiNationalId,
  calculatePercentage,
  calculateShare,
} from './financial';
