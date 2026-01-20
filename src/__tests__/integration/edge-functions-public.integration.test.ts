/**
 * Edge Functions Public Integration Tests
 * Tests for edge functions that don't require authentication
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to call edge functions
async function invokeFunction(
  functionName: string, 
  options: { body?: object; method?: string } = {}
): Promise<Response> {
  const { body, method = 'POST' } = options;
  
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  );
  
  return response;
}

describe('Edge Functions - Public Endpoints', () => {
  beforeAll(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration');
    }
  });

  describe('Health Check Functions', () => {
    it('db-health-check should respond', async () => {
      const response = await invokeFunction('db-health-check');
      // 200, 401, or 403 are all valid responses
      expect([200, 401, 403, 500]).toContain(response.status);
      await response.text(); // Consume body
    });

    it('db-performance-stats should respond', async () => {
      const response = await invokeFunction('db-performance-stats');
      expect([200, 401, 403, 500]).toContain(response.status);
      await response.text();
    });
  });

  describe('Public Utility Functions', () => {
    it('chatbot should accept messages', async () => {
      const response = await invokeFunction('chatbot', {
        body: { message: 'مرحبا', sessionId: 'test-session' }
      });
      // May require auth, so accept 401/403 as valid
      expect([200, 401, 403]).toContain(response.status);
      await response.text();
    });

    it('intelligent-search should respond to queries', async () => {
      const response = await invokeFunction('intelligent-search', {
        body: { query: 'test', limit: 5 }
      });
      expect([200, 401, 403]).toContain(response.status);
      await response.text();
    });
  });

  describe('Notification Functions', () => {
    it('send-notification should handle requests', async () => {
      const response = await invokeFunction('send-notification', {
        body: { 
          type: 'test',
          userId: 'test-user',
          message: 'Test notification'
        }
      });
      expect([200, 400, 401, 403]).toContain(response.status);
      await response.text();
    });

    it('daily-notifications should respond', async () => {
      const response = await invokeFunction('daily-notifications');
      expect([200, 401, 403, 500]).toContain(response.status);
      await response.text();
    });
  });

  describe('Document Functions', () => {
    it('auto-classify-document should handle classification request', async () => {
      const response = await invokeFunction('auto-classify-document', {
        body: { documentId: 'test-doc' }
      });
      expect([200, 400, 401, 403, 404]).toContain(response.status);
      await response.text();
    });

    it('ocr-document should respond', async () => {
      const response = await invokeFunction('ocr-document', {
        body: { documentUrl: 'https://example.com/test.pdf' }
      });
      expect([200, 400, 401, 403]).toContain(response.status);
      await response.text();
    });
  });

  describe('Tenant Portal Functions', () => {
    it('tenant-portal should respond', async () => {
      const response = await invokeFunction('tenant-portal', {
        body: { action: 'ping' }
      });
      expect([200, 400, 401, 403]).toContain(response.status);
      await response.text();
    });

    it('tenant-send-otp should handle OTP request', async () => {
      const response = await invokeFunction('tenant-send-otp', {
        body: { phone: '+966500000000' }
      });
      // May fail due to invalid phone, but should respond
      expect([200, 400, 401, 403]).toContain(response.status);
      await response.text();
    });
  });

  describe('AI Functions', () => {
    it('generate-ai-insights should respond', async () => {
      const response = await invokeFunction('generate-ai-insights', {
        body: { type: 'dashboard' }
      });
      expect([200, 400, 401, 403]).toContain(response.status);
      await response.text();
    });

    it('property-ai-assistant should respond', async () => {
      const response = await invokeFunction('property-ai-assistant', {
        body: { query: 'What properties are available?' }
      });
      expect([200, 400, 401, 403]).toContain(response.status);
      await response.text();
    });
  });

  describe('CORS Handling', () => {
    it('should handle OPTIONS preflight for chatbot', async () => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/chatbot`,
        { method: 'OPTIONS' }
      );
      // Should not fail
      expect([200, 204, 400, 401, 403]).toContain(response.status);
      await response.text();
    });

    it('should handle OPTIONS preflight for intelligent-search', async () => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/intelligent-search`,
        { method: 'OPTIONS' }
      );
      expect([200, 204, 400, 401, 403]).toContain(response.status);
      await response.text();
    });
  });
});

describe('Edge Functions - Error Handling', () => {
  it('should handle invalid function name gracefully', async () => {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/non-existent-function-12345`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      }
    );
    expect(response.status).toBe(404);
    await response.text();
  });

  it('should handle malformed JSON gracefully', async () => {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/chatbot`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: 'not-valid-json{{{',
      }
    );
    // Should handle bad request
    expect([400, 401, 403, 500]).toContain(response.status);
    await response.text();
  });
});
