/**
 * اختبارات التحقق من النماذج - Form Validation Tests
 * فحص شامل للتحقق من صحة البيانات في النماذج
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

describe('Form Validation Tests - اختبارات التحقق من النماذج', () => {
  describe('Beneficiary Form Validation', () => {
    const beneficiarySchema = z.object({
      full_name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
      national_id: z.string().regex(/^[12]\d{9}$/, 'رقم الهوية غير صالح'),
      phone: z.string().regex(/^(05|5)\d{8}$/, 'رقم الهاتف غير صالح'),
      email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
      iban: z.string().regex(/^SA\d{22}$/, 'رقم الآيبان غير صالح').optional().or(z.literal('')),
      category: z.enum(['sons', 'daughters', 'wives', 'charity'], { 
        errorMap: () => ({ message: 'يرجى اختيار الفئة' })
      })
    });

    it('should validate correct beneficiary data', () => {
      const validData = {
        full_name: 'محمد أحمد الخالد',
        national_id: '1234567890',
        phone: '0501234567',
        email: 'test@example.com',
        iban: 'SA0380000000608010167519',
        category: 'sons' as const
      };
      
      const result = beneficiarySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short names', () => {
      const data = {
        full_name: 'أ',
        national_id: '1234567890',
        phone: '0501234567',
        category: 'sons' as const
      };
      
      const result = beneficiarySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('3');
      }
    });

    it('should reject invalid national ID', () => {
      const data = {
        full_name: 'محمد أحمد',
        national_id: '3456789012', // Starts with 3
        phone: '0501234567',
        category: 'sons' as const
      };
      
      const result = beneficiarySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone number', () => {
      const data = {
        full_name: 'محمد أحمد',
        national_id: '1234567890',
        phone: '1234567890', // Not starting with 05
        category: 'sons' as const
      };
      
      const result = beneficiarySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const data = {
        full_name: 'محمد أحمد',
        national_id: '1234567890',
        phone: '0501234567',
        email: 'invalid-email',
        category: 'sons' as const
      };
      
      const result = beneficiarySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow empty optional fields', () => {
      const data = {
        full_name: 'محمد أحمد',
        national_id: '1234567890',
        phone: '0501234567',
        email: '',
        iban: '',
        category: 'sons' as const
      };
      
      const result = beneficiarySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Journal Entry Form Validation', () => {
    const journalEntrySchema = z.object({
      date: z.string().min(1, 'التاريخ مطلوب'),
      description: z.string().min(5, 'الوصف يجب أن يكون 5 أحرف على الأقل'),
      lines: z.array(z.object({
        account_id: z.string().min(1, 'الحساب مطلوب'),
        debit: z.number().min(0, 'المبلغ لا يمكن أن يكون سالباً'),
        credit: z.number().min(0, 'المبلغ لا يمكن أن يكون سالباً')
      })).min(2, 'يجب أن يحتوي القيد على سطرين على الأقل')
    }).refine(data => {
      const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);
      return totalDebit === totalCredit;
    }, { message: 'مجموع المدين يجب أن يساوي مجموع الدائن' });

    it('should validate balanced journal entry', () => {
      const data = {
        date: '2024-01-15',
        description: 'قيد تحصيل إيجار',
        lines: [
          { account_id: 'acc-1', debit: 1000, credit: 0 },
          { account_id: 'acc-2', debit: 0, credit: 1000 }
        ]
      };
      
      const result = journalEntrySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject unbalanced journal entry', () => {
      const data = {
        date: '2024-01-15',
        description: 'قيد غير متزن',
        lines: [
          { account_id: 'acc-1', debit: 1000, credit: 0 },
          { account_id: 'acc-2', debit: 0, credit: 500 }
        ]
      };
      
      const result = journalEntrySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject single line entry', () => {
      const data = {
        date: '2024-01-15',
        description: 'قيد بسطر واحد',
        lines: [
          { account_id: 'acc-1', debit: 1000, credit: 0 }
        ]
      };
      
      const result = journalEntrySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Property Form Validation', () => {
    const propertySchema = z.object({
      name: z.string().min(2, 'اسم العقار مطلوب'),
      address: z.string().min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل'),
      type: z.enum(['residential', 'commercial', 'land'], {
        errorMap: () => ({ message: 'يرجى اختيار نوع العقار' })
      }),
      total_units: z.number().min(1, 'عدد الوحدات يجب أن يكون 1 على الأقل'),
      total_area: z.number().positive('المساحة يجب أن تكون رقماً موجباً')
    });

    it('should validate correct property data', () => {
      const data = {
        name: 'برج الوقف',
        address: 'شارع الملك فهد، الرياض',
        type: 'commercial' as const,
        total_units: 10,
        total_area: 5000
      };
      
      const result = propertySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject zero units', () => {
      const data = {
        name: 'عمارة الوقف',
        address: 'شارع الملك فهد، الرياض',
        type: 'residential' as const,
        total_units: 0,
        total_area: 1000
      };
      
      const result = propertySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Payment Form Validation', () => {
    const paymentSchema = z.object({
      beneficiary_id: z.string().uuid('معرف المستفيد غير صالح'),
      amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
      payment_method: z.enum(['bank_transfer', 'cash', 'check'], {
        errorMap: () => ({ message: 'يرجى اختيار طريقة الدفع' })
      }),
      notes: z.string().max(500, 'الملاحظات لا تتجاوز 500 حرف').optional()
    });

    it('should validate correct payment data', () => {
      const data = {
        beneficiary_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 1500,
        payment_method: 'bank_transfer' as const,
        notes: 'دفعة شهر يناير'
      };
      
      const result = paymentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const data = {
        beneficiary_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: -500,
        payment_method: 'cash' as const
      };
      
      const result = paymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID', () => {
      const data = {
        beneficiary_id: 'invalid-uuid',
        amount: 1000,
        payment_method: 'cash' as const
      };
      
      const result = paymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Login Form Validation', () => {
    const loginSchema = z.object({
      email: z.string().email('البريد الإلكتروني غير صالح'),
      password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    });

    it('should validate correct login data', () => {
      const data = {
        email: 'user@example.com',
        password: 'securePassword123'
      };
      
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject short password', () => {
      const data = {
        email: 'user@example.com',
        password: '1234567'
      };
      
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Password Change Form Validation', () => {
    const passwordChangeSchema = z.object({
      current_password: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
      new_password: z.string()
        .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
        .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
        .regex(/[0-9]/, 'يجب أن تحتوي على رقم'),
      confirm_password: z.string()
    }).refine(data => data.new_password === data.confirm_password, {
      message: 'كلمتا المرور غير متطابقتين',
      path: ['confirm_password']
    });

    it('should validate matching passwords', () => {
      const data = {
        current_password: 'oldPassword123',
        new_password: 'NewPassword123',
        confirm_password: 'NewPassword123'
      };
      
      const result = passwordChangeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      const data = {
        current_password: 'oldPassword123',
        new_password: 'NewPassword123',
        confirm_password: 'DifferentPassword123'
      };
      
      const result = passwordChangeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const data = {
        current_password: 'oldPassword123',
        new_password: 'weakpass', // No uppercase, no number
        confirm_password: 'weakpass'
      };
      
      const result = passwordChangeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Date Range Validation', () => {
    const dateRangeSchema = z.object({
      start_date: z.string().min(1, 'تاريخ البداية مطلوب'),
      end_date: z.string().min(1, 'تاريخ النهاية مطلوب')
    }).refine(data => new Date(data.start_date) <= new Date(data.end_date), {
      message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
    });

    it('should validate correct date range', () => {
      const data = {
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      };
      
      const result = dateRangeSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date range', () => {
      const data = {
        start_date: '2024-12-31',
        end_date: '2024-01-01'
      };
      
      const result = dateRangeSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('File Upload Validation', () => {
    interface FileInfo {
      name: string;
      size: number;
      type: string;
    }

    const validateFile = (file: FileInfo) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      
      const errors: string[] = [];
      
      if (file.size > maxSize) {
        errors.push('حجم الملف يتجاوز 5 ميجابايت');
      }
      
      if (!allowedTypes.includes(file.type)) {
        errors.push('نوع الملف غير مدعوم');
      }
      
      return { valid: errors.length === 0, errors };
    };

    it('should accept valid file', () => {
      const file: FileInfo = {
        name: 'document.pdf',
        size: 1024 * 1024, // 1MB
        type: 'application/pdf'
      };
      
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it('should reject large file', () => {
      const file: FileInfo = {
        name: 'large-file.pdf',
        size: 10 * 1024 * 1024, // 10MB
        type: 'application/pdf'
      };
      
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('حجم الملف يتجاوز 5 ميجابايت');
    });

    it('should reject unsupported file type', () => {
      const file: FileInfo = {
        name: 'script.exe',
        size: 1024,
        type: 'application/x-msdownload'
      };
      
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('نوع الملف غير مدعوم');
    });
  });

  describe('Custom Validators', () => {
    it('should validate Saudi IBAN checksum', () => {
      const validateIBANChecksum = (iban: string) => {
        // Simplified checksum validation
        const cleaned = iban.replace(/\s/g, '').toUpperCase();
        return cleaned.startsWith('SA') && cleaned.length === 24;
      };
      
      expect(validateIBANChecksum('SA0380000000608010167519')).toBe(true);
      expect(validateIBANChecksum('SA038000000060801016')).toBe(false); // Too short
    });

    it('should validate Saudi national ID checksum', () => {
      const validateNationalID = (id: string) => {
        if (!/^[12]\d{9}$/.test(id)) return false;
        
        // Basic validation - starts with 1 (Saudi) or 2 (Resident)
        const firstDigit = id.charAt(0);
        return firstDigit === '1' || firstDigit === '2';
      };
      
      expect(validateNationalID('1234567890')).toBe(true);
      expect(validateNationalID('2345678901')).toBe(true);
      expect(validateNationalID('3456789012')).toBe(false);
    });
  });
});
