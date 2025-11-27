import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// اختبار أنماط التحقق الأساسية
describe('Validation Schemas', () => {
  describe('Email Validation', () => {
    const emailSchema = z.string().email();

    it('يجب أن يقبل البريد الإلكتروني الصحيح', () => {
      expect(() => emailSchema.parse('test@example.com')).not.toThrow();
      expect(() => emailSchema.parse('user.name@domain.sa')).not.toThrow();
    });

    it('يجب أن يرفض البريد الإلكتروني غير الصحيح', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow();
      expect(() => emailSchema.parse('missing@')).toThrow();
      expect(() => emailSchema.parse('@nodomain.com')).toThrow();
    });
  });

  describe('Phone Validation', () => {
    const phoneSchema = z.string().regex(/^(05|5)\d{8}$/, 'رقم الجوال غير صحيح');

    it('يجب أن يقبل أرقام الجوال السعودية الصحيحة', () => {
      expect(() => phoneSchema.parse('0501234567')).not.toThrow();
      expect(() => phoneSchema.parse('0551234567')).not.toThrow();
      expect(() => phoneSchema.parse('5501234567')).not.toThrow();
    });

    it('يجب أن يرفض أرقام الجوال غير الصحيحة', () => {
      expect(() => phoneSchema.parse('123456789')).toThrow();
      expect(() => phoneSchema.parse('0601234567')).toThrow();
      expect(() => phoneSchema.parse('050123456')).toThrow(); // قصير جداً
    });
  });

  describe('National ID Validation', () => {
    const nationalIdSchema = z.string().regex(/^[12]\d{9}$/, 'رقم الهوية غير صحيح');

    it('يجب أن يقبل أرقام الهوية الصحيحة', () => {
      expect(() => nationalIdSchema.parse('1234567890')).not.toThrow();
      expect(() => nationalIdSchema.parse('2345678901')).not.toThrow();
    });

    it('يجب أن يرفض أرقام الهوية غير الصحيحة', () => {
      expect(() => nationalIdSchema.parse('3234567890')).toThrow(); // يجب أن يبدأ بـ 1 أو 2
      expect(() => nationalIdSchema.parse('123456789')).toThrow(); // قصير جداً
      expect(() => nationalIdSchema.parse('12345678901')).toThrow(); // طويل جداً
    });
  });

  describe('IBAN Validation', () => {
    const ibanSchema = z.string().regex(/^SA\d{22}$/, 'رقم IBAN غير صحيح');

    it('يجب أن يقبل IBAN السعودي الصحيح', () => {
      expect(() => ibanSchema.parse('SA1234567890123456789012')).not.toThrow();
    });

    it('يجب أن يرفض IBAN غير الصحيح', () => {
      expect(() => ibanSchema.parse('AE1234567890123456789012')).toThrow();
      expect(() => ibanSchema.parse('SA123456789012345678901')).toThrow(); // قصير
      expect(() => ibanSchema.parse('SA12345678901234567890123')).toThrow(); // طويل
    });
  });

  describe('Amount Validation', () => {
    const amountSchema = z.number().positive().max(10000000);

    it('يجب أن يقبل المبالغ الصحيحة', () => {
      expect(() => amountSchema.parse(100)).not.toThrow();
      expect(() => amountSchema.parse(1000.50)).not.toThrow();
      expect(() => amountSchema.parse(9999999)).not.toThrow();
    });

    it('يجب أن يرفض المبالغ غير الصحيحة', () => {
      expect(() => amountSchema.parse(0)).toThrow();
      expect(() => amountSchema.parse(-100)).toThrow();
      expect(() => amountSchema.parse(10000001)).toThrow();
    });
  });

  describe('Date Validation', () => {
    const dateSchema = z.string().refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, 'تاريخ غير صحيح');

    it('يجب أن يقبل التواريخ الصحيحة', () => {
      expect(() => dateSchema.parse('2025-01-15')).not.toThrow();
      expect(() => dateSchema.parse('2025-12-31')).not.toThrow();
    });

    it('يجب أن يرفض التواريخ غير الصحيحة', () => {
      expect(() => dateSchema.parse('invalid-date')).toThrow();
      expect(() => dateSchema.parse('2025-13-01')).toThrow();
    });
  });

  describe('Beneficiary Form Schema', () => {
    const beneficiarySchema = z.object({
      full_name: z.string().min(3, 'الاسم قصير جداً').max(100, 'الاسم طويل جداً'),
      national_id: z.string().regex(/^[12]\d{9}$/, 'رقم الهوية غير صحيح'),
      phone: z.string().regex(/^(05|5)\d{8}$/, 'رقم الجوال غير صحيح'),
      category: z.enum(['ابن', 'بنت', 'زوجة', 'أخرى']),
      status: z.enum(['نشط', 'معلق', 'غير نشط']).default('نشط'),
    });

    it('يجب أن يقبل بيانات المستفيد الصحيحة', () => {
      const validData = {
        full_name: 'محمد أحمد العلي',
        national_id: '1234567890',
        phone: '0501234567',
        category: 'ابن' as const,
        status: 'نشط' as const,
      };

      expect(() => beneficiarySchema.parse(validData)).not.toThrow();
    });

    it('يجب أن يرفض بيانات المستفيد غير الصحيحة', () => {
      const invalidData = {
        full_name: 'م', // قصير جداً
        national_id: '123', // غير صحيح
        phone: '123', // غير صحيح
        category: 'غير معروف', // غير موجود في القائمة
      };

      expect(() => beneficiarySchema.parse(invalidData)).toThrow();
    });
  });
});
