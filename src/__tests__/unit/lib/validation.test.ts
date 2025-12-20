/**
 * اختبارات دوال التحقق من البيانات
 */
import { describe, it, expect } from 'vitest';
import {
  isValidSaudiId,
  isValidIqamaNumber,
  isValidSaudiPhone,
  isValidEmail,
  isValidSaudiIban,
  isPositiveNumber,
  isInRange,
  isValidDate,
  isFutureDate,
  isNotEmpty,
} from '@/lib/utils/validation';

describe('Validation Functions', () => {
  describe('isValidSaudiId', () => {
    it('should return true for valid Saudi ID starting with 1', () => {
      expect(isValidSaudiId('1234567890')).toBe(true);
    });

    it('should return true for valid Saudi ID starting with 2', () => {
      expect(isValidSaudiId('2345678901')).toBe(true);
    });

    it('should return false for ID not starting with 1 or 2', () => {
      expect(isValidSaudiId('3456789012')).toBe(false);
      expect(isValidSaudiId('0123456789')).toBe(false);
    });

    it('should return false for ID with wrong length', () => {
      expect(isValidSaudiId('123456789')).toBe(false); // 9 digits
      expect(isValidSaudiId('12345678901')).toBe(false); // 11 digits
    });

    it('should handle IDs with non-numeric characters', () => {
      expect(isValidSaudiId('1234-567-890')).toBe(true); // cleaned becomes valid
      expect(isValidSaudiId('1 2 3 4 5 6 7 8 9 0')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidSaudiId('')).toBe(false);
    });
  });

  describe('isValidIqamaNumber', () => {
    it('should return true for valid Iqama starting with 3', () => {
      expect(isValidIqamaNumber('3456789012')).toBe(true);
    });

    it('should return true for valid Iqama starting with 4', () => {
      expect(isValidIqamaNumber('4567890123')).toBe(true);
    });

    it('should return false for Iqama not starting with 3 or 4', () => {
      expect(isValidIqamaNumber('1234567890')).toBe(false);
      expect(isValidIqamaNumber('2345678901')).toBe(false);
    });

    it('should return false for wrong length', () => {
      expect(isValidIqamaNumber('345678901')).toBe(false); // 9 digits
    });
  });

  describe('isValidSaudiPhone', () => {
    it('should return true for valid Saudi phone number', () => {
      expect(isValidSaudiPhone('0512345678')).toBe(true);
      expect(isValidSaudiPhone('0598765432')).toBe(true);
    });

    it('should return false for phone not starting with 05', () => {
      expect(isValidSaudiPhone('0112345678')).toBe(false);
      expect(isValidSaudiPhone('0612345678')).toBe(false);
    });

    it('should return false for wrong length', () => {
      expect(isValidSaudiPhone('051234567')).toBe(false); // 9 digits
      expect(isValidSaudiPhone('05123456789')).toBe(false); // 11 digits
    });

    it('should handle formatted phone numbers', () => {
      expect(isValidSaudiPhone('05 123 45678')).toBe(true);
      expect(isValidSaudiPhone('05-1234-5678')).toBe(true);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.sa')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isValidSaudiIban', () => {
    it('should return true for valid Saudi IBAN', () => {
      expect(isValidSaudiIban('SA0380000000608010167519')).toBe(true);
    });

    it('should return true for IBAN with spaces', () => {
      expect(isValidSaudiIban('SA03 8000 0000 6080 1016 7519')).toBe(true);
    });

    it('should return false for non-Saudi IBAN', () => {
      expect(isValidSaudiIban('AE070331234567890123456')).toBe(false);
    });

    it('should return false for wrong length', () => {
      expect(isValidSaudiIban('SA038000000060801016751')).toBe(false); // 23 chars
      expect(isValidSaudiIban('SA03800000006080101675199')).toBe(false); // 25 chars
    });
  });

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(100.5)).toBe(true);
      expect(isPositiveNumber(0.001)).toBe(true);
    });

    it('should return false for zero', () => {
      expect(isPositiveNumber(0)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(-0.001)).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should return true for values in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true); // inclusive
      expect(isInRange(10, 1, 10)).toBe(true); // inclusive
    });

    it('should return false for values out of range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate('2024-12-31T23:59:59Z')).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('2024-13-01')).toBe(false); // invalid month
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isFutureDate(tomorrow)).toBe(true);
    });

    it('should return false for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isFutureDate(yesterday)).toBe(false);
    });

    it('should return false for invalid dates', () => {
      expect(isFutureDate('invalid')).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    it('should return true for non-empty strings', () => {
      expect(isNotEmpty('hello')).toBe(true);
      expect(isNotEmpty('  hello  ')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty('   ')).toBe(false);
    });
  });
});
