/**
 * Unit Tests - Error Deduplication System
 * اختبارات نظام إلغاء التكرار
 */

import { describe, it, expect } from 'vitest';

interface DedupEntry {
  count: number;
  lastSeen: number;
  resolved: boolean;
  firstSeen: number;
}

class ErrorDeduplicator {
  private dedupMap = new Map<string, DedupEntry>();
  private readonly DEDUP_WINDOW: number;
  private readonly MAX_COUNT: number;
  private readonly AUTO_RESOLVE_THRESHOLD: number;

  constructor(
    dedupWindowMs: number = 15 * 60 * 1000,
    maxCount: number = 20,
    autoResolveMs: number = 24 * 60 * 60 * 1000
  ) {
    this.DEDUP_WINDOW = dedupWindowMs;
    this.MAX_COUNT = maxCount;
    this.AUTO_RESOLVE_THRESHOLD = autoResolveMs;
  }

  shouldTrackError(errorKey: string): boolean {
    const now = Date.now();
    const entry = this.dedupMap.get(errorKey);

    if (!entry) {
      // First occurrence - track it
      this.dedupMap.set(errorKey, {
        count: 1,
        lastSeen: now,
        firstSeen: now,
        resolved: false,
      });
      return true;
    }

    // Check if resolved
    if (entry.resolved) {
      return false;
    }

    // Check if within dedup window
    if (now - entry.lastSeen < this.DEDUP_WINDOW) {
      entry.count++;
      entry.lastSeen = now;

      // Auto-resolve if hit max count
      if (entry.count >= this.MAX_COUNT) {
        entry.resolved = true;
        return false;
      }

      return false; // Skip duplicate
    }

    // Outside window - track as new
    this.dedupMap.set(errorKey, {
      count: 1,
      lastSeen: now,
      firstSeen: now,
      resolved: false,
    });
    return true;
  }

  autoResolveOldErrors(): number {
    const now = Date.now();
    let resolved = 0;

    for (const [key, entry] of this.dedupMap.entries()) {
      if (!entry.resolved && now - entry.firstSeen > this.AUTO_RESOLVE_THRESHOLD) {
        entry.resolved = true;
        resolved++;
      }
    }

    return resolved;
  }

  getStats() {
    let total = 0;
    let resolved = 0;
    let active = 0;

    for (const entry of this.dedupMap.values()) {
      total++;
      if (entry.resolved) {
        resolved++;
      } else {
        active++;
      }
    }

    return { total, resolved, active };
  }

  cleanup() {
    const now = Date.now();
    const cutoff = now - (30 * 24 * 60 * 60 * 1000); // 30 days

    for (const [key, entry] of this.dedupMap.entries()) {
      if (entry.resolved && entry.lastSeen < cutoff) {
        this.dedupMap.delete(key);
      }
    }
  }
}

describe('Error Deduplicator', () => {
  it('should track first occurrence of error', () => {
    const deduplicator = new ErrorDeduplicator();
    const result = deduplicator.shouldTrackError('error-1');
    
    expect(result).toBe(true);
  });

  it('should skip duplicate errors within window', () => {
    const deduplicator = new ErrorDeduplicator(5000); // 5 seconds
    
    deduplicator.shouldTrackError('error-1');
    
    // Same error within window
    const result = deduplicator.shouldTrackError('error-1');
    expect(result).toBe(false);
  });

  it('should track errors outside dedup window', async () => {
    const deduplicator = new ErrorDeduplicator(100); // 100ms window
    
    deduplicator.shouldTrackError('error-1');
    
    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const result = deduplicator.shouldTrackError('error-1');
    expect(result).toBe(true);
  });

  it('should auto-resolve after max count', () => {
    const deduplicator = new ErrorDeduplicator(60000, 3); // Max 3 occurrences
    
    deduplicator.shouldTrackError('error-1'); // 1st
    deduplicator.shouldTrackError('error-1'); // 2nd
    deduplicator.shouldTrackError('error-1'); // 3rd - auto-resolve
    
    const result = deduplicator.shouldTrackError('error-1');
    expect(result).toBe(false); // Should be resolved
  });

  it('should auto-resolve old errors', () => {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const deduplicator = new ErrorDeduplicator(60000, 20, ONE_DAY);
    
    // Manually add old error
    const oldEntry: DedupEntry = {
      count: 1,
      lastSeen: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
      firstSeen: Date.now() - (25 * 60 * 60 * 1000),
      resolved: false,
    };
    
    (deduplicator as any).dedupMap.set('old-error', oldEntry);
    
    const resolved = deduplicator.autoResolveOldErrors();
    expect(resolved).toBe(1);
  });

  it('should track statistics correctly', () => {
    const deduplicator = new ErrorDeduplicator();
    
    deduplicator.shouldTrackError('error-1');
    deduplicator.shouldTrackError('error-2');
    deduplicator.shouldTrackError('error-3');
    
    const stats = deduplicator.getStats();
    expect(stats.total).toBe(3);
    expect(stats.active).toBe(3);
    expect(stats.resolved).toBe(0);
  });

  it('should cleanup old resolved errors', () => {
    const deduplicator = new ErrorDeduplicator();
    
    // Add old resolved error
    const oldEntry: DedupEntry = {
      count: 1,
      lastSeen: Date.now() - (31 * 24 * 60 * 60 * 1000), // 31 days ago
      firstSeen: Date.now() - (31 * 24 * 60 * 60 * 1000),
      resolved: true,
    };
    
    (deduplicator as any).dedupMap.set('old-resolved', oldEntry);
    
    const beforeStats = deduplicator.getStats();
    expect(beforeStats.total).toBe(1);
    
    deduplicator.cleanup();
    
    const afterStats = deduplicator.getStats();
    expect(afterStats.total).toBe(0);
  });
});

describe('Deduplication - Real-world Scenarios', () => {
  it('should handle burst of identical errors', () => {
    const deduplicator = new ErrorDeduplicator(5000, 10);
    
    // Simulate 15 identical errors in rapid succession
    let tracked = 0;
    for (let i = 0; i < 15; i++) {
      if (deduplicator.shouldTrackError('burst-error')) {
        tracked++;
      }
    }
    
    expect(tracked).toBe(1); // Only first one should be tracked
  });

  it('should handle multiple different errors', () => {
    const deduplicator = new ErrorDeduplicator();
    
    const errors = ['error-1', 'error-2', 'error-3', 'error-1', 'error-2'];
    let tracked = 0;
    
    for (const error of errors) {
      if (deduplicator.shouldTrackError(error)) {
        tracked++;
      }
    }
    
    expect(tracked).toBe(3); // 3 unique errors
  });

  it('should respect different dedup windows for different severities', () => {
    const criticalDedup = new ErrorDeduplicator(30000); // 30s for critical
    const lowDedup = new ErrorDeduplicator(300000); // 5min for low
    
    // Critical errors get shorter window
    criticalDedup.shouldTrackError('critical-1');
    const criticalResult = criticalDedup.shouldTrackError('critical-1');
    expect(criticalResult).toBe(false);
    
    // Low priority errors get longer window
    lowDedup.shouldTrackError('low-1');
    const lowResult = lowDedup.shouldTrackError('low-1');
    expect(lowResult).toBe(false);
  });
});

describe('Deduplication - Performance', () => {
  it('should handle large number of unique errors efficiently', () => {
    const deduplicator = new ErrorDeduplicator();
    const start = Date.now();
    
    // Track 1000 unique errors
    for (let i = 0; i < 1000; i++) {
      deduplicator.shouldTrackError(`error-${i}`);
    }
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in <100ms
    
    const stats = deduplicator.getStats();
    expect(stats.total).toBe(1000);
  });

  it('should cleanup efficiently', () => {
    const deduplicator = new ErrorDeduplicator();
    
    // Add 100 old resolved errors
    for (let i = 0; i < 100; i++) {
      const oldEntry: DedupEntry = {
        count: 1,
        lastSeen: Date.now() - (31 * 24 * 60 * 60 * 1000),
        firstSeen: Date.now() - (31 * 24 * 60 * 60 * 1000),
        resolved: true,
      };
      (deduplicator as any).dedupMap.set(`old-${i}`, oldEntry);
    }
    
    const start = Date.now();
    deduplicator.cleanup();
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(50); // Should complete in <50ms
    
    const stats = deduplicator.getStats();
    expect(stats.total).toBe(0);
  });
});
