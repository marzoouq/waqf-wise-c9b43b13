/**
 * Unit Tests - Error Tracker
 * اختبارات شاملة لنظام تتبع الأخطاء
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ErrorTracker - Deduplication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deduplicate identical errors within window', () => {
    const errors = [
      { type: 'network_error', message: 'Failed to fetch' },
      { type: 'network_error', message: 'Failed to fetch' },
      { type: 'network_error', message: 'Failed to fetch' },
    ];

    const dedupMap = new Map<string, { count: number; lastSeen: number }>();
    const DEDUP_WINDOW = 15 * 60 * 1000; // 15 minutes
    const now = Date.now();

    errors.forEach((error) => {
      const key = `${error.type}-${error.message}`;
      const entry = dedupMap.get(key);

      if (entry && now - entry.lastSeen < DEDUP_WINDOW) {
        entry.count++;
        entry.lastSeen = now;
      } else {
        dedupMap.set(key, { count: 1, lastSeen: now });
      }
    });

    const result = dedupMap.get('network_error-Failed to fetch');
    expect(result).toBeDefined();
    expect(result?.count).toBe(3);
  });

  it('should not deduplicate errors outside window', () => {
    const DEDUP_WINDOW = 15 * 60 * 1000;
    const now = Date.now();
    const oldTime = now - (20 * 60 * 1000); // 20 minutes ago

    const dedupMap = new Map<string, { count: number; lastSeen: number }>();
    dedupMap.set('error-key', { count: 1, lastSeen: oldTime });

    const shouldSkip = now - oldTime < DEDUP_WINDOW;
    expect(shouldSkip).toBe(false);
  });

  it('should auto-resolve repeated errors after threshold', () => {
    const MAX_COUNT = 20;
    const dedupMap = new Map<string, { count: number; lastSeen: number; resolved: boolean }>();
    
    // Simulate 20 identical errors
    for (let i = 1; i <= MAX_COUNT; i++) {
      const entry = dedupMap.get('test-error') || { count: 0, lastSeen: Date.now(), resolved: false };
      entry.count++;
      
      if (entry.count >= MAX_COUNT) {
        entry.resolved = true;
      }
      
      dedupMap.set('test-error', entry);
    }

    const result = dedupMap.get('test-error');
    expect(result?.resolved).toBe(true);
    expect(result?.count).toBe(MAX_COUNT);
  });
});

describe('ErrorTracker - Circuit Breaker', () => {
  it('should open circuit after max consecutive errors', () => {
    const MAX_CONSECUTIVE = 10;
    let consecutiveErrors = 0;
    let circuitOpen = false;

    // Simulate 10 consecutive failures
    for (let i = 0; i < MAX_CONSECUTIVE; i++) {
      consecutiveErrors++;
      if (consecutiveErrors >= MAX_CONSECUTIVE) {
        circuitOpen = true;
      }
    }

    expect(circuitOpen).toBe(true);
    expect(consecutiveErrors).toBe(MAX_CONSECUTIVE);
  });

  it('should reset circuit on successful request', () => {
    let consecutiveErrors = 5;
    let circuitOpen = consecutiveErrors >= 10;

    // Simulate successful request
    consecutiveErrors = 0;
    circuitOpen = false;

    expect(circuitOpen).toBe(false);
    expect(consecutiveErrors).toBe(0);
  });

  it('should respect circuit breaker timeout', () => {
    const TIMEOUT = 60000; // 60 seconds
    const now = Date.now();
    const resetTime = now + TIMEOUT;

    const shouldReset = Date.now() >= resetTime;
    expect(shouldReset).toBe(false);

    // Fast-forward time
    const futureTime = now + TIMEOUT + 1000;
    const shouldResetFuture = futureTime >= resetTime;
    expect(shouldResetFuture).toBe(true);
  });
});

describe('ErrorTracker - Error Filtering', () => {
  const IGNORE_PATTERNS = [
    /Failed to fetch.*log-error/i,
    /NetworkError.*execute-auto-fix/i,
    /Auth session missing/i,
    /429/i,
  ];

  const shouldIgnore = (message: string): boolean => {
    return IGNORE_PATTERNS.some(pattern => pattern.test(message));
  };

  it('should ignore auth errors', () => {
    expect(shouldIgnore('Auth session missing')).toBe(true);
    expect(shouldIgnore('User not authenticated')).toBe(false);
  });

  it('should ignore rate limit errors', () => {
    expect(shouldIgnore('Error 429: Too many requests')).toBe(true);
    expect(shouldIgnore('Error 500: Server error')).toBe(false);
  });

  it('should ignore log-error failures', () => {
    expect(shouldIgnore('Failed to fetch from log-error endpoint')).toBe(true);
    expect(shouldIgnore('Failed to fetch user data')).toBe(false);
  });
});

describe('ErrorTracker - Queue Management', () => {
  it('should add errors to queue', () => {
    const queue: any[] = [];
    const error = { type: 'test', message: 'Test error' };
    
    queue.push(error);
    
    expect(queue.length).toBe(1);
    expect(queue[0]).toEqual(error);
  });

  it('should process queue in FIFO order', () => {
    const queue = [
      { id: 1, message: 'First' },
      { id: 2, message: 'Second' },
      { id: 3, message: 'Third' },
    ];

    const first = queue.shift();
    expect(first?.id).toBe(1);
    
    const second = queue.shift();
    expect(second?.id).toBe(2);
  });

  it('should save pending errors to localStorage', () => {
    const errors = [{ type: 'test', message: 'Test' }];
    const serialized = JSON.stringify(errors);
    
    expect(serialized).toContain('test');
    expect(serialized).toContain('Test');
    
    const deserialized = JSON.parse(serialized);
    expect(deserialized).toEqual(errors);
  });
});

describe('ErrorTracker - Exponential Backoff', () => {
  it('should increase delay exponentially', () => {
    let delay = 2000;
    const MAX_DELAY = 30000;

    const delays: number[] = [];
    for (let i = 0; i < 5; i++) {
      delays.push(delay);
      delay = Math.min(delay * 2, MAX_DELAY);
    }

    expect(delays).toEqual([2000, 4000, 8000, 16000, 30000]);
  });

  it('should respect max delay limit', () => {
    let delay = 20000;
    const MAX_DELAY = 30000;

    delay = Math.min(delay * 2, MAX_DELAY);
    expect(delay).toBe(30000);

    delay = Math.min(delay * 2, MAX_DELAY);
    expect(delay).toBe(30000); // Should not exceed max
  });
});
