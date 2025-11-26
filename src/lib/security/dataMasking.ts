/**
 * نظام Masking للبيانات الحساسة
 * يُستخدم لإخفاء البيانات الحساسة في العرض والسجلات
 */

/**
 * إخفاء IBAN - يعرض آخر 4 أرقام فقط
 * @example SA4420000001234567891234 => SA********************1234
 */
export function maskIBAN(iban: string | null | undefined): string {
  if (!iban) return '****';
  
  const cleanIBAN = iban.replace(/\s/g, '');
  if (cleanIBAN.length < 8) return '****';
  
  const country = cleanIBAN.substring(0, 2);
  const lastFour = cleanIBAN.substring(cleanIBAN.length - 4);
  const maskedMiddle = '*'.repeat(cleanIBAN.length - 6);
  
  return `${country}${maskedMiddle}${lastFour}`;
}

/**
 * إخفاء رقم الهوية - يعرض آخر 4 أرقام فقط
 * @example 1234567890 => ******7890
 */
export function maskNationalID(nationalId: string | null | undefined): string {
  if (!nationalId) return '****';
  
  if (nationalId.length < 4) return '****';
  
  const lastFour = nationalId.substring(nationalId.length - 4);
  const maskedPart = '*'.repeat(nationalId.length - 4);
  
  return `${maskedPart}${lastFour}`;
}

/**
 * إخفاء رقم الهاتف - يعرض آخر 4 أرقام فقط
 * @example +966501234567 => +966******4567
 */
export function maskPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '****';
  
  const cleanPhone = phone.replace(/\s|-/g, '');
  if (cleanPhone.length < 4) return '****';
  
  const countryCode = cleanPhone.match(/^\+\d{1,3}/)?.[0] || '';
  const lastFour = cleanPhone.substring(cleanPhone.length - 4);
  const maskedLength = cleanPhone.length - countryCode.length - 4;
  const maskedPart = '*'.repeat(Math.max(maskedLength, 4));
  
  return `${countryCode}${maskedPart}${lastFour}`;
}

/**
 * إخفاء البريد الإلكتروني - يعرض أول حرفين وآخر حرفين قبل @
 * @example john.doe@example.com => jo******oe@example.com
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '****';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '****';
  
  if (localPart.length <= 4) {
    return `****@${domain}`;
  }
  
  const firstTwo = localPart.substring(0, 2);
  const lastTwo = localPart.substring(localPart.length - 2);
  const maskedPart = '*'.repeat(localPart.length - 4);
  
  return `${firstTwo}${maskedPart}${lastTwo}@${domain}`;
}

/**
 * إخفاء رقم الحساب البنكي
 * @example 1234567890123456 => ****5678****3456
 */
export function maskBankAccount(accountNumber: string | null | undefined): string {
  if (!accountNumber) return '****';
  
  const cleanAccount = accountNumber.replace(/\s|-/g, '');
  if (cleanAccount.length < 8) return '****';
  
  const firstPart = cleanAccount.substring(0, 4);
  const middlePart = cleanAccount.substring(4, cleanAccount.length - 4);
  const lastPart = cleanAccount.substring(cleanAccount.length - 4);
  
  return `${firstPart}${'*'.repeat(middlePart.length)}${lastPart}`;
}

/**
 * إخفاء كلمة المرور بالكامل
 */
export function maskPassword(): string {
  return '••••••••';
}

/**
 * إخفاء البيانات الحساسة في كائن
 * يُستخدم في السجلات والـ audit logs
 */
export function maskSensitiveData<T extends Record<string, any>>(
  data: T,
  sensitiveFields: string[] = ['iban', 'national_id', 'phone', 'email', 'password', 'bank_account_number']
): Partial<T> {
  const masked: Record<string, any> = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in masked) {
      if (field === 'iban') {
        masked[field] = maskIBAN(masked[field] as string);
      } else if (field === 'national_id') {
        masked[field] = maskNationalID(masked[field] as string);
      } else if (field === 'phone') {
        masked[field] = maskPhoneNumber(masked[field] as string);
      } else if (field === 'email') {
        masked[field] = maskEmail(masked[field] as string);
      } else if (field === 'password') {
        masked[field] = maskPassword();
      } else if (field === 'bank_account_number') {
        masked[field] = maskBankAccount(masked[field] as string);
      } else {
        // حقل حساس آخر - إخفاء كامل
        masked[field] = '****';
      }
    }
  }
  
  return masked as Partial<T>;
}

/**
 * التحقق مما إذا كان الحقل حساساً
 */
export function isSensitiveField(fieldName: string): boolean {
  const sensitiveKeywords = [
    'password',
    'secret',
    'token',
    'key',
    'iban',
    'national_id',
    'id_number',
    'ssn',
    'credit_card',
    'cvv',
    'pin',
    'bank_account',
  ];
  
  const lowerFieldName = fieldName.toLowerCase();
  return sensitiveKeywords.some(keyword => lowerFieldName.includes(keyword));
}

/**
 * إخفاء تلقائي لأي بيانات في كائن
 * يبحث عن الحقول الحساسة ويخفيها
 */
export function autoMaskObject<T extends Record<string, any>>(data: T): Partial<T> {
  const masked: Record<string, any> = { ...data };
  
  for (const key in masked) {
    if (isSensitiveField(key)) {
      if (key.includes('iban')) {
        masked[key] = maskIBAN(masked[key] as string);
      } else if (key.includes('national') || key.includes('id_number')) {
        masked[key] = maskNationalID(masked[key] as string);
      } else if (key.includes('phone') || key.includes('mobile')) {
        masked[key] = maskPhoneNumber(masked[key] as string);
      } else if (key.includes('email')) {
        masked[key] = maskEmail(masked[key] as string);
      } else if (key.includes('password') || key.includes('secret')) {
        masked[key] = maskPassword();
      } else if (key.includes('account')) {
        masked[key] = maskBankAccount(masked[key] as string);
      } else {
        masked[key] = '****';
      }
    }
  }
  
  return masked as Partial<T>;
}
