import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

// فقط المدير يمكنه استعادة قاعدة البيانات (عملية خطيرة جداً)
const ALLOWED_ROLES = ['admin'];

// Rate limiting: 3 restores per day per user (very restrictive)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck || parsed.testMode) {
          console.log('[restore-database] Health check / test mode received');
          return jsonResponse({
            status: 'healthy',
            function: 'restore-database',
            testMode: !!parsed.testMode,
            message: parsed.testMode ? 'اختبار ناجح - لم يتم تنفيذ استعادة فعلية' : undefined,
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }
    // ============ التحقق من المصادقة والصلاحيات ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Restore attempt without authorization header');
      return forbiddenResponse('مطلوب تسجيل الدخول لاستعادة قاعدة البيانات');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // إنشاء عميل Supabase للتحقق من المستخدم
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Invalid token for restore:', authError?.message);
      return forbiddenResponse('جلسة غير صالحة. يرجى تسجيل الدخول مجدداً');
    }

    // التحقق من صلاحيات المستخدم - فقط admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      return errorResponse('خطأ في التحقق من الصلاحيات', 500);
    }

    const hasPermission = userRoles?.some(r => ALLOWED_ROLES.includes(r.role));
    
    if (!hasPermission) {
      // تسجيل محاولة الوصول غير المصرح بها - خطورة عالية
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action_type: 'UNAUTHORIZED_RESTORE_ATTEMPT',
        table_name: 'system',
        description: `⚠️ محاولة استعادة قاعدة البيانات غير مصرح بها من المستخدم ${user.email}`,
        severity: 'error',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      });

      console.error(`CRITICAL: Unauthorized restore attempt by user: ${user.email} (${user.id})`);
      return forbiddenResponse('استعادة قاعدة البيانات متاحة فقط للمدير. هذه المحاولة تم تسجيلها.');
    }

    // ============ Rate Limiting (strict: 3 per day) ============
    if (!checkRateLimit(user.id)) {
      console.error(`CRITICAL: Rate limit exceeded for restore by admin: ${user.id}`);
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action_type: 'RESTORE_RATE_LIMIT_EXCEEDED',
        table_name: 'system',
        description: `⚠️ تجاوز حد الاستعادة (${RATE_LIMIT}/يوم) من ${user.email}`,
        severity: 'error',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      });
      return errorResponse('تجاوزت الحد المسموح للاستعادة (3 مرات يومياً). حاول غداً.', 429);
    }

    // ============ تنفيذ الاستعادة ============
    console.log(`⚠️ Database restore initiated by ADMIN: ${user.id}`);

    const { backupData, mode = 'replace' } = await req.json();
    
    if (!backupData || !backupData.data) {
      return errorResponse('صيغة ملف النسخ الاحتياطي غير صالحة', 400);
    }

    // تسجيل بدء الاستعادة
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action_type: 'RESTORE_STARTED',
      table_name: 'system',
      description: `بدء استعادة قاعدة البيانات بواسطة ${user.email} - الوضع: ${mode}`,
      severity: 'warn',
      new_values: { 
        mode, 
        backup_version: backupData.version,
        backup_created_at: backupData.created_at,
        total_tables: backupData.metadata?.totalTables 
      }
    });

    console.log('Starting restore:', { 
      version: backupData.version, 
      mode,
      totalTables: backupData.metadata?.totalTables,
      initiated_by: user.email
    });

    const restoredTables: string[] = [];
    const errors: Array<{ table: string; error: string }> = [];
    let totalRestored = 0;

    // استعادة البيانات لكل جدول
    for (const [tableName, tableData] of Object.entries(backupData.data)) {
      try {
        console.log(`Restoring table: ${tableName} (${(tableData as unknown[]).length} records)`);

        // في وضع replace، حذف البيانات الحالية أولاً
        if (mode === 'replace') {
          const { error: deleteError } = await supabaseAdmin
            .from(tableName)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

          if (deleteError) {
            console.error(`Error deleting from ${tableName}:`, deleteError);
          }
        }

        // إدراج البيانات المستعادة
        if ((tableData as unknown[]).length > 0) {
          const batchSize = 100;
          const dataArray = tableData as unknown[];
          
          for (let i = 0; i < dataArray.length; i += batchSize) {
            const batch = dataArray.slice(i, i + batchSize);
            
            const { error: insertError } = await supabaseAdmin
              .from(tableName)
              .insert(batch);

            if (insertError) {
              console.error(`Error inserting batch into ${tableName}:`, insertError);
              errors.push({ 
                table: tableName, 
                error: insertError.message 
              });
            } else {
              totalRestored += batch.length;
            }
          }
        }

        restoredTables.push(tableName);
        console.log(`Successfully restored ${tableName}`);

      } catch (err) {
        console.error(`Failed to restore table ${tableName}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ 
          table: tableName, 
          error: errorMessage
        });
      }
    }

    // تسجيل اكتمال الاستعادة
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action_type: 'RESTORE_COMPLETED',
      table_name: 'system',
      description: `اكتملت استعادة قاعدة البيانات - ${totalRestored} سجل في ${restoredTables.length} جدول`,
      severity: errors.length > 0 ? 'warn' : 'info',
      new_values: { 
        restored_tables: restoredTables.length,
        total_restored: totalRestored,
        errors_count: errors.length
      }
    });

    console.log('Restore completed:', {
      restoredTables: restoredTables.length,
      totalRestored,
      errors: errors.length
    });

    return jsonResponse({
      success: true,
      restoredTables,
      totalRestored,
      errors: errors.length > 0 ? errors : undefined,
      message: errors.length > 0 
        ? `تمت الاستعادة مع بعض الأخطاء (${errors.length} جداول فشلت)`
        : 'تمت استعادة جميع البيانات بنجاح'
    });

  } catch (error) {
    console.error('Restore error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'حدث خطأ أثناء الاستعادة',
      500
    );
  }
});
