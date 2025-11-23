/**
 * دوال التحقق من البيانات
 */

/**
 * التحقق من رقم الهوية الوطنية السعودية
 */
export function isValidSaudiId(id: string): boolean {
  const cleaned = id.replace(/\D/g, '');
  
  if (cleaned.length !== 10) return false;
  
  // التحقق من أن الرقم يبدأ بـ 1 أو 2
  if (!['1', '2'].includes(cleaned[0])) return false;
  
  return true;
}

/**
 * التحقق من رقم الإقامة
 */
export function isValidIqamaNumber(iqama: string): boolean {
  const cleaned = iqama.replace(/\D/g, '');
  
  if (cleaned.length !== 10) return false;
  
  // رقم الإقامة يجب أن يبدأ بـ 3 أو 4
  if (!['3', '4'].includes(cleaned[0])) return false;
  
  return true;
}

/**
 * التحقق من رقم الهاتف السعودي
 */
export function isValidSaudiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  
  // يجب أن يبدأ بـ 05 ويكون طوله 10 أرقام
  if (cleaned.length !== 10) return false;
  if (!cleaned.startsWith('05')) return false;
  
  return true;
}

/**
 * التحقق من البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من رقم الآيبان السعودي
 */
export function isValidSaudiIban(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '');
  
  // الآيبان السعودي يبدأ بـ SA ويتكون من 24 حرف
  if (cleaned.length !== 24) return false;
  if (!cleaned.startsWith('SA')) return false;
  
  return true;
}

/**
 * التحقق من أن القيمة رقم موجب
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0;
}

/**
 * التحقق من أن القيمة في نطاق معين
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * التحقق من أن التاريخ صالح
 */
export function isValidDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * التحقق من أن التاريخ في المستقبل
 */
export function isFutureDate(date: string | Date): boolean {
  if (!isValidDate(date)) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * التحقق من أن النص ليس فارغاً
 */
export function isNotEmpty(text: string): boolean {
  return text.trim().length > 0;
}
