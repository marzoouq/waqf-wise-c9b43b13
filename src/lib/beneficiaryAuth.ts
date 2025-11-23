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
 * توليد كلمة مرور قوية وعشوائية
 * @returns كلمة مرور آمنة (16 حرف)
 */
export function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  // ضمان وجود حرف من كل نوع
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // إكمال باقي الـ 12 حرف
  for (let i = 0; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // خلط الأحرف
  return password.split('').sort(() => Math.random() - 0.5).join('');
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
