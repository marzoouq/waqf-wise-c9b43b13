/**
 * Edge Function لإحصائيات أداء قاعدة البيانات
 * Database Performance Statistics Edge Function
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

// الـ schemas النظامية التي يجب استبعادها من الإحصائيات
const SYSTEM_SCHEMAS = [
  'auth',
  'realtime', 
  'storage',
  'net',
  'vault',
  'supabase_functions',
  'supabase_migrations',
  'extensions',
  'graphql',
  'graphql_public',
  'pgsodium',
  'pgsodium_masks',
];

interface TableStats {
  table_name: string;
  schema_name?: string;
  seq_scan: number;
  idx_scan: number;
  seq_pct: number;
  dead_rows: number;
  live_rows: number;
}

interface ConnectionStats {
  state: string;
  count: number;
  max_idle_seconds: number;
}

interface DBPerformanceStats {
  sequentialScans: TableStats[];
  cacheHitRatio: number;
  connections: ConnectionStats[];
  totalDeadRows: number;
  dbSizeMb: number;
  timestamp: string;
  filteredSchemas?: string[];
  originalTableCount?: number;
  filteredTableCount?: number;
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
        if (bodyData.ping || bodyData.healthCheck) {
          console.log('[db-performance-stats] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'db-performance-stats',
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
      console.log('[db-performance-stats] ✅ Authorized via CRON_SECRET');
      
      // Rate limiting للمهام المجدولة
      const rateLimitResult = checkRateLimit('cron_db_perf');
      if (!rateLimitResult.allowed) {
        console.warn('[db-performance-stats] Rate limit exceeded for CRON');
        return errorResponse(`تجاوز الحد المسموح. يرجى الانتظار ${Math.ceil(rateLimitResult.resetIn / 60000)} دقيقة.`, 429);
      }
    }

    // 2️⃣ فحص JWT للمستخدمين
    if (!isAuthorized) {
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        console.warn('[db-performance-stats] ❌ No authentication provided');
        return unauthorizedResponse('المصادقة مطلوبة - يرجى تسجيل الدخول');
      }

      const token = authHeader.replace('Bearer ', '');
      
      const supabaseAuth = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
      
      if (authError || !user) {
        console.warn('[db-performance-stats] ❌ Invalid token:', authError?.message);
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
        console.error('[db-performance-stats] Error fetching roles:', rolesError);
        return errorResponse('خطأ في التحقق من الصلاحيات', 500);
      }

      const allowedRoles = ['admin', 'nazer'];
      const hasAccess = roles?.some(r => allowedRoles.includes(r.role));

      if (!hasAccess) {
        console.warn(`[db-performance-stats] ❌ Forbidden - User ${user.id} lacks required role`);
        return forbiddenResponse('ليس لديك صلاحية لعرض إحصائيات الأداء - يتطلب صلاحية مدير أو ناظر');
      }

      isAuthorized = true;
      authorizedUserId = user.id;
      console.log(`[db-performance-stats] ✅ Authorized via JWT - User: ${user.id}`);

      // Rate limiting للمستخدمين
      const rateLimitResult = checkRateLimit(`user_${user.id}`);
      if (!rateLimitResult.allowed) {
        console.warn(`[db-performance-stats] Rate limit exceeded for user: ${user.id}`);
        return errorResponse(`تجاوزت الحد المسموح (${RATE_LIMIT} طلبات/ساعة). يرجى الانتظار.`, 429);
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ تخزين أدوار المستخدم في الجلسة للكاش (تحسين الأداء)
    if (authorizedUserId) {
      try {
        await supabase.rpc('cache_user_roles');
      } catch {
        console.log('[db-performance-stats] cache_user_roles skipped (service role)');
      }
    }

    // Get all stats in parallel
    const [tableStats, cacheData, connData, sizeData] = await Promise.all([
      supabase.rpc('get_table_scan_stats'),
      supabase.rpc('get_cache_hit_ratio'),
      supabase.rpc('get_connection_stats'),
      supabase.rpc('get_database_size'),
    ]);

    // فلترة الجداول النظامية
    const filteredTableStats = (tableStats.data || []).filter((t: TableStats) => {
      const schemaName = t.schema_name || 'public';
      return !SYSTEM_SCHEMAS.includes(schemaName);
    });

    const stats: DBPerformanceStats = {
      sequentialScans: filteredTableStats,
      cacheHitRatio: cacheData.data?.[0]?.cache_hit_ratio || 0,
      connections: connData.data || [],
      totalDeadRows: filteredTableStats.reduce((sum: number, t: TableStats) => sum + (t.dead_rows || 0), 0),
      dbSizeMb: sizeData.data?.[0]?.size_mb || 0,
      timestamp: new Date().toISOString(),
      filteredSchemas: SYSTEM_SCHEMAS,
      originalTableCount: tableStats.data?.length || 0,
      filteredTableCount: filteredTableStats.length,
      authMethod,
    };

    // تسجيل الوصول
    await supabase.from('audit_logs').insert({
      action_type: 'db_performance_stats',
      user_id: authorizedUserId,
      description: `عرض إحصائيات أداء قاعدة البيانات (${authMethod})`,
      new_values: { 
        tables: stats.filteredTableCount,
        cacheHit: stats.cacheHitRatio,
        deadRows: stats.totalDeadRows 
      }
    });

    console.log('[db-performance-stats] Stats fetched successfully:', {
      tables: stats.sequentialScans.length,
      cacheHit: stats.cacheHitRatio,
      connections: stats.connections.length,
      deadRows: stats.totalDeadRows,
    });

    return jsonResponse({ success: true, data: stats });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[db-performance-stats] Error:', errorMessage);
    return errorResponse(errorMessage, 500);
  }
});
