/**
 * Beneficiary Authentication Helper Functions
 * تحويل رقم الهوية الوطنية إلى بريد إلكتروني داخلي للمصادقة
 */

/**
 * تحويل رقم الهوية الوطنية إلى بريد إلكتروني داخلي
 * @param nationalId رقم الهوية (10 أرقام)
 * @returns البريد الإلكتروني الداخلي
 */
export function nationalIdToEmail(nationalId: string): string {
  return `${nationalId}@waqf.internal`;
}

/**
 * التحقق من صحة رقم الهوية الوطنية
 * @param nationalId رقم الهوية
 * @returns true إذا كان الرقم صحيح (10 أرقام)
 */
export function validateNationalId(nationalId: string): boolean {
  return /^\d{10}$/.test(nationalId);
}

/**
 * توليد كلمة مرور مؤقتة من رقم الهوية
 * @param nationalId رقم الهوية
 * @returns كلمة المرور المؤقتة
 */
export function generateTempPassword(nationalId: string): string {
  return `${nationalId}@Waqf`;
}

/**
 * استخراج رقم الهوية من البريد الإلكتروني الداخلي
 * @param email البريد الإلكتروني
 * @returns رقم الهوية أو null
 */
export function emailToNationalId(email: string): string | null {
  if (!email.endsWith('@waqf.internal')) return null;
  const nationalId = email.replace('@waqf.internal', '');
  return validateNationalId(nationalId) ? nationalId : null;
}
