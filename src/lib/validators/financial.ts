/**
 * دوال التحقق المالي
 * تُستخدم للتحقق من صحة البيانات المالية في النظام
 */

import { requireExists, requireNotNull } from './null-guards';

/**
 * واجهة المبلغ المالي المُتحقق منه
 */
export interface ValidatedAmount {
  value: number;
  currency: string;
  formatted: string;
}

/**
 * واجهة نتيجة التحقق
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * التحقق من أن المبلغ موجب
 */
export function assertPositiveAmount(
  amount: number | null | undefined,
  fieldName = 'Amount'
): asserts amount is number {
  requireExists(amount, `${fieldName} is required`);
  if (amount <= 0) {
    throw new Error(`${fieldName} must be positive, got: ${amount}`);
  }
}

/**
 * التحقق من أن المبلغ غير سالب
 */
export function assertNonNegativeAmount(
  amount: number | null | undefined,
  fieldName = 'Amount'
): asserts amount is number {
  requireExists(amount, `${fieldName} is required`);
  if (amount < 0) {
    throw new Error(`${fieldName} cannot be negative, got: ${amount}`);
  }
}

/**
 * التحقق من صحة المبلغ المالي
 */
export function validateAmount(
  amount: number | null | undefined
): ValidationResult<number> {
  if (amount === null || amount === undefined) {
    return { success: false, error: 'Amount is required' };
  }
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { success: false, error: 'Amount must be a valid number' };
  }
  if (!isFinite(amount)) {
    return { success: false, error: 'Amount must be finite' };
  }
  return { success: true, data: amount };
}

/**
 * التحقق من صحة المبلغ الموجب
 */
export function validatePositiveAmount(
  amount: number | null | undefined
): ValidationResult<number> {
  const result = validateAmount(amount);
  if (!result.success) return result;
  
  if (result.data! <= 0) {
    return { success: false, error: 'Amount must be positive' };
  }
  return result;
}

/**
 * تقريب المبلغ لمنزلتين عشريتين
 */
export function roundAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * تنسيق المبلغ بالريال السعودي
 */
export function formatAmountSAR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '0.00 ر.س';
  }
  return `${roundAmount(amount).toLocaleString('ar-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ر.س`;
}

/**
 * التحقق من أن الرصيد كافٍ
 */
export function assertSufficientBalance(
  balance: number | null | undefined,
  requiredAmount: number,
  balanceName = 'Balance'
): asserts balance is number {
  requireExists(balance, `${balanceName} is required`);
  assertNonNegativeAmount(requiredAmount, 'Required amount');
  
  if (balance < requiredAmount) {
    throw new Error(
      `Insufficient ${balanceName}: ${formatAmountSAR(balance)} < ${formatAmountSAR(requiredAmount)}`
    );
  }
}

/**
 * التحقق من توازن القيد المحاسبي
 */
export function validateJournalBalance(
  totalDebits: number,
  totalCredits: number,
  tolerance = 0.01
): ValidationResult<{ debits: number; credits: number }> {
  const difference = Math.abs(totalDebits - totalCredits);
  
  if (difference > tolerance) {
    return {
      success: false,
      error: `Journal entry is not balanced. Debits: ${formatAmountSAR(totalDebits)}, Credits: ${formatAmountSAR(totalCredits)}, Difference: ${formatAmountSAR(difference)}`
    };
  }
  
  return {
    success: true,
    data: { debits: totalDebits, credits: totalCredits }
  };
}

/**
 * التحقق من صحة IBAN السعودي
 */
export function validateSaudiIBAN(iban: string | null | undefined): ValidationResult<string> {
  if (!iban) {
    return { success: false, error: 'IBAN is required' };
  }
  
  // إزالة المسافات وتحويل للأحرف الكبيرة
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // التحقق من الطول (24 حرف لـ IBAN السعودي)
  if (cleanIban.length !== 24) {
    return { success: false, error: 'Saudi IBAN must be 24 characters' };
  }
  
  // التحقق من البادئة
  if (!cleanIban.startsWith('SA')) {
    return { success: false, error: 'Saudi IBAN must start with SA' };
  }
  
  // التحقق من أن الباقي أرقام
  if (!/^SA\d{22}$/.test(cleanIban)) {
    return { success: false, error: 'Invalid Saudi IBAN format' };
  }
  
  return { success: true, data: cleanIban };
}

/**
 * التحقق من صحة رقم الهوية الوطنية السعودية
 */
export function validateSaudiNationalId(
  nationalId: string | null | undefined
): ValidationResult<string> {
  if (!nationalId) {
    return { success: false, error: 'National ID is required' };
  }
  
  // إزالة المسافات
  const cleanId = nationalId.replace(/\s/g, '');
  
  // التحقق من الطول (10 أرقام)
  if (cleanId.length !== 10) {
    return { success: false, error: 'National ID must be 10 digits' };
  }
  
  // التحقق من أنها أرقام فقط
  if (!/^\d{10}$/.test(cleanId)) {
    return { success: false, error: 'National ID must contain only digits' };
  }
  
  // التحقق من البادئة (1 للمواطنين، 2 للمقيمين)
  if (!['1', '2'].includes(cleanId[0])) {
    return { success: false, error: 'National ID must start with 1 or 2' };
  }
  
  return { success: true, data: cleanId };
}

/**
 * حساب النسبة المئوية بأمان
 */
export function calculatePercentage(
  part: number | null | undefined,
  total: number | null | undefined
): number {
  if (part === null || part === undefined || total === null || total === undefined) {
    return 0;
  }
  if (total === 0) {
    return 0;
  }
  return roundAmount((part / total) * 100);
}

/**
 * حساب حصة من المبلغ بناءً على النسبة
 */
export function calculateShare(
  totalAmount: number,
  percentage: number
): number {
  assertNonNegativeAmount(totalAmount, 'Total amount');
  if (percentage < 0 || percentage > 100) {
    throw new Error(`Percentage must be between 0 and 100, got: ${percentage}`);
  }
  return roundAmount((totalAmount * percentage) / 100);
}
