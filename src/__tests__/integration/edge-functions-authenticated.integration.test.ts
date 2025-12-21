/**
 * Edge Functions Authenticated Integration Tests
 * 
 * اختبارات تكامل للوظائف المحمية (مع JWT)
 * تتصل بـ Edge Functions الحقيقية مع مصادقة JWT
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zsacuvrcohmraoldilph.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Test User credentials (from CI environment or defaults)
const TEST_USER_EMAIL = import.meta.env.VITE_TEST_USER_EMAIL || 'ci-test@test.local';
const TEST_USER_PASSWORD = import.meta.env.VITE_TEST_USER_PASSWORD || 'TestPassword123!';

const REAL_TIMEOUT = 30000;

interface TestResult {
  function: string;
  category: string;
  status: number;
  responseTime: number;
  authenticated: boolean;
  success: boolean;
  error?: string;
}

const testResults: TestResult[] = [];

// Protected functions that require JWT
const PROTECTED_FUNCTIONS = [
  { name: 'ai-system-audit', category: 'AI', body: { action: 'health-check' } },
  { name: 'chatbot', category: 'AI', body: { message: 'ping', action: 'test' } },
  { name: 'intelligent-search', category: 'AI', body: { query: 'test', limit: 1 } },
  { name: 'encrypt-file', category: 'Security', body: { ping: true }, isFormData: false },
  { name: 'decrypt-file', category: 'Security', body: { ping: true } },
  { name: 'backup-database', category: 'Backup', body: { dryRun: true } },
  { name: 'restore-database', category: 'Backup', body: { dryRun: true } },
  { name: 'send-notification', category: 'Notification', body: { type: 'test', title: 'Test', message: 'Integration test' } },
  { name: 'reset-user-password', category: 'User', body: { dryRun: true } },
  { name: 'create-beneficiary-accounts', category: 'User', body: { dryRun: true } },
];

let accessToken: string | null = null;
let tokenObtained = false;

async function getTestJWT(): Promise<string | null> {
  try {
    console.log(`🔐 Attempting to get JWT for: ${TEST_USER_EMAIL}`);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/test-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.access_token) {
      console.log('✅ JWT obtained successfully');
      return data.access_token;
    } else {
      console.warn(`⚠️ Failed to get JWT: ${data.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error getting JWT: ${error}`);
    return null;
  }
}

async function callProtectedFunction(
  functionName: string,
  body: Record<string, unknown> = {},
  token: string | null = null
): Promise<{ status: number; responseTime: number; data?: unknown; error?: string }> {
  const startTime = Date.now();
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
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

describe('Edge Functions - Authenticated Integration Tests', () => {
  beforeAll(async () => {
    console.log('\n🔐 Starting Authenticated Edge Functions Integration Tests');
    console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
    console.log(`👤 Test User: ${TEST_USER_EMAIL}`);
    console.log('');

    // Try to get JWT for authenticated tests
    accessToken = await getTestJWT();
    tokenObtained = accessToken !== null;

    if (!tokenObtained) {
      console.warn('⚠️ Could not obtain JWT - authenticated tests will verify 401/403 behavior');
    }
  }, REAL_TIMEOUT * 2);

  describe('Protected Functions - Without JWT (Should Reject)', () => {
    it.each(PROTECTED_FUNCTIONS)(
      'should reject $name without JWT (401/403)',
      async ({ name, category, body }) => {
        const result = await callProtectedFunction(name, body, null);
        
        testResults.push({
          function: name,
          category,
          status: result.status,
          responseTime: result.responseTime,
          authenticated: false,
          success: result.status === 401 || result.status === 403,
          error: result.error,
        });

        // Protected functions should return 401 or 403 without JWT
        expect([401, 403]).toContain(result.status);
      },
      REAL_TIMEOUT
    );
  });

  describe('Protected Functions - With JWT (Should Accept)', () => {
    it.each(PROTECTED_FUNCTIONS)(
      'should accept $name with valid JWT',
      async ({ name, category, body }) => {
        // Skip if no token available
        if (!accessToken) {
          console.log(`⏭️ Skipping ${name} - no JWT available`);
          return;
        }

        const result = await callProtectedFunction(name, body, accessToken);
        
        testResults.push({
          function: name,
          category,
          status: result.status,
          responseTime: result.responseTime,
          authenticated: true,
          success: result.status !== 401 && result.status !== 403 && result.status !== 502 && result.status !== 503,
          error: result.error,
        });

        // Should not return auth errors with valid JWT
        expect(result.status).not.toBe(401);
        expect(result.status).not.toBe(403);
        // Should not be server errors
        expect(result.status).not.toBe(502);
        expect(result.status).not.toBe(503);
      },
      REAL_TIMEOUT
    );
  });

  describe('AI Functions - Detailed Tests', () => {
    it('should access ai-system-audit with health-check action', async () => {
      const result = await callProtectedFunction(
        'ai-system-audit',
        { action: 'health-check' },
        accessToken
      );

      if (accessToken) {
        expect(result.status).not.toBe(401);
        expect(result.status).not.toBe(403);
      } else {
        expect([401, 403]).toContain(result.status);
      }
    }, REAL_TIMEOUT);

    it('should access chatbot with test message', async () => {
      const result = await callProtectedFunction(
        'chatbot',
        { message: 'Hello, this is an integration test', action: 'chat' },
        accessToken
      );

      if (accessToken) {
        expect(result.status).not.toBe(401);
        expect(result.status).not.toBe(403);
      } else {
        expect([401, 403]).toContain(result.status);
      }
    }, REAL_TIMEOUT);

    it('should access intelligent-search with query', async () => {
      const result = await callProtectedFunction(
        'intelligent-search',
        { query: 'beneficiary', limit: 5 },
        accessToken
      );

      if (accessToken) {
        expect(result.status).not.toBe(401);
        expect(result.status).not.toBe(403);
      } else {
        expect([401, 403]).toContain(result.status);
      }
    }, REAL_TIMEOUT);
  });

  describe('Security Functions - Detailed Tests', () => {
    it('should verify encrypt-file requires JWT', async () => {
      const result = await callProtectedFunction(
        'encrypt-file',
        { ping: true },
        null
      );

      expect([401, 403]).toContain(result.status);
    }, REAL_TIMEOUT);

    it('should verify decrypt-file requires JWT', async () => {
      const result = await callProtectedFunction(
        'decrypt-file',
        { ping: true },
        null
      );

      expect([401, 403]).toContain(result.status);
    }, REAL_TIMEOUT);
  });

  describe('Backup Functions - Detailed Tests', () => {
    it('should verify backup-database requires JWT', async () => {
      const result = await callProtectedFunction(
        'backup-database',
        { dryRun: true },
        null
      );

      expect([401, 403]).toContain(result.status);
    }, REAL_TIMEOUT);

    it('should access backup-database with JWT in dry run mode', async () => {
      if (!accessToken) {
        console.log('⏭️ Skipping - no JWT available');
        return;
      }

      const result = await callProtectedFunction(
        'backup-database',
        { dryRun: true, tables: ['activities'] },
        accessToken
      );

      expect(result.status).not.toBe(401);
      expect(result.status).not.toBe(403);
    }, REAL_TIMEOUT);
  });

  afterAll(() => {
    console.log('\n📊 Authenticated Integration Tests Summary');
    console.log('==========================================');
    
    const unauthenticated = testResults.filter(r => !r.authenticated);
    const authenticated = testResults.filter(r => r.authenticated);
    
    const unauthSuccess = unauthenticated.filter(r => r.success).length;
    const authSuccess = authenticated.filter(r => r.success).length;

    console.log(`🔒 JWT Token: ${tokenObtained ? '✅ Obtained' : '❌ Not Available'}`);
    console.log('');
    console.log(`📋 Without JWT (should reject): ${unauthSuccess}/${unauthenticated.length} correct`);
    console.log(`🔓 With JWT (should accept): ${authSuccess}/${authenticated.length} correct`);
    console.log('');

    // Group by category
    const categories = [...new Set(testResults.map(r => r.category))];
    console.log('\nResults by Category:');
    categories.forEach(category => {
      const categoryResults = testResults.filter(r => r.category === category);
      const success = categoryResults.filter(r => r.success).length;
      console.log(`  ${category}: ${success}/${categoryResults.length}`);
    });

    console.log('');
    console.table(testResults.map(r => ({
      Function: r.function,
      Category: r.category,
      'With JWT': r.authenticated ? '✅' : '❌',
      Status: r.status,
      'Response Time': `${r.responseTime}ms`,
      Success: r.success ? '✅' : '❌',
    })));
  });
});
