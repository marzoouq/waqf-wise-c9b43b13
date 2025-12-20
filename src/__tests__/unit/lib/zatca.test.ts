/**
 * اختبارات دوال ZATCA
 */
import { describe, it, expect } from 'vitest';
import {
  generateZATCAQRData,
  validateVATNumber,
  formatVATNumber,
  formatZATCACurrency,
  formatZATCADate,
  type ZATCAInvoiceData,
} from '@/lib/zatca';

describe('ZATCA Functions', () => {
  describe('generateZATCAQRData', () => {
    it('should generate valid base64 QR data', () => {
      const invoiceData: ZATCAInvoiceData = {
        sellerName: 'شركة الوقف',
        sellerVatNumber: '300012345678901',
        invoiceDate: '2024-01-15T10:00:00Z',
        invoiceTotal: '1150.00',
        vatTotal: '150.00',
      };

      const result = generateZATCAQRData(invoiceData);

      // Should be valid base64
      expect(result).toMatch(/^[A-Za-z0-9+/=]+$/);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate different QR for different data', () => {
      const invoiceData1: ZATCAInvoiceData = {
        sellerName: 'شركة الوقف',
        sellerVatNumber: '300012345678901',
        invoiceDate: '2024-01-15T10:00:00Z',
        invoiceTotal: '1150.00',
        vatTotal: '150.00',
      };

      const invoiceData2: ZATCAInvoiceData = {
        sellerName: 'شركة أخرى',
        sellerVatNumber: '300098765432109',
        invoiceDate: '2024-01-16T10:00:00Z',
        invoiceTotal: '2300.00',
        vatTotal: '300.00',
      };

      const result1 = generateZATCAQRData(invoiceData1);
      const result2 = generateZATCAQRData(invoiceData2);

      expect(result1).not.toBe(result2);
    });
  });

  describe('validateVATNumber', () => {
    it('should return true for valid VAT numbers starting with 3', () => {
      expect(validateVATNumber('300012345678901')).toBe(true);
      expect(validateVATNumber('399999999999999')).toBe(true);
    });

    it('should return false for VAT not starting with 3', () => {
      expect(validateVATNumber('100012345678901')).toBe(false);
      expect(validateVATNumber('200012345678901')).toBe(false);
    });

    it('should return false for wrong length', () => {
      expect(validateVATNumber('30001234567890')).toBe(false); // 14 digits
      expect(validateVATNumber('3000123456789012')).toBe(false); // 16 digits
    });

    it('should handle VAT with spaces', () => {
      expect(validateVATNumber('300 0123 4567 8901')).toBe(true);
    });

    it('should return false for non-numeric VAT', () => {
      expect(validateVATNumber('30001234567890A')).toBe(false);
    });
  });

  describe('formatVATNumber', () => {
    it('should format valid VAT numbers', () => {
      expect(formatVATNumber('300012345678901')).toBe('300 0123 4567 8901');
    });

    it('should return original for invalid length', () => {
      expect(formatVATNumber('12345')).toBe('12345');
    });
  });

  describe('formatZATCACurrency', () => {
    it('should format to 2 decimal places', () => {
      expect(formatZATCACurrency(100)).toBe('100.00');
      expect(formatZATCACurrency(100.5)).toBe('100.50');
      expect(formatZATCACurrency(100.567)).toBe('100.57');
    });
  });

  describe('formatZATCADate', () => {
    it('should format date to ISO 8601', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatZATCADate(date);

      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });
  });
});
