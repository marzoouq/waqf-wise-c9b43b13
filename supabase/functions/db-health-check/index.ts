/**
 * Edge Function لفحص صحة قاعدة البيانات الشامل
 * Comprehensive Database Health Check Edge Function
 * 
 * ✅ محمي بـ: JWT + Role Check (admin/nazer) + Rate Limiting
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse, 
  forbiddenResponse 
} from '../_shared/cors.ts';

// ============ Rate Limiting - 10 طلبات/ساعة ============
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetIn: record.resetTime - now };
}

interface DuplicateIndex {
  table_name: string;
  index1: string;
  index2: string;
  column_definition: string;
  index1_size: string;
  index2_size: string;
}

interface DuplicatePolicy {
  table_name: string;
  policy1: string;
  policy2: string;
  command: string;
  policy1_qual: string;
  policy2_qual: string;
}

interface DeadRowsInfo {
  table_name: string;
  live_rows: number;
  dead_rows: number;
  dead_pct: number;
  last_vacuum: string | null;
  last_autovacuum: string | null;
}

interface QueryError {
  id: string;
  error_type: string;
  error_message: string;
  severity: string;
  created_at: string;
  error_stack: string | null;
}

interface HealthSummary {
  total_tables: number;
  total_indexes: number;
  duplicate_indexes: number;
  duplicate_policies: number;
  tables_with_dead_rows: number;
  total_dead_rows: number;
  db_size_mb: number;
  cache_hit_ratio: number;
}

interface DatabaseHealthReport {
  summary: HealthSummary;
  duplicateIndexes: DuplicateIndex[];
  duplicatePolicies: DuplicatePolicy[];
  deadRowsInfo: DeadRowsInfo[];
  queryErrors: QueryError[];
  timestamp: string;
  authMethod: string;
}

serve(async (req) => {
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
        if (bodyData.ping || bodyData.healthCheck || bodyData.testMode) {
          console.log('[db-health-check] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'db-health-check',
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
      console.log('[db-health-check] ✅ Authorized via CRON_SECRET');
      
      // Rate limiting للمهام المجدولة
      const rateLimitResult = checkRateLimit('cron_db_health');
      if (!rateLimitResult.allowed) {
        console.warn('[db-health-check] Rate limit exceeded for CRON');
        return errorResponse(`تجاوز الحد المسموح. يرجى الانتظار ${Math.ceil(rateLimitResult.resetIn / 60000)} دقيقة.`, 429);
      }
    }

    // 2️⃣ فحص JWT للمستخدمين
    if (!isAuthorized) {
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        console.warn('[db-health-check] ❌ No authentication provided');
        return unauthorizedResponse('المصادقة مطلوبة - يرجى تسجيل الدخول');
      }

      const token = authHeader.replace('Bearer ', '');
      
      const supabaseAuth = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
      
      if (authError || !user) {
        console.warn('[db-health-check] ❌ Invalid token:', authError?.message);
        return unauthorizedResponse('جلسة غير صالحة - يرجى إعادة تسجيل الدخول');
      }

      // فحص الصلاحيات - admin/nazer فقط
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: roles, error: rolesError } = await supabaseService
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('[db-health-check] Error fetching roles:', rolesError);
        return errorResponse('خطأ في التحقق من الصلاحيات', 500);
      }

      const allowedRoles = ['admin', 'nazer'];
      const hasAccess = roles?.some(r => allowedRoles.includes(r.role));

      if (!hasAccess) {
        console.warn(`[db-health-check] ❌ Forbidden - User ${user.id} lacks required role`);
        return forbiddenResponse('ليس لديك صلاحية لعرض صحة قاعدة البيانات - يتطلب صلاحية مدير أو ناظر');
      }

      isAuthorized = true;
      authorizedUserId = user.id;
      console.log(`[db-health-check] ✅ Authorized via JWT - User: ${user.id}`);

      // Rate limiting للمستخدمين
      const rateLimitResult = checkRateLimit(`user_${user.id}`);
      if (!rateLimitResult.allowed) {
        console.warn(`[db-health-check] Rate limit exceeded for user: ${user.id}`);
        return errorResponse(`تجاوزت الحد المسموح (${RATE_LIMIT} طلبات/ساعة). يرجى الانتظار.`, 429);
      }
    }

    console.log('[db-health-check] Starting health check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all health data in parallel
    const [
      summaryResult,
      duplicateIndexesResult,
      duplicatePoliciesResult,
      deadRowsResult,
      queryErrorsResult,
    ] = await Promise.all([
      supabase.rpc('get_database_health_summary'),
      supabase.rpc('get_duplicate_indexes'),
      supabase.rpc('get_duplicate_rls_policies'),
      supabase.rpc('get_dead_rows_percentage'),
      supabase.rpc('get_recent_query_errors', { p_limit: 50 }),
    ]);

    // Log any errors
    if (summaryResult.error) {
      console.error('[db-health-check] Summary error:', summaryResult.error);
    }
    if (duplicateIndexesResult.error) {
      console.error('[db-health-check] Duplicate indexes error:', duplicateIndexesResult.error);
    }
    if (duplicatePoliciesResult.error) {
      console.error('[db-health-check] Duplicate policies error:', duplicatePoliciesResult.error);
    }
    if (deadRowsResult.error) {
      console.error('[db-health-check] Dead rows error:', deadRowsResult.error);
    }
    if (queryErrorsResult.error) {
      console.error('[db-health-check] Query errors error:', queryErrorsResult.error);
    }

    const summary = summaryResult.data?.[0] || {
      total_tables: 0,
      total_indexes: 0,
      duplicate_indexes: 0,
      duplicate_policies: 0,
      tables_with_dead_rows: 0,
      total_dead_rows: 0,
      db_size_mb: 0,
      cache_hit_ratio: 0,
    };

    const report: DatabaseHealthReport = {
      summary: summary as HealthSummary,
      duplicateIndexes: (duplicateIndexesResult.data || []) as DuplicateIndex[],
      duplicatePolicies: (duplicatePoliciesResult.data || []) as DuplicatePolicy[],
      deadRowsInfo: (deadRowsResult.data || []) as DeadRowsInfo[],
      queryErrors: (queryErrorsResult.data || []) as QueryError[],
      timestamp: new Date().toISOString(),
      authMethod,
    };

    // تسجيل الوصول
    await supabase.from('audit_logs').insert({
      action_type: 'db_health_check',
      user_id: authorizedUserId,
      description: `فحص صحة قاعدة البيانات (${authMethod})`,
      new_values: { summary }
    });

    console.log('[db-health-check] Health check completed successfully');

    return jsonResponse({ success: true, data: report });

  } catch (error) {
    console.error('[db-health-check] Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'خطأ غير معروف',
      500
    );
  }
});
