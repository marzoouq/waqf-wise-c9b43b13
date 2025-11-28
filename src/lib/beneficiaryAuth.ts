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
 * توليد كلمة مرور قوية وعشوائية باستخدام Crypto API
 * هذه الدالة تولّد كلمات مرور لن تكون موجودة في قوائم التسريبات
 * @returns كلمة مرور آمنة (20 حرف)
 */
export function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // بدون I, O
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'; // بدون i, l, o
  const numbers = '23456789'; // بدون 0, 1
  const symbols = '!@#$%^&*_+-=';
  
  // استخدام Crypto API للعشوائية الآمنة
  const getSecureRandom = (max: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  };
  
  // ضمان وجود حرف من كل نوع (4 أحرف)
  let password = '';
  password += uppercase[getSecureRandom(uppercase.length)];
  password += lowercase[getSecureRandom(lowercase.length)];
  password += numbers[getSecureRandom(numbers.length)];
  password += symbols[getSecureRandom(symbols.length)];
  
  // إضافة طابع زمني مشفر لضمان التفرد (6 أحرف)
  const timestamp = Date.now().toString(36).slice(-6);
  password += timestamp;
  
  // إكمال باقي الـ 10 أحرف عشوائية
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 0; i < 10; i++) {
    password += allChars[getSecureRandom(allChars.length)];
  }
  
  // خلط الأحرف باستخدام Fisher-Yates shuffle مع crypto
  const chars = password.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = getSecureRandom(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  
  return chars.join('');
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
