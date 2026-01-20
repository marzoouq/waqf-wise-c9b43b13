/**
 * Edge Functions Authenticated Integration Tests
 * Tests for edge functions that require user authentication
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const TEST_USER_EMAIL = import.meta.env.VITE_TEST_USER_EMAIL;
const TEST_USER_PASSWORD = import.meta.env.VITE_TEST_USER_PASSWORD;

// Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

let authToken: string | null = null;

// Helper to call authenticated edge functions
async function invokeAuthenticatedFunction(
  functionName: string,
  options: { body?: object; method?: string } = {}
): Promise<Response> {
  const { body, method = 'POST' } = options;
  
  if (!authToken) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'apikey': SUPABASE_ANON_KEY!,
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  );
  
  return response;
}

describe('Edge Functions - Authenticated Endpoints', () => {
  beforeAll(async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration');
    }

    // Skip if no test credentials
    if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
      console.warn('⚠️ Test credentials not configured - some tests will be skipped');
      return;
    }

    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });

    if (error) {
      console.warn('⚠️ Authentication failed:', error.message);
      return;
    }

    authToken = data.session?.access_token || null;
    console.log('✅ Authenticated for tests');
  });

  afterAll(async () => {
    if (authToken) {
      await supabase.auth.signOut();
      authToken = null;
    }
  });

  describe('Admin Functions', () => {
    it.skipIf(!authToken)('admin-manage-beneficiary-password should respond', async () => {
      const response = await invokeAuthenticatedFunction('admin-manage-beneficiary-password', {
        body: { action: 'check', beneficiaryId: 'test' }
      });
      expect([200, 400, 403, 404]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('reset-user-password should handle request', async () => {
      const response = await invokeAuthenticatedFunction('reset-user-password', {
        body: { userId: 'test-user-id' }
      });
      expect([200, 400, 403, 404]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('update-user-email should handle request', async () => {
      const response = await invokeAuthenticatedFunction('update-user-email', {
        body: { userId: 'test-user-id', newEmail: 'test@example.com' }
      });
      expect([200, 400, 403, 404]).toContain(response.status);
      await response.text();
    });
  });

  describe('Financial Functions', () => {
    it.skipIf(!authToken)('distribute-revenue should respond', async () => {
      const response = await invokeAuthenticatedFunction('distribute-revenue', {
        body: { simulate: true }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('simulate-distribution should work', async () => {
      const response = await invokeAuthenticatedFunction('simulate-distribution', {
        body: { amount: 10000 }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('auto-create-journal should respond', async () => {
      const response = await invokeAuthenticatedFunction('auto-create-journal', {
        body: { 
          triggerEvent: 'test',
          amount: 1000,
          referenceId: 'test-ref'
        }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('calculate-cash-flow should respond', async () => {
      const response = await invokeAuthenticatedFunction('calculate-cash-flow', {
        body: { period: 'monthly' }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('link-voucher-journal should respond', async () => {
      const response = await invokeAuthenticatedFunction('link-voucher-journal', {
        body: { voucherId: 'test-voucher' }
      });
      expect([200, 400, 403, 404]).toContain(response.status);
      await response.text();
    });
  });

  describe('Fiscal Year Functions', () => {
    it.skipIf(!authToken)('publish-fiscal-year should respond', async () => {
      const response = await invokeAuthenticatedFunction('publish-fiscal-year', {
        body: { fiscalYearId: 'test-year', preview: true }
      });
      expect([200, 400, 403, 404]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('auto-close-fiscal-year should respond', async () => {
      const response = await invokeAuthenticatedFunction('auto-close-fiscal-year', {
        body: { preview: true }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });
  });

  describe('Report Functions', () => {
    it.skipIf(!authToken)('weekly-report should respond', async () => {
      const response = await invokeAuthenticatedFunction('weekly-report');
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('generate-scheduled-report should respond', async () => {
      const response = await invokeAuthenticatedFunction('generate-scheduled-report', {
        body: { reportType: 'daily' }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('generate-distribution-summary should respond', async () => {
      const response = await invokeAuthenticatedFunction('generate-distribution-summary');
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });
  });

  describe('Audit & Security Functions', () => {
    it.skipIf(!authToken)('ai-system-audit should respond', async () => {
      const response = await invokeAuthenticatedFunction('ai-system-audit', {
        body: { quick: true }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('log-error should accept error logs', async () => {
      const response = await invokeAuthenticatedFunction('log-error', {
        body: {
          error: 'Test error',
          context: 'integration-test',
          severity: 'low'
        }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('check-leaked-password should respond', async () => {
      const response = await invokeAuthenticatedFunction('check-leaked-password', {
        body: { password: 'test123' }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });
  });

  describe('Backup & Maintenance Functions', () => {
    it.skipIf(!authToken)('backup-database should respond', async () => {
      const response = await invokeAuthenticatedFunction('backup-database', {
        body: { dryRun: true }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('weekly-maintenance should respond', async () => {
      const response = await invokeAuthenticatedFunction('weekly-maintenance', {
        body: { preview: true }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('run-vacuum should respond', async () => {
      const response = await invokeAuthenticatedFunction('run-vacuum', {
        body: { analyze: true }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('cleanup-old-files should respond', async () => {
      const response = await invokeAuthenticatedFunction('cleanup-old-files', {
        body: { dryRun: true }
      });
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });
  });

  describe('Contract Functions', () => {
    it.skipIf(!authToken)('contract-renewal-alerts should respond', async () => {
      const response = await invokeAuthenticatedFunction('contract-renewal-alerts');
      expect([200, 400, 403]).toContain(response.status);
      await response.text();
    });
  });

  describe('ZATCA Functions', () => {
    it.skipIf(!authToken)('zatca-submit should handle submission', async () => {
      const response = await invokeAuthenticatedFunction('zatca-submit', {
        body: { 
          invoiceId: 'test-invoice',
          preview: true
        }
      });
      expect([200, 400, 403, 404]).toContain(response.status);
      await response.text();
    });
  });

  describe('File Security Functions', () => {
    it.skipIf(!authToken)('encrypt-file should respond', async () => {
      const response = await invokeAuthenticatedFunction('encrypt-file', {
        body: { fileId: 'test-file' }
      });
      expect([200, 400, 403, 404]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('decrypt-file should respond', async () => {
      const response = await invokeAuthenticatedFunction('decrypt-file', {
        body: { fileId: 'test-file' }
      });
      expect([200, 400, 403, 404]).toContain(response.status);
      await response.text();
    });

    it.skipIf(!authToken)('secure-delete-file should respond', async () => {
      const response = await invokeAuthenticatedFunction('secure-delete-file', {
        body: { fileId: 'test-file', confirm: false }
      });
      expect([200, 400, 403, 404]).toContain(response.status);
      await response.text();
    });
  });
});

describe('Edge Functions - Authentication Enforcement', () => {
  it('should reject unauthenticated requests to admin functions', async () => {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/admin-manage-beneficiary-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ action: 'check' }),
      }
    );
    
    // Should require authentication
    expect([401, 403]).toContain(response.status);
    await response.text();
  });

  it('should reject unauthenticated requests to financial functions', async () => {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/distribute-revenue`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ simulate: true }),
      }
    );
    
    expect([401, 403]).toContain(response.status);
    await response.text();
  });

  it('should reject unauthenticated requests to backup functions', async () => {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/backup-database`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ dryRun: true }),
      }
    );
    
    expect([401, 403]).toContain(response.status);
    await response.text();
  });
});
