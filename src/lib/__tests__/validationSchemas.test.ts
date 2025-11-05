import { describe, it, expect } from 'vitest';
import {
  fundSchema,
  beneficiarySchema,
  documentSchema,
  folderSchema,
} from '../validationSchemas';

describe('validationSchemas', () => {
  describe('fundSchema', () => {
    it('validates correct fund data', () => {
      const validData = {
        name: 'صندوق التعليم',
        allocated_amount: 100000,
        percentage: 10,
        category: 'تعليم',
        description: 'صندوق لدعم التعليم',
      };

      const result = fundSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid fund data', () => {
      const invalidData = {
        name: '',
        allocated_amount: -100,
        percentage: 150,
      };

      const result = fundSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('beneficiarySchema', () => {
    it('validates correct beneficiary data', () => {
      const validData = {
        name: 'أحمد محمد',
        national_id: '1234567890',
        phone: '0501234567',
        email: 'ahmad@example.com',
        address: 'الرياض',
      };

      const result = beneficiarySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const invalidData = {
        name: 'أحمد محمد',
        email: 'invalid-email',
      };

      const result = beneficiarySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('documentSchema', () => {
    it('validates correct document data', () => {
      const validData = {
        name: 'تقرير مالي',
        file_type: 'pdf',
        category: 'تقارير',
      };

      const result = documentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('folderSchema', () => {
    it('validates correct folder data', () => {
      const validData = {
        name: 'مجلد المستندات',
        description: 'مجلد لحفظ المستندات المالية',
      };

      const result = folderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const invalidData = {
        name: '',
      };

      const result = folderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
