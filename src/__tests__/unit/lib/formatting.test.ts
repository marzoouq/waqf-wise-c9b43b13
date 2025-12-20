/**
 * اختبارات دوال تنسيق البيانات
 */
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  formatNationalId,
  truncate,
  formatFileSize,
  formatBytes,
} from '@/lib/utils/formatting';

describe('Formatting Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency in SAR', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('should handle decimal amounts', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('500');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with default decimals', () => {
      const result = formatNumber(1234.567);
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should use specified decimal places', () => {
      const result = formatNumber(1234.5678, 3);
      expect(result).toContain('568');
    });

    it('should handle negative numbers (uses absolute value)', () => {
      const result = formatNumber(-100);
      expect(result).not.toContain('-');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with default decimals', () => {
      const result = formatPercentage(75.5);
      expect(result).toContain('75');
      expect(result).toContain('%');
    });

    it('should use specified decimal places', () => {
      const result = formatPercentage(33.333, 2);
      expect(result).toContain('33');
      expect(result).toContain('%');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format valid Saudi phone numbers', () => {
      expect(formatPhoneNumber('0512345678')).toBe('051 234 5678');
    });

    it('should return original for invalid format', () => {
      expect(formatPhoneNumber('123456')).toBe('123456');
      expect(formatPhoneNumber('0112345678')).toBe('0112345678');
    });

    it('should handle already formatted numbers', () => {
      expect(formatPhoneNumber('05-1234-5678')).toBe('051 234 5678');
    });
  });

  describe('formatNationalId', () => {
    it('should format valid national IDs', () => {
      expect(formatNationalId('1234567890')).toBe('1 2345 67890');
    });

    it('should return original for invalid format', () => {
      expect(formatNationalId('12345')).toBe('12345');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('This is a long text', 10)).toBe('This is a ...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('should handle exact length', () => {
      expect(truncate('Exact', 5)).toBe('Exact');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 بايت');
      expect(formatFileSize(500)).toContain('بايت');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toContain('كيلوبايت');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toContain('ميجابايت');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toContain('جيجابايت');
    });
  });

  describe('formatBytes alias', () => {
    it('should be an alias for formatFileSize', () => {
      expect(formatBytes(1024)).toBe(formatFileSize(1024));
    });
  });
});
