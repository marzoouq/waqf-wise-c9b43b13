/**
 * Edge Function لتشغيل VACUUM ANALYZE على الجداول
 * Run VACUUM ANALYZE Edge Function
 * 
 * ✅ محمي بـ: CRON_SECRET + JWT + Role Check (admin) + Rate Limiting
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse, 
  forbiddenResponse 
} from '../_shared/cors.ts';

// ============ Rate Limiting ============
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_CRON = 4;  // 4 تشغيلات/ساعة للمهام المجدولة
const RATE_LIMIT_USER = 2;  // 2 تشغيل/ساعة للمستخدمين
const RATE_WINDOW = 60 * 60 * 1000; // ساعة واحدة

function checkRateLimit(identifier: string, limit: number): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: limit - 1, resetIn: RATE_WINDOW };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count, resetIn: record.resetTime - now };
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ قراءة body مرة واحدة فقط
    const bodyText = await req.text();
    let bodyData: Record<string, unknown> = {};
    
    if (bodyText) {
      try {
        bodyData = JSON.parse(bodyText);
        
        // ✅ Health Check Support
        if (bodyData.ping || bodyData.healthCheck) {
          console.log('[run-vacuum] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'run-vacuum',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }

    // ============ المصادقة والتفويض ============
    let isAuthorized = false;
    let authMethod: 'cron' | 'jwt' = 'jwt';
    let authorizedUserId: string | null = null;

    // 1️⃣ فحص CRON_SECRET للمهام المجدولة
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedCronSecret = Deno.env.get('CRON_SECRET');
    
    if (cronSecret && expectedCronSecret && cronSecret === expectedCronSecret) {
      isAuthorized = true;
      authMethod = 'cron';
      console.log('[run-vacuum] ✅ Authorized via CRON_SECRET');
      
      // Rate limiting للمهام المجدولة
      const rateLimitResult = checkRateLimit('cron_vacuum', RATE_LIMIT_CRON);
      if (!rateLimitResult.allowed) {
        console.warn('[run-vacuum] Rate limit exceeded for CRON');
        return errorResponse(`تجاوز الحد المسموح. يرجى الانتظار ${Math.ceil(rateLimitResult.resetIn / 60000)} دقيقة.`, 429);
      }
    }

    // 2️⃣ فحص JWT للمستخدمين
    if (!isAuthorized) {
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        console.warn('[run-vacuum] ❌ No authentication provided');
        return unauthorizedResponse('المصادقة مطلوبة - يرجى تسجيل الدخول');
      }

      const token = authHeader.replace('Bearer ', '');
      
      const supabaseAuth = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
      
      if (authError || !user) {
        console.warn('[run-vacuum] ❌ Invalid token:', authError?.message);
        return unauthorizedResponse('جلسة غير صالحة - يرجى إعادة تسجيل الدخول');
      }

      // فحص الصلاحيات - admin فقط
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: roles, error: rolesError } = await supabaseService
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('[run-vacuum] Error fetching roles:', rolesError);
        return errorResponse('خطأ في التحقق من الصلاحيات', 500);
      }

      const hasAccess = roles?.some(r => r.role === 'admin');

      if (!hasAccess) {
        console.warn(`[run-vacuum] ❌ Forbidden - User ${user.id} is not admin`);
        return forbiddenResponse('ليس لديك صلاحية لتشغيل VACUUM - يتطلب صلاحية مدير');
      }

      isAuthorized = true;
      authorizedUserId = user.id;
      console.log(`[run-vacuum] ✅ Authorized via JWT - Admin: ${user.id}`);

      // Rate limiting للمستخدمين
      const rateLimitResult = checkRateLimit(`user_${user.id}`, RATE_LIMIT_USER);
      if (!rateLimitResult.allowed) {
        console.warn(`[run-vacuum] Rate limit exceeded for user: ${user.id}`);
        return errorResponse(`تجاوزت الحد المسموح (${RATE_LIMIT_USER} تشغيلات/ساعة). يرجى الانتظار.`, 429);
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceKey);

    console.log('[run-vacuum] Starting table analysis...');

    // قائمة شاملة لجميع الجداول
    const tables = [
      // الجداول الأساسية
      'accounts', 'beneficiaries', 'contracts', 'distributions',
      'families', 'fiscal_years', 'invoices', 'journal_entries',
      'journal_entry_lines', 'loans', 'notifications', 'payments',
      'payment_vouchers', 'profiles', 'properties', 'rental_payments',
      'tenants', 'user_roles',
      // الجداول المالية
      'bank_accounts', 'bank_statements', 'bank_transactions',
      'bank_reconciliation_matches', 'opening_balances', 'pos_transactions',
      'tenant_ledger',
      // جداول المستفيدين
      'beneficiary_attachments', 'beneficiary_requests',
      'beneficiary_activity_log', 'beneficiary_changes_log',
      'beneficiary_tags', 'distribution_details',
      // جداول النظام
      'system_alerts', 'audit_logs', 'approval_status',
      'approval_steps', 'documents', 'maintenance_requests',
      'support_tickets',
      // جداول أخرى
      'annual_disclosures', 'fiscal_year_closings',
      'waqf_distribution_settings', 'historical_invoices',
      'zatca_submission_log'
    ];

    const results: Array<{ table: string; status: string; reason?: string }> = [];

    for (const table of tables) {
      try {
        // تشغيل ANALYZE (VACUUM يتطلب صلاحيات خاصة)
        const { error } = await supabase.rpc('analyze_table', { p_table_name: table });
        
        if (error) {
          results.push({ table, status: 'skipped', reason: error.message });
        } else {
          results.push({ table, status: 'analyzed' });
        }
      } catch (e) {
        results.push({ table, status: 'error', reason: String(e) });
      }
    }

    // تسجيل العملية
    await supabase.from('audit_logs').insert({
      action_type: 'run_vacuum',
      user_id: authorizedUserId,
      description: `تم تحليل ${results.filter(r => r.status === 'analyzed').length} جدول (${authMethod})`,
      new_values: {
        total_tables: tables.length,
        analyzed: results.filter(r => r.status === 'analyzed').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        errors: results.filter(r => r.status === 'error').length,
        auth_method: authMethod
      }
    });

    console.log(`[run-vacuum] Completed - ${results.filter(r => r.status === 'analyzed').length}/${tables.length} tables analyzed`);

    return jsonResponse({ 
      success: true, 
      message: 'تم تحليل الجداول بنجاح',
      results,
      summary: {
        total: tables.length,
        analyzed: results.filter(r => r.status === 'analyzed').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        errors: results.filter(r => r.status === 'error').length,
        authMethod
      },
      note: 'VACUUM الكامل يتم تلقائياً بواسطة autovacuum',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[run-vacuum] Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : String(error),
      500
    );
  }
});
