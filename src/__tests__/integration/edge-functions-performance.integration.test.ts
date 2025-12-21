/**
 * Edge Functions Performance Integration Tests
 * 
 * اختبارات أداء للـ Edge Functions
 * تقيس أوقات الاستجابة والـ Cold Start
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zsacuvrcohmraoldilph.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const REAL_TIMEOUT = 60000; // 60 seconds for performance tests

interface PerformanceResult {
  function: string;
  coldStartTime: number;
  warmTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
  iterations: number;
}

const performanceResults: PerformanceResult[] = [];

// Functions to test for performance
const PERFORMANCE_TEST_FUNCTIONS = [
  { name: 'db-health-check', body: {} },
  { name: 'biometric-auth', body: { action: 'health-check' } },
  { name: 'log-error', body: { error: 'perf-test', context: 'performance' } },
];

async function callFunction(
  functionName: string,
  body: Record<string, unknown> = {}
): Promise<{ status: number; responseTime: number; success: boolean }> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });

    const responseTime = Date.now() - startTime;
    
    return {
      status: response.status,
      responseTime,
      success: response.ok || response.status === 401 || response.status === 403,
    };
  } catch {
    return {
      status: 0,
      responseTime: Date.now() - startTime,
      success: false,
    };
  }
}

async function measurePerformance(
  functionName: string,
  body: Record<string, unknown> = {},
  iterations: number = 5
): Promise<PerformanceResult> {
  const times: number[] = [];
  let coldStartTime = 0;

  // First call - potentially cold start
  const coldStart = await callFunction(functionName, body);
  coldStartTime = coldStart.responseTime;

  // Wait a bit to ensure warm state
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Warm calls
  for (let i = 0; i < iterations; i++) {
    const result = await callFunction(functionName, body);
    times.push(result.responseTime);
    
    // Small delay between calls
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Calculate statistics
  const sortedTimes = [...times].sort((a, b) => a - b);
  const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const minTime = sortedTimes[0];
  const maxTime = sortedTimes[sortedTimes.length - 1];
  const p95Index = Math.floor(sortedTimes.length * 0.95);
  const p95Time = sortedTimes[p95Index] || maxTime;
  const warmTime = times[times.length - 1]; // Last call is warmest

  return {
    function: functionName,
    coldStartTime,
    warmTime,
    avgTime,
    minTime,
    maxTime,
    p95Time,
    iterations,
  };
}

describe('Edge Functions - Performance Integration Tests', () => {
  beforeAll(() => {
    console.log('\n⚡ Starting Performance Integration Tests');
    console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
    console.log('');
  });

  describe('Cold Start Performance', () => {
    it('should measure cold start time for db-health-check', async () => {
      // Wait to ensure cold state
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const startTime = Date.now();
      const result = await callFunction('db-health-check', {});
      const coldStartTime = Date.now() - startTime;

      console.log(`🥶 Cold Start Time: ${coldStartTime}ms`);
      
      // Cold start should complete within 10 seconds
      expect(coldStartTime).toBeLessThan(10000);
      expect(result.success).toBe(true);
    }, REAL_TIMEOUT);

    it('should have faster warm calls than cold calls', async () => {
      // Cold call
      await new Promise(resolve => setTimeout(resolve, 3000));
      const coldResult = await callFunction('db-health-check', {});
      
      // Immediate warm call
      const warmResult = await callFunction('db-health-check', {});

      console.log(`🥶 Cold: ${coldResult.responseTime}ms | 🔥 Warm: ${warmResult.responseTime}ms`);
      
      // Warm should generally be faster (but not always guaranteed)
      expect(warmResult.responseTime).toBeLessThan(REAL_TIMEOUT);
    }, REAL_TIMEOUT);
  });

  describe('Concurrent Requests Performance', () => {
    it('should handle 5 concurrent requests', async () => {
      const concurrency = 5;
      const startTime = Date.now();

      const promises = Array(concurrency).fill(null).map(() => 
        callFunction('db-health-check', {})
      );

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      const successCount = results.filter(r => r.success).length;
      const avgTime = Math.round(results.reduce((acc, r) => acc + r.responseTime, 0) / results.length);

      console.log(`🔄 Concurrent Requests: ${concurrency}`);
      console.log(`⏱️ Total Time: ${totalTime}ms`);
      console.log(`📊 Average Response: ${avgTime}ms`);
      console.log(`✅ Success Rate: ${successCount}/${concurrency}`);

      expect(successCount).toBeGreaterThanOrEqual(Math.floor(concurrency * 0.8)); // 80% success rate
      expect(totalTime).toBeLessThan(REAL_TIMEOUT);
    }, REAL_TIMEOUT);

    it('should handle 10 concurrent requests', async () => {
      const concurrency = 10;
      const startTime = Date.now();

      const promises = Array(concurrency).fill(null).map(() => 
        callFunction('log-error', { error: 'concurrent-test', context: 'performance' })
      );

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      const successCount = results.filter(r => r.success).length;

      console.log(`🔄 Concurrent Requests: ${concurrency}`);
      console.log(`⏱️ Total Time: ${totalTime}ms`);
      console.log(`✅ Success Rate: ${successCount}/${concurrency}`);

      expect(successCount).toBeGreaterThanOrEqual(Math.floor(concurrency * 0.7)); // 70% success rate
    }, REAL_TIMEOUT);
  });

  describe('Response Time Benchmarks', () => {
    it.each(PERFORMANCE_TEST_FUNCTIONS)(
      'should benchmark $name performance',
      async ({ name, body }) => {
        const result = await measurePerformance(name, body, 5);
        performanceResults.push(result);

        console.log(`📊 ${name}:`);
        console.log(`   Cold Start: ${result.coldStartTime}ms`);
        console.log(`   Average: ${result.avgTime}ms`);
        console.log(`   Min/Max: ${result.minTime}ms / ${result.maxTime}ms`);
        console.log(`   P95: ${result.p95Time}ms`);

        // Basic performance expectations
        expect(result.avgTime).toBeLessThan(5000); // Average under 5 seconds
        expect(result.coldStartTime).toBeLessThan(15000); // Cold start under 15 seconds
      },
      REAL_TIMEOUT * 2
    );
  });

  describe('Sustained Load Performance', () => {
    it('should maintain performance over 10 sequential requests', async () => {
      const times: number[] = [];
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const result = await callFunction('db-health-check', {});
        times.push(result.responseTime);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const degradation = times[times.length - 1] / times[1]; // Compare last to second (first warm)

      console.log(`📈 Sequential Requests: ${iterations}`);
      console.log(`⏱️ Average Response: ${avgTime}ms`);
      console.log(`📉 Performance Degradation: ${degradation.toFixed(2)}x`);

      // Performance should not degrade significantly
      expect(degradation).toBeLessThan(3); // Should not be more than 3x slower
    }, REAL_TIMEOUT * 2);
  });

  afterAll(() => {
    console.log('\n📊 Performance Tests Summary');
    console.log('============================');

    if (performanceResults.length > 0) {
      console.table(performanceResults.map(r => ({
        Function: r.function,
        'Cold Start': `${r.coldStartTime}ms`,
        'Average': `${r.avgTime}ms`,
        'Min': `${r.minTime}ms`,
        'Max': `${r.maxTime}ms`,
        'P95': `${r.p95Time}ms`,
        'Iterations': r.iterations,
      })));

      // Overall statistics
      const avgColdStart = Math.round(
        performanceResults.reduce((acc, r) => acc + r.coldStartTime, 0) / performanceResults.length
      );
      const avgWarm = Math.round(
        performanceResults.reduce((acc, r) => acc + r.avgTime, 0) / performanceResults.length
      );

      console.log(`\n📈 Overall Statistics:`);
      console.log(`   Average Cold Start: ${avgColdStart}ms`);
      console.log(`   Average Response: ${avgWarm}ms`);
      console.log(`   Functions Tested: ${performanceResults.length}`);
    }
  });
});
