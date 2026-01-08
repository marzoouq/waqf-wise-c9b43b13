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

    console.log('[run-vacuum] Starting comprehensive table analysis...');

    // التحقق من نوع الطلب: جدول محدد أو جميع الجداول
    const targetTable = bodyData.table as string | undefined;

    if (targetTable) {
      // ✅ تحليل جدول محدد
      console.log(`[run-vacuum] Analyzing single table: ${targetTable}`);
      
      const { data: result, error } = await supabase.rpc('vacuum_table', { 
        p_table_name: targetTable 
      });

      if (error) {
        console.error(`[run-vacuum] Error analyzing ${targetTable}:`, error);
        return errorResponse(`فشل تحليل الجدول ${targetTable}: ${error.message}`, 500);
      }

      // تسجيل العملية
      await supabase.from('audit_logs').insert({
        action_type: 'vacuum_table',
        user_id: authorizedUserId,
        description: `تم تحليل جدول ${targetTable}`,
        new_values: { table: targetTable, result, auth_method: authMethod }
      });

      return jsonResponse({
        success: true,
        message: `تم تحليل الجدول ${targetTable} بنجاح`,
        result,
        authMethod,
        timestamp: new Date().toISOString()
      });
    }

    // ✅ تحليل جميع الجداول باستخدام الدالة الجديدة
    console.log('[run-vacuum] Analyzing ALL tables using vacuum_all_tables()...');
    
    const { data: vacuumResult, error: vacuumError } = await supabase.rpc('vacuum_all_tables');

    if (vacuumError) {
      console.error('[run-vacuum] Error running vacuum_all_tables:', vacuumError);
      return errorResponse(`فشل تحليل الجداول: ${vacuumError.message}`, 500);
    }

    const result = vacuumResult as {
      success: boolean;
      total: number;
      analyzed: number;
      errors: number;
      tables: Array<{ table: string; status: string; dead_rows?: number }>;
      timestamp: string;
      note: string;
    };

    // تسجيل العملية
    await supabase.from('audit_logs').insert({
      action_type: 'run_vacuum_all',
      user_id: authorizedUserId,
      description: `تم تحليل ${result.analyzed} جدول من ${result.total} (${authMethod})`,
      new_values: {
        total: result.total,
        analyzed: result.analyzed,
        errors: result.errors,
        auth_method: authMethod
      }
    });

    console.log(`[run-vacuum] Completed - ${result.analyzed}/${result.total} tables analyzed`);

    return jsonResponse({ 
      success: true, 
      message: 'تم تحليل جميع الجداول بنجاح',
      results: result.tables,
      summary: {
        total: result.total,
        analyzed: result.analyzed,
        errors: result.errors,
        authMethod
      },
      note: result.note,
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
