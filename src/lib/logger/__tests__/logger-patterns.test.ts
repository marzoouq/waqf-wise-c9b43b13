/**
 * اختبارات توافق أنماط الـ Logger
 * تتحقق من دعم النمطين الجديد والقديم
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { devLogger } from '../dev-logger';

describe('Logger - Pattern Compatibility', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('error() - New Pattern Support', () => {
    it('should support new pattern: error(message, error, options)', () => {
      const testError = new Error('Test error');
      devLogger.error('Error occurred', testError, { context: 'test', severity: 'high' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Error occurred',
        expect.objectContaining({ message: 'Test error' })
      );
    });

    it('should support new pattern with string message only', () => {
      devLogger.error('Simple error message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Simple error message',
        ''
      );
    });

    it('should support new pattern with unknown error data', () => {
      const unknownData = { code: 500, details: 'Server error' };
      devLogger.error('API Error', unknownData, { context: 'api' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ API Error',
        unknownData
      );
    });
  });

  describe('error() - Old Pattern Support (Backward Compatibility)', () => {
    it('should support old pattern: error(Error, options)', () => {
      const testError = new Error('Legacy error');
      devLogger.error(testError, { context: 'legacy_test', severity: 'medium' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Legacy error',
        expect.objectContaining({ message: 'Legacy error' })
      );
    });

    it('should support old pattern: error(Error) without options', () => {
      const testError = new Error('Error without options');
      devLogger.error(testError);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Error without options',
        expect.objectContaining({ message: 'Error without options' })
      );
    });

    it('should handle unknown error type in old pattern', () => {
      const unknownError = { code: 500, message: 'Server error' };
      devLogger.error(unknownError, { context: 'unknown_test' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Server error',
        unknownError
      );
    });

    it('should handle null/undefined in old pattern', () => {
      devLogger.error(null);
      expect(consoleSpy).toHaveBeenCalled();

      devLogger.error(undefined);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('error() - Edge Cases', () => {
    it('should extract message from Error object correctly', () => {
      const error = new TypeError('Type mismatch');
      devLogger.error(error);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Type mismatch',
        expect.objectContaining({ 
          message: 'Type mismatch',
          name: 'TypeError'
        })
      );
    });

    it('should handle object with message property', () => {
      const errorLike = { message: 'Custom error', code: 'ERR_001' };
      devLogger.error(errorLike);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ Custom error',
        errorLike
      );
    });

    it('should convert non-string/non-Error to string', () => {
      devLogger.error(12345);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ 12345',
        12345
      );
    });
  });
});

describe('Logger - Other Methods', () => {
  it('debug() should log with correct format', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    devLogger.debug('Debug message', { data: 'test' });
    
    expect(spy).toHaveBeenCalledWith('🐛 Debug message', { data: 'test' });
    spy.mockRestore();
  });

  it('info() should log with correct format', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    devLogger.info('Info message');
    
    expect(spy).toHaveBeenCalledWith('ℹ️ Info message', '');
    spy.mockRestore();
  });

  it('warn() should log with correct format', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    devLogger.warn('Warning message', { level: 'high' });
    
    expect(spy).toHaveBeenCalledWith('⚠️ Warning message', { level: 'high' });
    spy.mockRestore();
  });

  it('success() should log with correct format', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    devLogger.success('Success message');
    
    expect(spy).toHaveBeenCalledWith('✅ Success message', '');
    spy.mockRestore();
  });
});
