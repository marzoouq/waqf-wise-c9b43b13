/**
 * خدمة التحقق من صحة البيانات البنكية
 */

interface IBANValidationResult {
  valid: boolean;
  country: string;
  bank: string;
  errors: string[];
}

export class BankValidationService {
  /**
   * التحقق من صحة IBAN
   */
  static validateIBAN(iban: string): IBANValidationResult {
    const errors: string[] = [];
    let valid = true;
    let country = '';
    let bank = '';

    // إزالة المسافات
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();

    // التحقق من الطول
    if (cleanIBAN.length < 15 || cleanIBAN.length > 34) {
      errors.push('طول IBAN غير صحيح');
      valid = false;
    }

    // التحقق من رمز الدولة (أول حرفين)
    const countryCode = cleanIBAN.substring(0, 2);
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      errors.push('رمز الدولة غير صحيح');
      valid = false;
    } else {
      country = this.getCountryName(countryCode);
    }

    // التحقق من IBAN السعودي (SA)
    if (countryCode === 'SA') {
      if (cleanIBAN.length !== 24) {
        errors.push('IBAN سعودي يجب أن يكون 24 حرف');
        valid = false;
      }

      // استخراج رمز البنك (4 أحرف بعد SA00)
      const bankCode = cleanIBAN.substring(4, 6);
      bank = this.getSaudiBankName(bankCode);

      // التحقق من رقم التحقق (IBAN Check Digits)
      if (!this.validateIBANChecksum(cleanIBAN)) {
        errors.push('رقم التحقق (Check Digit) غير صحيح');
        valid = false;
      }
    }

    return {
      valid,
      country,
      bank,
      errors,
    };
  }

  /**
   * التحقق من رقم الحساب البنكي
   */
  static validateAccountNumber(accountNumber: string, bankCode: string): boolean {
    const cleanNumber = accountNumber.replace(/\s/g, '');

    // التحقق من أن جميع الأحرف أرقام
    if (!/^\d+$/.test(cleanNumber)) {
      return false;
    }

    // حسب البنك، لكل بنك متطلبات مختلفة
    switch (bankCode) {
      case '10': // الراجحي
        return cleanNumber.length >= 12 && cleanNumber.length <= 16;
      case '05': // الأهلي
        return cleanNumber.length >= 10 && cleanNumber.length <= 14;
      case '15': // الرياض
        return cleanNumber.length >= 10 && cleanNumber.length <= 15;
      default:
        return cleanNumber.length >= 10 && cleanNumber.length <= 20;
    }
  }

  /**
   * التحقق من القائمة السوداء (محاكاة - في الواقع يجب الاتصال بـ API)
   */
  static async checkBlacklist(iban: string): Promise<boolean> {
    // محاكاة - في الإنتاج يجب الاتصال بقاعدة بيانات أو API
    const blacklist = [
      'SA0000000000000000000001', // IBAN وهمي للاختبار
    ];

    return blacklist.includes(iban.replace(/\s/g, '').toUpperCase());
  }

  /**
   * الحصول على اسم الدولة من رمزها
   */
  private static getCountryName(code: string): string {
    const countries: Record<string, string> = {
      SA: 'السعودية',
      AE: 'الإمارات',
      BH: 'البحرين',
      KW: 'الكويت',
      OM: 'عُمان',
      QA: 'قطر',
      JO: 'الأردن',
      EG: 'مصر',
      GB: 'بريطانيا',
      US: 'أمريكا',
      DE: 'ألمانيا',
      FR: 'فرنسا',
    };

    return countries[code] || code;
  }

  /**
   * الحصول على اسم البنك السعودي من رمزه
   */
  private static getSaudiBankName(code: string): string {
    const banks: Record<string, string> = {
      '05': 'البنك الأهلي السعودي',
      '10': 'بنك الراجحي',
      '15': 'بنك الرياض',
      '20': 'بنك ساب',
      '30': 'البنك السعودي البريطاني',
      '40': 'البنك السعودي الفرنسي',
      '45': 'البنك السعودي الهولندي',
      '50': 'مصرف الإنماء',
      '55': 'بنك البلاد',
      '60': 'البنك الأول',
      '65': 'بنك الجزيرة',
      '71': 'مصرف الراجحي',
      '75': 'البنك الأهلي التجاري',
      '80': 'البنك العربي الوطني',
      '85': 'بنك الاستثمار',
    };

    return banks[code] || `بنك ${code}`;
  }

  /**
   * التحقق من Checksum لـ IBAN
   */
  private static validateIBANChecksum(iban: string): boolean {
    // خوارزمية MOD 97 للتحقق من IBAN
    const rearranged = iban.substring(4) + iban.substring(0, 4);
    const numericString = rearranged.replace(/[A-Z]/g, (char) =>
      (char.charCodeAt(0) - 55).toString()
    );

    // حساب MOD 97
    let remainder = '';
    for (let i = 0; i < numericString.length; i++) {
      remainder += numericString[i];
      if (remainder.length >= 9) {
        remainder = (parseInt(remainder) % 97).toString();
      }
    }

    const finalRemainder = parseInt(remainder) % 97;
    return finalRemainder === 1;
  }

  /**
   * تنسيق IBAN للعرض (مع مسافات)
   */
  static formatIBAN(iban: string): string {
    const clean = iban.replace(/\s/g, '').toUpperCase();
    return clean.match(/.{1,4}/g)?.join(' ') || clean;
  }

  /**
   * التحقق الشامل (IBAN + القائمة السوداء)
   */
  static async validateComplete(iban: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    info: {
      country: string;
      bank: string;
      formatted: string;
    };
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // التحقق من IBAN
    const ibanCheck = this.validateIBAN(iban);
    if (!ibanCheck.valid) {
      errors.push(...ibanCheck.errors);
    }

    // التحقق من القائمة السوداء
    const isBlacklisted = await this.checkBlacklist(iban);
    if (isBlacklisted) {
      errors.push('هذا الحساب موجود في القائمة السوداء');
    }

    // تحذيرات إضافية
    if (ibanCheck.country && ibanCheck.country !== 'السعودية') {
      warnings.push('الحساب البنكي خارج السعودية - قد تتطلب رسوم إضافية');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info: {
        country: ibanCheck.country,
        bank: ibanCheck.bank,
        formatted: this.formatIBAN(iban),
      },
    };
  }
}
