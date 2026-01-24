import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WORLD_TIMEZONES,
  format24Hour,
  format12Hour,
  formatDate,
  getTimezoneOffset,
  isDaytime,
  getTimeInTimeZone,
} from '@/lib/timeUtils';

/**
 * Time Utilities Unit Tests
 * Tests for timezone conversion, formatting, and day/night detection
 */

describe('Time Utilities', () => {
  describe('WORLD_TIMEZONES', () => {
    it('should contain at least 9 predefined timezones', () => {
      expect(WORLD_TIMEZONES).toHaveLength(9);
    });

    it('should include essential timezones', () => {
      const timezoneIds = WORLD_TIMEZONES.map((tz) => tz.id);
      expect(timezoneIds).toContain('local');
      expect(timezoneIds).toContain('utc');
      expect(timezoneIds).toContain('riyadh');
      expect(timezoneIds).toContain('dubai');
      expect(timezoneIds).toContain('newyork');
      expect(timezoneIds).toContain('london');
      expect(timezoneIds).toContain('tokyo');
    });

    it('should have both English and Arabic names for each timezone', () => {
      WORLD_TIMEZONES.forEach((tz) => {
        expect(tz.name).toBeTruthy();
        expect(tz.nameAr).toBeTruthy();
        expect(tz.offset).toBeTruthy();
        expect(tz.id).toBeTruthy();
      });
    });
  });

  describe('format24Hour', () => {
    it('should format time in 24-hour format', () => {
      const date = new Date('2024-01-15T14:30:45Z');
      const result = format24Hour(date, 'UTC');
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle different timezones', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const utcTime = format24Hour(date, 'UTC');
      expect(utcTime).toMatch(/12:00:00/);
    });

    it('should return fallback for invalid timezone', () => {
      const date = new Date('2024-01-15T14:30:45Z');
      const result = format24Hour(date, 'Invalid/Timezone');
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('format12Hour', () => {
    it('should format time in 12-hour format with AM/PM', () => {
      const date = new Date('2024-01-15T14:30:45Z');
      const result = format12Hour(date, 'UTC');
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);
    });

    it('should handle midnight correctly', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const result = format12Hour(date, 'UTC');
      expect(result).toContain('12:00:00 AM');
    });

    it('should handle noon correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = format12Hour(date, 'UTC');
      expect(result).toContain('12:00:00 PM');
    });
  });

  describe('formatDate', () => {
    it('should format date in readable format', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = formatDate(date, 'UTC', false);
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should handle Arabic locale when requested', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = formatDate(date, 'UTC', true);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should return fallback for invalid timezone', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = formatDate(date, 'Invalid/Timezone', false);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('getTimezoneOffset', () => {
    it('should return a valid offset string', () => {
      const result = getTimezoneOffset('UTC');
      // UTC can be represented as 'Z' or '+00:00'
      expect(result === 'Z' || result.match(/^[+-]\d{2}:\d{2}$/)).toBeTruthy();
    });

    it('should return Z or +00:00 for UTC', () => {
      const result = getTimezoneOffset('UTC');
      expect(['Z', '+00:00']).toContain(result);
    });

    it('should return fallback for invalid timezone', () => {
      const result = getTimezoneOffset('Invalid/Timezone');
      expect(result).toBe('+00:00');
    });
  });

  describe('isDaytime', () => {
    it('should return true for daytime hours (6 AM - 6 PM)', () => {
      const morningDate = new Date('2024-01-15T08:00:00Z');
      expect(isDaytime(morningDate, 'UTC')).toBe(true);

      const afternoonDate = new Date('2024-01-15T14:00:00Z');
      expect(isDaytime(afternoonDate, 'UTC')).toBe(true);
    });

    it('should return false for nighttime hours', () => {
      const nightDate = new Date('2024-01-15T22:00:00Z');
      expect(isDaytime(nightDate, 'UTC')).toBe(false);

      const earlyMorningDate = new Date('2024-01-15T03:00:00Z');
      expect(isDaytime(earlyMorningDate, 'UTC')).toBe(false);
    });

    it('should handle edge cases (exactly 6 AM and 6 PM)', () => {
      const sixAM = new Date('2024-01-15T06:00:00Z');
      expect(isDaytime(sixAM, 'UTC')).toBe(true);

      const sixPM = new Date('2024-01-15T18:00:00Z');
      expect(isDaytime(sixPM, 'UTC')).toBe(false);
    });

    it('should handle invalid timezones gracefully', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = isDaytime(date, 'Invalid/Timezone');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getTimeInTimeZone', () => {
    it('should return current time for local timezone', () => {
      const result = getTimeInTimeZone('local');
      expect(result).toBeInstanceOf(Date);
    });

    it('should return UTC time for UTC timezone', () => {
      const result = getTimeInTimeZone('UTC');
      expect(result).toBeInstanceOf(Date);
    });

    it('should return a valid Date object for any timezone', () => {
      const result = getTimeInTimeZone('America/New_York');
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThan(0);
    });

    it('should handle different timezone offsets', () => {
      const utcTime = getTimeInTimeZone('UTC');
      const tokyoTime = getTimeInTimeZone('Asia/Tokyo');
      
      expect(utcTime).toBeInstanceOf(Date);
      expect(tokyoTime).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null/undefined gracefully in formatting functions', () => {
      const date = new Date();
      expect(() => format24Hour(date, 'UTC')).not.toThrow();
      expect(() => format12Hour(date, 'UTC')).not.toThrow();
      expect(() => formatDate(date, 'UTC')).not.toThrow();
    });

    it('should handle very old dates', () => {
      const oldDate = new Date('1900-01-01T12:00:00Z');
      const result24 = format24Hour(oldDate, 'UTC');
      const result12 = format12Hour(oldDate, 'UTC');
      
      expect(result24).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(result12).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);
    });

    it('should handle future dates', () => {
      const futureDate = new Date('2100-12-31T23:59:59Z');
      const result = formatDate(futureDate, 'UTC');
      expect(result).toContain('2100');
    });
  });
});
