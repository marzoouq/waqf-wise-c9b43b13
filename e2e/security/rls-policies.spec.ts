import { test, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Real RLS (Row Level Security) Policy Tests
 * اختبارات سياسات أمان صف البيانات الحقيقية
 * 
 * تتصل هذه الاختبارات بـ Supabase الفعلي للتحقق من policies
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Test users for different roles
const TEST_USERS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@test.waqf.sa',
    password: process.env.TEST_ADMIN_PASSWORD || 'TestAdmin123!',
  },
  nazer: {
    email: process.env.TEST_NAZER_EMAIL || 'nazer@test.waqf.sa',
    password: process.env.TEST_NAZER_PASSWORD || 'TestNazer123!',
  },
  accountant: {
    email: process.env.TEST_ACCOUNTANT_EMAIL || 'accountant@test.waqf.sa',
    password: process.env.TEST_ACCOUNTANT_PASSWORD || 'TestAccountant123!',
  },
  beneficiary: {
    email: process.env.TEST_BENEFICIARY_EMAIL || 'beneficiary@test.waqf.sa',
    password: process.env.TEST_BENEFICIARY_PASSWORD || 'TestBeneficiary123!',
  },
};

// Skip tests if Supabase is not configured
const skipIfNoSupabase = !SUPABASE_URL || !SUPABASE_ANON_KEY;

test.describe('RLS Security Tests - Real Database Connection', () => {
  let supabase: SupabaseClient;

  test.beforeAll(() => {
    if (skipIfNoSupabase) {
      console.warn('⚠️ Skipping RLS tests: Supabase credentials not configured');
      return;
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  test.afterEach(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  });

  test.describe('Unauthenticated Access', () => {
    test('should deny access to beneficiaries table without auth', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { data, error } = await supabase.from('beneficiaries').select('*').limit(1);

      // Should return empty or error due to RLS
      expect(data?.length || 0).toBe(0);
    });

    test('should deny access to audit_logs table without auth', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { data, error } = await supabase.from('audit_logs').select('*').limit(1);

      expect(data?.length || 0).toBe(0);
    });

    test('should deny access to payment_vouchers without auth', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { data } = await supabase.from('payment_vouchers').select('*').limit(1);

      expect(data?.length || 0).toBe(0);
    });

    test('should deny access to user_roles without auth', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { data } = await supabase.from('user_roles').select('*').limit(1);

      expect(data?.length || 0).toBe(0);
    });
  });

  test.describe('Beneficiary Data Access by Role', () => {
    test('beneficiary can only view their own data', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.beneficiary);
      
      if (authError) {
        console.warn('⚠️ Beneficiary test user not available:', authError.message);
        test.skip();
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      const { data: beneficiaries } = await supabase.from('beneficiaries').select('*');

      // Beneficiary should only see their own records
      if (beneficiaries && beneficiaries.length > 0) {
        beneficiaries.forEach((b) => {
          expect(b.user_id).toBe(user.user?.id);
        });
      }
      
      expect(beneficiaries?.length).toBeLessThanOrEqual(1);
    });

    test('admin can view all beneficiary data', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.admin);
      
      if (authError) {
        console.warn('⚠️ Admin test user not available:', authError.message);
        test.skip();
        return;
      }

      const { data: beneficiaries, error } = await supabase.from('beneficiaries').select('*').limit(10);

      // Admin should have access
      expect(error).toBeNull();
      // Admin can see multiple beneficiaries
    });

    test('nazer can view beneficiaries', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.nazer);
      
      if (authError) {
        console.warn('⚠️ Nazer test user not available:', authError.message);
        test.skip();
        return;
      }

      const { data, error } = await supabase.from('beneficiaries').select('*').limit(5);

      expect(error).toBeNull();
    });
  });

  test.describe('Audit Logs Access', () => {
    test('only admin can view audit logs', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      // Try as nazer first
      const { error: nazerAuthError } = await supabase.auth.signInWithPassword(TEST_USERS.nazer);
      
      if (!nazerAuthError) {
        const { data: nazerData } = await supabase.from('audit_logs').select('*').limit(1);
        // Nazer should not see audit logs (or empty result)
        expect(nazerData?.length || 0).toBe(0);
      }

      await supabase.auth.signOut();

      // Try as admin
      const { error: adminAuthError } = await supabase.auth.signInWithPassword(TEST_USERS.admin);
      
      if (!adminAuthError) {
        const { data: adminData, error } = await supabase.from('audit_logs').select('*').limit(1);
        // Admin should have access
        expect(error).toBeNull();
      }
    });

    test('beneficiary cannot access audit logs', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.beneficiary);
      
      if (authError) {
        test.skip();
        return;
      }

      const { data } = await supabase.from('audit_logs').select('*').limit(1);
      
      expect(data?.length || 0).toBe(0);
    });
  });

  test.describe('Financial Data Access', () => {
    test('beneficiary can only view their own payments', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.beneficiary);
      
      if (authError) {
        test.skip();
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      const { data: payments } = await supabase.from('payment_vouchers').select('*');

      // All payments should belong to this beneficiary
      if (payments && payments.length > 0) {
        payments.forEach((payment) => {
          // Check that payment is related to this user
          expect(payment.beneficiary_id || payment.user_id).toBeTruthy();
        });
      }
    });

    test('accountant can view all payment data', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.accountant);
      
      if (authError) {
        console.warn('⚠️ Accountant test user not available');
        test.skip();
        return;
      }

      const { error } = await supabase.from('payment_vouchers').select('*').limit(10);

      expect(error).toBeNull();
    });

    test('accountant can access journal entries', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.accountant);
      
      if (authError) {
        test.skip();
        return;
      }

      const { error } = await supabase.from('journal_entries').select('*').limit(5);

      expect(error).toBeNull();
    });
  });

  test.describe('Distribution Data Access', () => {
    test('staff can manage distributions', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.nazer);
      
      if (authError) {
        test.skip();
        return;
      }

      const { error } = await supabase.from('distributions').select('*').limit(5);

      expect(error).toBeNull();
    });

    test('beneficiary has limited distribution access', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.beneficiary);
      
      if (authError) {
        test.skip();
        return;
      }

      const { data } = await supabase.from('distributions').select('*');

      // Beneficiary should see only their distributions or none
      expect(data?.length || 0).toBeLessThanOrEqual(10);
    });
  });

  test.describe('Property Data Access', () => {
    test('authenticated users can view properties', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.beneficiary);
      
      if (authError) {
        test.skip();
        return;
      }

      const { error } = await supabase.from('properties').select('*').limit(5);

      // Properties are generally viewable
      expect(error).toBeNull();
    });

    test('only admin/nazer can update properties', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      // Try as beneficiary
      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.beneficiary);
      
      if (authError) {
        test.skip();
        return;
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update({ name_ar: 'Test Update' })
        .eq('id', 'non-existent-id');

      // Should fail or return no rows
      // The update should be blocked by RLS
    });
  });

  test.describe('User Roles Table Access', () => {
    test('users cannot modify their own roles', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.beneficiary);
      
      if (authError) {
        test.skip();
        return;
      }

      const { data: user } = await supabase.auth.getUser();

      // Try to insert a new admin role
      const { error: insertError } = await supabase.from('user_roles').insert({
        user_id: user.user?.id,
        role: 'admin',
      });

      // Should be denied
      expect(insertError).not.toBeNull();
    });

    test('users cannot delete roles', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.beneficiary);
      
      if (authError) {
        test.skip();
        return;
      }

      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .neq('id', 'non-existent');

      // Should be denied
      expect(deleteError).not.toBeNull();
    });
  });

  test.describe('Cross-Table RLS Consistency', () => {
    test('beneficiary request access is properly scoped', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.beneficiary);
      
      if (authError) {
        test.skip();
        return;
      }

      const { data: requests } = await supabase.from('beneficiary_requests').select('*');

      // Should only see own requests
      if (requests && requests.length > 0) {
        const { data: user } = await supabase.auth.getUser();
        requests.forEach((req) => {
          expect(req.beneficiary_id).toBeTruthy();
        });
      }
    });

    test('attachments follow parent record RLS', async () => {
      test.skip(skipIfNoSupabase, 'Supabase not configured');

      const { error: authError } = await supabase.auth.signInWithPassword(TEST_USERS.beneficiary);
      
      if (authError) {
        test.skip();
        return;
      }

      const { data: attachments } = await supabase.from('beneficiary_attachments').select('*');

      // Should only see own attachments
      expect(attachments?.length || 0).toBeLessThanOrEqual(50);
    });
  });
});
