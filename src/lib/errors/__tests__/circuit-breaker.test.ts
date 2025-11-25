/**
 * Unit Tests - Circuit Breaker Pattern
 * اختبارات نمط Circuit Breaker
 */

import { describe, it, expect, beforeEach } from 'vitest';

class CircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttemptTime: number = 0;

  constructor(
    private threshold: number = 3,
    private timeout: number = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.successCount++;

    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }

  private onFailure() {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.timeout;
    }
  }

  getState() {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failures: this.failureCount,
      successes: this.successCount,
    };
  }
}

describe('Circuit Breaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker(3, 5000);
  });

  it('should start in CLOSED state', () => {
    expect(circuitBreaker.getState()).toBe('CLOSED');
  });

  it('should open after threshold failures', async () => {
    const failingFn = async () => {
      throw new Error('Service unavailable');
    };

    // First 3 failures should open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(failingFn);
      } catch (error) {
        // Expected
      }
    }

    expect(circuitBreaker.getState()).toBe('OPEN');
  });

  it('should reject calls when OPEN', async () => {
    const failingFn = async () => {
      throw new Error('Service unavailable');
    };

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(failingFn);
      } catch (error) {
        // Expected
      }
    }

    // Next call should be rejected immediately
    await expect(circuitBreaker.execute(failingFn))
      .rejects.toThrow('Circuit breaker is OPEN');
  });

  it('should reset to CLOSED after successful execution in HALF_OPEN', async () => {
    const failingFn = async () => {
      throw new Error('Service unavailable');
    };

    const successFn = async () => 'Success';

    // Open the circuit
    for (let i = 0; i < 3; i++) {
      try {
        await circuitBreaker.execute(failingFn);
      } catch (error) {
        // Expected
      }
    }

    expect(circuitBreaker.getState()).toBe('OPEN');

    // Wait for timeout to transition to HALF_OPEN
    await new Promise(resolve => setTimeout(resolve, 5100));

    // Execute successful call
    const result = await circuitBreaker.execute(successFn);
    
    expect(result).toBe('Success');
    expect(circuitBreaker.getState()).toBe('CLOSED');
  });

  it('should track failure and success counts', async () => {
    const successFn = async () => 'Success';
    const failingFn = async () => {
      throw new Error('Failure');
    };

    // 2 successes
    await circuitBreaker.execute(successFn);
    await circuitBreaker.execute(successFn);

    let stats = circuitBreaker.getStats();
    expect(stats.successes).toBe(2);
    expect(stats.failures).toBe(0);

    // 1 failure
    try {
      await circuitBreaker.execute(failingFn);
    } catch (error) {
      // Expected
    }

    stats = circuitBreaker.getStats();
    expect(stats.successes).toBe(0); // Reset on failure
    expect(stats.failures).toBe(1);
  });

  it('should handle custom threshold and timeout', async () => {
    const customBreaker = new CircuitBreaker(5, 10000);
    const failingFn = async () => {
      throw new Error('Failure');
    };

    // Should require 5 failures to open
    for (let i = 0; i < 4; i++) {
      try {
        await customBreaker.execute(failingFn);
      } catch (error) {
        // Expected
      }
    }

    expect(customBreaker.getState()).toBe('CLOSED');

    // 5th failure should open
    try {
      await customBreaker.execute(failingFn);
    } catch (error) {
      // Expected
    }

    expect(customBreaker.getState()).toBe('OPEN');
  });
});

describe('Circuit Breaker - Edge Cases', () => {
  it('should handle immediate success after opening', async () => {
    const breaker = new CircuitBreaker(2, 1000);
    const failingFn = async () => {
      throw new Error('Failure');
    };
    const successFn = async () => 'Success';

    // Open the circuit
    for (let i = 0; i < 2; i++) {
      try {
        await breaker.execute(failingFn);
      } catch (error) {
        // Expected
      }
    }

    expect(breaker.getState()).toBe('OPEN');

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should transition to HALF_OPEN and then CLOSED on success
    const result = await breaker.execute(successFn);
    expect(result).toBe('Success');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should reopen if failure occurs in HALF_OPEN', async () => {
    const breaker = new CircuitBreaker(2, 1000);
    const failingFn = async () => {
      throw new Error('Failure');
    };

    // Open the circuit
    for (let i = 0; i < 2; i++) {
      try {
        await breaker.execute(failingFn);
      } catch (error) {
        // Expected
      }
    }

    // Wait for timeout to go HALF_OPEN
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Failure in HALF_OPEN should open again
    try {
      await breaker.execute(failingFn);
    } catch (error) {
      // Expected
    }

    expect(breaker.getState()).toBe('OPEN');
  });
});
