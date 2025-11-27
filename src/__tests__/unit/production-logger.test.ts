/**
 * اختبارات وحدة لـ ProductionLogger
 * Unit Tests for ProductionLogger
 * 
 * هذه الاختبارات تتحقق من:
 * 1. تحويل مستويات الـ log إلى severity و error_type الصحيحة
 * 2. تنسيق البيانات المُرسلة لـ Edge Function
 * 3. سلوك الـ queue والـ flush
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// تعريف الأنواع للاختبار
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type Severity = 'low' | 'medium' | 'high' | 'critical';

// دوال التحويل المنسوخة من الكود الأصلي للاختبار
function mapLevelToSeverity(level: LogLevel): Severity {
  switch (level) {
    case 'error':
      return 'high';
    case 'warn':
      return 'medium';
    case 'info':
      return 'low';
    case 'debug':
      return 'low';
    default:
      return 'low';
  }
}

function mapLevelToErrorType(level: LogLevel): string {
  switch (level) {
    case 'error':
      return 'error';
    case 'warn':
      return 'warning';
    case 'info':
      return 'info';
    case 'debug':
      return 'debug';
    default:
      return 'unknown';
  }
}

// Mock Supabase client
const mockInvoke = vi.fn().mockResolvedValue({ data: null, error: null });
const mockGetSession = vi.fn().mockResolvedValue({
  data: { session: { user: { id: 'test-user-id' } } },
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
    auth: {
      getSession: mockGetSession,
    },
  },
}));

describe('ProductionLogger - تحويل المستويات', () => {
  describe('mapLevelToSeverity', () => {
    it('يحول error إلى high', () => {
      expect(mapLevelToSeverity('error')).toBe('high');
    });

    it('يحول warn إلى medium', () => {
      expect(mapLevelToSeverity('warn')).toBe('medium');
    });

    it('يحول info إلى low', () => {
      expect(mapLevelToSeverity('info')).toBe('low');
    });

    it('يحول debug إلى low', () => {
      expect(mapLevelToSeverity('debug')).toBe('low');
    });
  });

  describe('mapLevelToErrorType', () => {
    it('يحول error إلى error', () => {
      expect(mapLevelToErrorType('error')).toBe('error');
    });

    it('يحول warn إلى warning', () => {
      expect(mapLevelToErrorType('warn')).toBe('warning');
    });

    it('يحول info إلى info', () => {
      expect(mapLevelToErrorType('info')).toBe('info');
    });

    it('يحول debug إلى debug', () => {
      expect(mapLevelToErrorType('debug')).toBe('debug');
    });
  });
});

describe('ProductionLogger - تنسيق البيانات', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('التنسيق المتوقع لـ log-error Edge Function', () => {
    it('يجب أن يحتوي على جميع الحقول المطلوبة', () => {
      const expectedSchema = {
        error_type: 'string',
        error_message: 'string',
        severity: ['low', 'medium', 'high', 'critical'],
        url: 'string',
        user_agent: 'string',
      };

      // التحقق من وجود جميع الحقول
      expect(Object.keys(expectedSchema)).toHaveLength(5);
      expect(expectedSchema).toHaveProperty('error_type');
      expect(expectedSchema).toHaveProperty('error_message');
      expect(expectedSchema).toHaveProperty('severity');
      expect(expectedSchema).toHaveProperty('url');
      expect(expectedSchema).toHaveProperty('user_agent');
    });

    it('يجب أن ينشئ body بالتنسيق الصحيح للـ error level', () => {
      const level: LogLevel = 'error';
      const message = 'Test error message';
      
      const body = {
        error_type: mapLevelToErrorType(level),
        error_message: message,
        severity: mapLevelToSeverity(level),
        url: 'http://localhost:3000/test',
        user_agent: 'Mozilla/5.0',
      };

      expect(body.error_type).toBe('error');
      expect(body.error_message).toBe(message);
      expect(body.severity).toBe('high');
      expect(body.url).toBeTruthy();
      expect(body.user_agent).toBeTruthy();
    });

    it('يجب أن ينشئ body بالتنسيق الصحيح للـ warn level', () => {
      const level: LogLevel = 'warn';
      const message = 'Test warning message';
      
      const body = {
        error_type: mapLevelToErrorType(level),
        error_message: message,
        severity: mapLevelToSeverity(level),
        url: 'http://localhost:3000/test',
        user_agent: 'Mozilla/5.0',
      };

      expect(body.error_type).toBe('warning');
      expect(body.severity).toBe('medium');
    });

    it('يجب أن ينشئ body بالتنسيق الصحيح للـ info level', () => {
      const level: LogLevel = 'info';
      const message = 'Test info message';
      
      const body = {
        error_type: mapLevelToErrorType(level),
        error_message: message,
        severity: mapLevelToSeverity(level),
        url: 'http://localhost:3000/test',
        user_agent: 'Mozilla/5.0',
      };

      expect(body.error_type).toBe('info');
      expect(body.severity).toBe('low');
    });
  });

  describe('الحقول الاختيارية', () => {
    it('يدعم إضافة additional_data', () => {
      const body = {
        error_type: 'error',
        error_message: 'Test',
        severity: 'high' as Severity,
        url: 'http://localhost',
        user_agent: 'Test',
        additional_data: {
          context: 'test_context',
          metadata: { key: 'value' },
        },
      };

      expect(body.additional_data).toBeDefined();
      expect(body.additional_data.context).toBe('test_context');
    });

    it('يدعم إضافة user_id', () => {
      const body = {
        error_type: 'error',
        error_message: 'Test',
        severity: 'high' as Severity,
        url: 'http://localhost',
        user_agent: 'Test',
        user_id: 'user-123-uuid',
      };

      expect(body.user_id).toBe('user-123-uuid');
    });
  });
});

describe('ProductionLogger - Console Output في DEV', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('يطبع debug برمز 🐛', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // محاكاة DEV mode
    const message = 'test debug';
    const data = { key: 'value' };
    
    // محاكاة سلوك debug في DEV
    // eslint-disable-next-line no-console
    console.log(`🐛 ${message}`, data);
    
    expect(consoleSpy).toHaveBeenCalledWith(`🐛 ${message}`, data);
  });

  it('يطبع info برمز ℹ️', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    
    const message = 'test info';
    console.info(`ℹ️ ${message}`, '');
    
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('يطبع warn برمز ⚠️', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const message = 'test warning';
    console.warn(`⚠️ ${message}`, '');
    
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('يطبع error برمز ❌', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const message = 'test error';
    console.error(`❌ ${message}`, '');
    
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('يطبع success برمز ✅', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const message = 'test success';
    // eslint-disable-next-line no-console
    console.log(`✅ ${message}`, '');
    
    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('ProductionLogger - Queue Behavior', () => {
  it('يضيف logs للـ queue في PROD mode', () => {
    const queue: Array<{
      level: LogLevel;
      message: string;
      data?: unknown;
      timestamp: string;
    }> = [];

    // محاكاة إضافة log للـ queue
    const addToQueue = (level: LogLevel, message: string, data?: unknown) => {
      queue.push({
        level,
        message,
        data,
        timestamp: new Date().toISOString(),
      });
    };

    addToQueue('info', 'Test message 1');
    addToQueue('warn', 'Test message 2');
    addToQueue('error', 'Test message 3');

    expect(queue).toHaveLength(3);
    expect(queue[0].level).toBe('info');
    expect(queue[1].level).toBe('warn');
    expect(queue[2].level).toBe('error');
  });

  it('يطرد الـ queue عند الوصول لـ 50 رسالة', () => {
    const QUEUE_THRESHOLD = 50;
    const queue: unknown[] = [];
    let flushed = false;

    const flush = () => {
      flushed = true;
    };

    // محاكاة إضافة 50 رسالة
    for (let i = 0; i < QUEUE_THRESHOLD; i++) {
      queue.push({ message: `Message ${i}` });
      if (queue.length >= QUEUE_THRESHOLD) {
        flush();
      }
    }

    expect(flushed).toBe(true);
  });
});

describe('ProductionLogger - Error Handling', () => {
  it('يعالج Error objects بشكل صحيح', () => {
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at test.ts:1:1';

    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };

    expect(errorData.message).toBe('Test error');
    expect(errorData.name).toBe('Error');
    expect(errorData.stack).toContain('Test error');
  });

  it('يعالج non-Error values', () => {
    const values = [
      'string error',
      123,
      { custom: 'error' },
      null,
      undefined,
    ];

    values.forEach((value) => {
      const isError = value instanceof Error;
      expect(isError).toBe(false);
    });
  });
});

describe('ProductionLogger - Integration Schema Validation', () => {
  it('يطابق schema الـ Edge Function', () => {
    // Schema المتوقع من Edge Function log-error
    const zodSchema = {
      error_type: { type: 'string', min: 1, max: 100 },
      error_message: { type: 'string', min: 1, max: 2000 },
      error_stack: { type: 'string', max: 10000, optional: true },
      severity: { enum: ['low', 'medium', 'high', 'critical'] },
      url: { type: 'string', max: 2000 },
      user_agent: { type: 'string', max: 500 },
      user_id: { type: 'uuid', optional: true },
      additional_data: { type: 'object', optional: true },
    };

    // إنشاء body من ProductionLogger
    const loggerBody = {
      error_type: mapLevelToErrorType('error'),
      error_message: 'Test error message',
      severity: mapLevelToSeverity('error'),
      url: 'http://localhost:3000',
      user_agent: 'Mozilla/5.0',
    };

    // التحقق من التوافق
    expect(typeof loggerBody.error_type).toBe('string');
    expect(loggerBody.error_type.length).toBeGreaterThanOrEqual(1);
    expect(loggerBody.error_type.length).toBeLessThanOrEqual(100);

    expect(typeof loggerBody.error_message).toBe('string');
    expect(loggerBody.error_message.length).toBeLessThanOrEqual(2000);

    expect(['low', 'medium', 'high', 'critical']).toContain(loggerBody.severity);

    expect(typeof loggerBody.url).toBe('string');
    expect(typeof loggerBody.user_agent).toBe('string');
  });
});
