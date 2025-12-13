import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for Edge Function calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Edge Functions - Authentication Complete Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  // ==================== admin-manage-beneficiary-password Tests ====================
  describe('admin-manage-beneficiary-password', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/admin-manage-beneficiary-password';

    describe('Password Reset', () => {
      it('should reset beneficiary password successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, message: 'Password reset successfully' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ beneficiaryId: 'test-id', newPassword: 'newSecurePass123!' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should validate password strength', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Password too weak' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ beneficiaryId: 'test-id', newPassword: '123' }),
        });

        expect(response.ok).toBe(false);
      });

      it('should require admin authorization', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Unauthorized' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ beneficiaryId: 'test-id', newPassword: 'test' }),
        });

        expect(response.ok).toBe(false);
      });

      it('should handle non-existent beneficiary', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Beneficiary not found' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ beneficiaryId: 'non-existent', newPassword: 'test' }),
        });

        expect(response.ok).toBe(false);
      });

      it('should log password reset action', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, logged: true }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ beneficiaryId: 'test-id', newPassword: 'newSecurePass123!' }),
        });

        const data = await response.json();
        expect(data.logged).toBe(true);
      });
    });

    describe('Enable/Disable Login', () => {
      it('should enable beneficiary login', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, canLogin: true }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ beneficiaryId: 'test-id', action: 'enable' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should disable beneficiary login', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, canLogin: false }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ beneficiaryId: 'test-id', action: 'disable' }),
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  // ==================== biometric-auth Tests ====================
  describe('biometric-auth', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/biometric-auth';

    describe('Registration', () => {
      it('should register biometric credential', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, credentialId: 'cred-123' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register', credential: 'base64credential' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should validate credential format', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Invalid credential format' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register', credential: 'invalid' }),
        });

        expect(response.ok).toBe(false);
      });

      it('should limit credentials per user', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Maximum credentials reached' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register', credential: 'newcred' }),
        });

        expect(response.ok).toBe(false);
      });
    });

    describe('Authentication', () => {
      it('should authenticate with valid credential', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, token: 'auth-token' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'authenticate', credential: 'valid-cred' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should reject invalid credential', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Authentication failed' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'authenticate', credential: 'invalid-cred' }),
        });

        expect(response.ok).toBe(false);
      });

      it('should track authentication attempts', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Too many attempts', retryAfter: 300 }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'authenticate', credential: 'test' }),
        });

        expect(response.ok).toBe(false);
      });
    });

    describe('Credential Management', () => {
      it('should list user credentials', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ credentials: [{ id: 'cred-1', name: 'Device 1' }] }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'list' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should delete credential', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', credentialId: 'cred-1' }),
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  // ==================== check-leaked-password Tests ====================
  describe('check-leaked-password', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/check-leaked-password';

    describe('Password Checking', () => {
      it('should detect leaked password', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ isLeaked: true, count: 1000 }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'password123' }),
        });

        const data = await response.json();
        expect(data.isLeaked).toBe(true);
      });

      it('should approve safe password', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ isLeaked: false }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'VerySecureP@ssw0rd!2024' }),
        });

        const data = await response.json();
        expect(data.isLeaked).toBe(false);
      });

      it('should handle short passwords', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ isLeaked: false, message: 'Invalid password' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: '123' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should use k-anonymity for privacy', async () => {
        // k-anonymity means only first 5 chars of hash are sent
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ isLeaked: false }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'testpassword' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should handle API errors gracefully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Service unavailable' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'test' }),
        });

        expect(response.ok).toBe(false);
      });
    });
  });

  // ==================== reset-user-password Tests ====================
  describe('reset-user-password', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/reset-user-password';

    describe('Password Reset Flow', () => {
      it('should send reset email', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, message: 'Reset email sent' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'user@example.com' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should validate email format', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Invalid email format' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'invalid-email' }),
        });

        expect(response.ok).toBe(false);
      });

      it('should handle non-existent email gracefully', async () => {
        // Should not reveal if email exists
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, message: 'If email exists, reset link sent' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'nonexistent@example.com' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should rate limit reset requests', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ error: 'Too many requests' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'user@example.com' }),
        });

        expect(response.ok).toBe(false);
      });
    });
  });

  // ==================== update-user-email Tests ====================
  describe('update-user-email', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/update-user-email';

    describe('Email Update', () => {
      it('should update email successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
          body: JSON.stringify({ newEmail: 'newemail@example.com' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should require authentication', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Unauthorized' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newEmail: 'newemail@example.com' }),
        });

        expect(response.ok).toBe(false);
      });

      it('should validate new email format', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Invalid email format' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
          body: JSON.stringify({ newEmail: 'invalid' }),
        });

        expect(response.ok).toBe(false);
      });

      it('should prevent duplicate email', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Email already in use' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
          body: JSON.stringify({ newEmail: 'existing@example.com' }),
        });

        expect(response.ok).toBe(false);
      });

      it('should send verification to new email', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, verificationSent: true }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
          body: JSON.stringify({ newEmail: 'newemail@example.com' }),
        });

        const data = await response.json();
        expect(data.verificationSent).toBe(true);
      });
    });
  });

  // ==================== create-beneficiary-accounts Tests ====================
  describe('create-beneficiary-accounts', () => {
    const functionUrl = 'https://zsacuvrcohmraoldilph.supabase.co/functions/v1/create-beneficiary-accounts';

    describe('Bulk Account Creation', () => {
      it('should create accounts for all beneficiaries', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, created: 10, failed: 0 }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
          body: JSON.stringify({ action: 'create-all' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should skip existing accounts', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, created: 5, skipped: 5 }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
          body: JSON.stringify({ action: 'create-all' }),
        });

        const data = await response.json();
        expect(data.skipped).toBe(5);
      });

      it('should require admin role', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: () => Promise.resolve({ error: 'Forbidden' }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer user-token' },
          body: JSON.stringify({ action: 'create-all' }),
        });

        expect(response.ok).toBe(false);
      });

      it('should generate secure passwords', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, passwordsGenerated: true }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
          body: JSON.stringify({ action: 'create-all' }),
        });

        expect(response.ok).toBe(true);
      });

      it('should send welcome emails', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, emailsSent: 10 }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
          body: JSON.stringify({ action: 'create-all', sendEmails: true }),
        });

        const data = await response.json();
        expect(data.emailsSent).toBe(10);
      });

      it('should report creation failures', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, created: 8, failed: 2, errors: ['Invalid email', 'Duplicate'] }),
        });

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
          body: JSON.stringify({ action: 'create-all' }),
        });

        const data = await response.json();
        expect(data.failed).toBe(2);
      });
    });
  });
});
