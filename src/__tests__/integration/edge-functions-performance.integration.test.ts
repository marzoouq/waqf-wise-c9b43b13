/**
 * Edge Functions Performance Integration Tests
 * Tests for edge function response times and concurrent load handling
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  COLD_START: 15000,      // 15 seconds for cold start
  WARM_RESPONSE: 5000,    // 5 seconds for warm response
  AI_RESPONSE: 30000,     // 30 seconds for AI functions
  CONCURRENT_5_SUCCESS: 0.8,   // 80% success rate for 5 concurrent
  CONCURRENT_10_SUCCESS: 0.7,  // 70% success rate for 10 concurrent
};

// Helper to measure function response time
async function measureFunctionTime(
  functionName: string,
  body?: object
): Promise<{ duration: number; status: number; success: boolean }> {
  const start = performance.now();
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY!,
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    );
    
    await response.text(); // Consume body
    const duration = performance.now() - start;
    
    return {
      duration,
      status: response.status,
      success: response.ok || response.status === 401 || response.status === 403,
    };
  } catch (error) {
    const duration = performance.now() - start;
    return { duration, status: 0, success: false };
  }
}

// Helper for concurrent requests
async function measureConcurrentRequests(
  functionName: string,
  count: number,
  body?: object
): Promise<{
  results: Array<{ duration: number; status: number; success: boolean }>;
  successRate: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
}> {
  const promises = Array(count)
    .fill(null)
    .map(() => measureFunctionTime(functionName, body));
  
  const results = await Promise.all(promises);
  const successful = results.filter(r => r.success).length;
  const durations = results.map(r => r.duration);
  
  return {
    results,
    successRate: successful / count,
    avgDuration: durations.reduce((a, b) => a + b, 0) / count,
    maxDuration: Math.max(...durations),
    minDuration: Math.min(...durations),
  };
}

describe('Edge Functions - Performance Tests', () => {
  beforeAll(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration');
    }
  });

  describe('Cold Start Performance', () => {
    it('db-health-check should respond within cold start threshold', async () => {
      const result = await measureFunctionTime('db-health-check');
      
      console.log(`db-health-check: ${result.duration.toFixed(2)}ms (status: ${result.status})`);
      
      expect(result.duration).toBeLessThan(THRESHOLDS.COLD_START);
    }, THRESHOLDS.COLD_START + 5000);

    it('chatbot should respond within cold start threshold', async () => {
      const result = await measureFunctionTime('chatbot', {
        message: 'ping',
        sessionId: 'perf-test'
      });
      
      console.log(`chatbot: ${result.duration.toFixed(2)}ms (status: ${result.status})`);
      
      expect(result.duration).toBeLessThan(THRESHOLDS.COLD_START);
    }, THRESHOLDS.COLD_START + 5000);

    it('intelligent-search should respond within cold start threshold', async () => {
      const result = await measureFunctionTime('intelligent-search', {
        query: 'test',
        limit: 5
      });
      
      console.log(`intelligent-search: ${result.duration.toFixed(2)}ms (status: ${result.status})`);
      
      expect(result.duration).toBeLessThan(THRESHOLDS.COLD_START);
    }, THRESHOLDS.COLD_START + 5000);
  });

  describe('Warm Response Performance', () => {
    it('db-health-check should be faster on second call', async () => {
      // First call (potential cold start)
      await measureFunctionTime('db-health-check');
      
      // Second call (should be warm)
      const result = await measureFunctionTime('db-health-check');
      
      console.log(`db-health-check (warm): ${result.duration.toFixed(2)}ms`);
      
      expect(result.duration).toBeLessThan(THRESHOLDS.WARM_RESPONSE);
    }, 30000);

    it('send-notification should respond quickly when warm', async () => {
      // Warm up
      await measureFunctionTime('send-notification', { type: 'ping' });
      
      // Measure warm response
      const result = await measureFunctionTime('send-notification', {
        type: 'test',
        message: 'performance test'
      });
      
      console.log(`send-notification (warm): ${result.duration.toFixed(2)}ms`);
      
      expect(result.duration).toBeLessThan(THRESHOLDS.WARM_RESPONSE);
    }, 30000);
  });

  describe('Concurrent Request Handling', () => {
    it('should handle 5 concurrent requests with 80% success', async () => {
      const result = await measureConcurrentRequests('db-health-check', 5);
      
      console.log(`5 concurrent requests:
        Success rate: ${(result.successRate * 100).toFixed(1)}%
        Avg duration: ${result.avgDuration.toFixed(2)}ms
        Min duration: ${result.minDuration.toFixed(2)}ms
        Max duration: ${result.maxDuration.toFixed(2)}ms`);
      
      expect(result.successRate).toBeGreaterThanOrEqual(THRESHOLDS.CONCURRENT_5_SUCCESS);
    }, 60000);

    it('should handle 10 concurrent requests with 70% success', async () => {
      const result = await measureConcurrentRequests('db-health-check', 10);
      
      console.log(`10 concurrent requests:
        Success rate: ${(result.successRate * 100).toFixed(1)}%
        Avg duration: ${result.avgDuration.toFixed(2)}ms
        Min duration: ${result.minDuration.toFixed(2)}ms
        Max duration: ${result.maxDuration.toFixed(2)}ms`);
      
      expect(result.successRate).toBeGreaterThanOrEqual(THRESHOLDS.CONCURRENT_10_SUCCESS);
    }, 90000);

    it('should handle mixed function concurrent requests', async () => {
      const functions = [
        'db-health-check',
        'send-notification',
        'intelligent-search',
        'chatbot',
        'db-performance-stats'
      ];
      
      const promises = functions.map(fn => 
        measureFunctionTime(fn, fn === 'chatbot' 
          ? { message: 'test', sessionId: 'perf' }
          : fn === 'intelligent-search'
            ? { query: 'test', limit: 5 }
            : undefined
        )
      );
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      const successRate = successful / functions.length;
      
      console.log(`Mixed concurrent requests:
        Success rate: ${(successRate * 100).toFixed(1)}%
        Results: ${results.map((r, i) => `${functions[i]}: ${r.status}`).join(', ')}`);
      
      expect(successRate).toBeGreaterThanOrEqual(0.6); // At least 60% should respond
    }, 60000);
  });

  describe('AI Function Performance', () => {
    it('chatbot should respond within AI threshold', async () => {
      const result = await measureFunctionTime('chatbot', {
        message: 'ما هي خدمات الوقف؟',
        sessionId: 'perf-test-ai'
      });
      
      console.log(`chatbot (AI query): ${result.duration.toFixed(2)}ms (status: ${result.status})`);
      
      // AI functions have longer thresholds
      expect(result.duration).toBeLessThan(THRESHOLDS.AI_RESPONSE);
    }, THRESHOLDS.AI_RESPONSE + 5000);

    it('generate-ai-insights should respond within AI threshold', async () => {
      const result = await measureFunctionTime('generate-ai-insights', {
        type: 'quick'
      });
      
      console.log(`generate-ai-insights: ${result.duration.toFixed(2)}ms (status: ${result.status})`);
      
      expect(result.duration).toBeLessThan(THRESHOLDS.AI_RESPONSE);
    }, THRESHOLDS.AI_RESPONSE + 5000);

    it('property-ai-assistant should respond within AI threshold', async () => {
      const result = await measureFunctionTime('property-ai-assistant', {
        query: 'summarize properties'
      });
      
      console.log(`property-ai-assistant: ${result.duration.toFixed(2)}ms (status: ${result.status})`);
      
      expect(result.duration).toBeLessThan(THRESHOLDS.AI_RESPONSE);
    }, THRESHOLDS.AI_RESPONSE + 5000);
  });

  describe('Database Function Performance', () => {
    it('db-health-check should have consistent response times', async () => {
      const iterations = 3;
      const results: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const result = await measureFunctionTime('db-health-check');
        results.push(result.duration);
        // Small delay between requests
        await new Promise(r => setTimeout(r, 500));
      }
      
      const avg = results.reduce((a, b) => a + b, 0) / iterations;
      const variance = results.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / iterations;
      const stdDev = Math.sqrt(variance);
      
      console.log(`db-health-check consistency:
        Results: ${results.map(r => r.toFixed(0)).join('ms, ')}ms
        Avg: ${avg.toFixed(2)}ms
        Std Dev: ${stdDev.toFixed(2)}ms`);
      
      // Standard deviation should be less than 50% of average (reasonable consistency)
      expect(stdDev).toBeLessThan(avg * 0.5);
    }, 60000);

    it('db-performance-stats should respond in reasonable time', async () => {
      const result = await measureFunctionTime('db-performance-stats');
      
      console.log(`db-performance-stats: ${result.duration.toFixed(2)}ms (status: ${result.status})`);
      
      expect(result.duration).toBeLessThan(THRESHOLDS.COLD_START);
    }, THRESHOLDS.COLD_START + 5000);
  });

  describe('Performance Summary Report', () => {
    it('should generate performance summary', async () => {
      const testFunctions = [
        { name: 'db-health-check', category: 'DB' },
        { name: 'chatbot', category: 'AI', body: { message: 'test', sessionId: 'summary' } },
        { name: 'send-notification', category: 'Utility', body: { type: 'test' } },
        { name: 'intelligent-search', category: 'Search', body: { query: 'test', limit: 5 } },
      ];
      
      const results: Array<{ name: string; category: string; duration: number; status: number }> = [];
      
      for (const fn of testFunctions) {
        const result = await measureFunctionTime(fn.name, fn.body);
        results.push({
          name: fn.name,
          category: fn.category,
          duration: result.duration,
          status: result.status,
        });
      }
      
      console.log('\n📊 Performance Summary Report:');
      console.log('=' .repeat(60));
      results.forEach(r => {
        const status = r.status >= 200 && r.status < 400 ? '✅' : 
                       r.status === 401 || r.status === 403 ? '🔒' : '❌';
        console.log(`${status} ${r.category.padEnd(10)} | ${r.name.padEnd(25)} | ${r.duration.toFixed(0).padStart(6)}ms`);
      });
      console.log('=' .repeat(60));
      
      const avgDuration = results.reduce((a, b) => a + b.duration, 0) / results.length;
      console.log(`Average Response Time: ${avgDuration.toFixed(2)}ms`);
      
      // At least some functions should respond successfully
      const respondedCount = results.filter(r => r.status > 0).length;
      expect(respondedCount).toBeGreaterThan(0);
    }, 120000);
  });
});
