/**
 * Edge Functions Public Integration Tests
 * 
 * اختبارات تكامل للوظائف العامة (بدون JWT)
 * تتصل بـ Edge Functions الحقيقية للتحقق من صحة الاتصال
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zsacuvrcohmraoldilph.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const REAL_TIMEOUT = 30000;

interface TestResult {
  function: string;
  status: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

const testResults: TestResult[] = [];

// Public functions that don't require JWT
const PUBLIC_FUNCTIONS = [
  { name: 'db-health-check', method: 'POST', body: {} },
  { name: 'db-performance-stats', method: 'POST', body: {} },
  { name: 'run-vacuum', method: 'POST', body: { dryRun: true } },
  { name: 'weekly-maintenance', method: 'POST', body: { dryRun: true } },
  { name: 'biometric-auth', method: 'POST', body: { action: 'health-check' } },
  { name: 'contract-renewal-alerts', method: 'POST', body: { dryRun: true } },
  { name: 'log-error', method: 'POST', body: { error: 'test', context: 'integration-test' } },
];

async function callFunction(
  functionName: string, 
  method: string = 'POST', 
  body: Record<string, unknown> = {}
): Promise<{ status: number; responseTime: number; data?: unknown; error?: string }> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    });

    const responseTime = Date.now() - startTime;
    let data: unknown;
    
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    return {
      status: response.status,
      responseTime,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

describe('Edge Functions - Public Integration Tests', () => {
  beforeAll(() => {
    console.log('\n🔌 Starting Public Edge Functions Integration Tests');
    console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
    console.log(`🔑 API Key: ${SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing'}`);
    console.log('');
  });

  describe('Database Health Functions', () => {
    it('should connect to db-health-check', async () => {
      const result = await callFunction('db-health-check', 'POST', {});
      
      testResults.push({
        function: 'db-health-check',
        status: result.status,
        responseTime: result.responseTime,
        success: result.status !== 502 && result.status !== 503,
        error: result.error,
      });

      expect(result.status).not.toBe(502);
      expect(result.status).not.toBe(503);
      expect(result.responseTime).toBeLessThan(REAL_TIMEOUT);
    }, REAL_TIMEOUT);

    it('should connect to db-performance-stats', async () => {
      const result = await callFunction('db-performance-stats', 'POST', {});
      
      testResults.push({
        function: 'db-performance-stats',
        status: result.status,
        responseTime: result.responseTime,
        success: result.status !== 502 && result.status !== 503,
        error: result.error,
      });

      expect(result.status).not.toBe(502);
      expect(result.status).not.toBe(503);
    }, REAL_TIMEOUT);

    it('should connect to run-vacuum with dryRun', async () => {
      const result = await callFunction('run-vacuum', 'POST', { dryRun: true });
      
      testResults.push({
        function: 'run-vacuum',
        status: result.status,
        responseTime: result.responseTime,
        success: result.status !== 502 && result.status !== 503,
        error: result.error,
      });

      expect(result.status).not.toBe(502);
      expect(result.status).not.toBe(503);
    }, REAL_TIMEOUT);

    it('should connect to weekly-maintenance with dryRun', async () => {
      const result = await callFunction('weekly-maintenance', 'POST', { dryRun: true });
      
      testResults.push({
        function: 'weekly-maintenance',
        status: result.status,
        responseTime: result.responseTime,
        success: result.status !== 502 && result.status !== 503,
        error: result.error,
      });

      expect(result.status).not.toBe(502);
      expect(result.status).not.toBe(503);
    }, REAL_TIMEOUT);
  });

  describe('Security Functions', () => {
    it('should connect to biometric-auth', async () => {
      const result = await callFunction('biometric-auth', 'POST', { action: 'health-check' });
      
      testResults.push({
        function: 'biometric-auth',
        status: result.status,
        responseTime: result.responseTime,
        success: result.status !== 502 && result.status !== 503,
        error: result.error,
      });

      expect(result.status).not.toBe(502);
      expect(result.status).not.toBe(503);
    }, REAL_TIMEOUT);
  });

  describe('Utility Functions', () => {
    it('should connect to contract-renewal-alerts', async () => {
      const result = await callFunction('contract-renewal-alerts', 'POST', { dryRun: true });
      
      testResults.push({
        function: 'contract-renewal-alerts',
        status: result.status,
        responseTime: result.responseTime,
        success: result.status !== 502 && result.status !== 503,
        error: result.error,
      });

      expect(result.status).not.toBe(502);
      expect(result.status).not.toBe(503);
    }, REAL_TIMEOUT);

    it('should connect to log-error', async () => {
      const result = await callFunction('log-error', 'POST', { 
        error: 'Integration test error',
        context: 'integration-test',
        timestamp: new Date().toISOString()
      });
      
      testResults.push({
        function: 'log-error',
        status: result.status,
        responseTime: result.responseTime,
        success: result.status !== 502 && result.status !== 503,
        error: result.error,
      });

      expect(result.status).not.toBe(502);
      expect(result.status).not.toBe(503);
    }, REAL_TIMEOUT);
  });

  describe('Comprehensive Public Functions Check', () => {
    it.each(PUBLIC_FUNCTIONS)(
      'should successfully connect to $name',
      async ({ name, method, body }) => {
        const result = await callFunction(name, method, body);
        
        // Should not be server error or unavailable
        expect(result.status).not.toBe(500);
        expect(result.status).not.toBe(502);
        expect(result.status).not.toBe(503);
        expect(result.responseTime).toBeLessThan(REAL_TIMEOUT);
      },
      REAL_TIMEOUT
    );
  });

  afterAll(() => {
    console.log('\n📊 Public Integration Tests Summary');
    console.log('=====================================');
    
    const successful = testResults.filter(r => r.success).length;
    const failed = testResults.filter(r => !r.success).length;
    const avgResponseTime = testResults.length > 0
      ? Math.round(testResults.reduce((acc, r) => acc + r.responseTime, 0) / testResults.length)
      : 0;

    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️ Average Response Time: ${avgResponseTime}ms`);
    console.log('');
    
    console.table(testResults.map(r => ({
      Function: r.function,
      Status: r.status,
      'Response Time': `${r.responseTime}ms`,
      Success: r.success ? '✅' : '❌',
      Error: r.error || '-',
    })));
  });
});
