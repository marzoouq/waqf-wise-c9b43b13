import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse,
  rateLimitResponse 
} from '../_shared/cors.ts';

// ✅ Rate Limiting
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 20;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);
  
  if (!record || now - record.lastAttempt > WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }
  
  record.count++;
  record.lastAttempt = now;
  return true;
}

interface CleanupRequest {
  bucket: string;
  filePath?: string;
  olderThanHours?: number;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck) {
          console.log('[cleanup-sensitive-files] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'cleanup-sensitive-files',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ✅ دعم CRON_SECRET للمهام المجدولة
    const cronSecret = req.headers.get('X-Cron-Secret');
    const expectedCronSecret = Deno.env.get('CRON_SECRET');
    const isCronJob = cronSecret && expectedCronSecret && cronSecret === expectedCronSecret;

    let userId = 'cron-job';
    let userEmail = 'system@cron';

    if (!isCronJob) {
      // ✅ JWT Authentication
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Unauthorized access attempt');
        return unauthorizedResponse('غير مصرح بالوصول');
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return unauthorizedResponse('فشل التحقق من الهوية');
      }

      // ✅ Role Check - admin/nazer فقط
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const userRoles = roles?.map(r => r.role) || [];
      const hasPermission = userRoles.some(role => ['admin', 'nazer'].includes(role));

      if (!hasPermission) {
        console.warn(`⚠️ Unauthorized cleanup attempt: ${user.id}`);
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          user_email: user.email,
          action_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          table_name: 'storage',
          severity: 'warning',
          description: 'محاولة غير مصرح بها لحذف ملفات حساسة'
        });
        return forbiddenResponse('ليس لديك صلاحية لتنفيذ هذه العملية');
      }

      // ✅ Rate Limiting
      if (!checkRateLimit(user.id)) {
        return rateLimitResponse('تم تجاوز حد المحاولات. انتظر دقيقة');
      }

      userId = user.id;
      userEmail = user.email || 'unknown';
    }

    const { bucket, filePath, olderThanHours = 24 }: CleanupRequest = await req.json();

    console.log(`Cleanup request for bucket: ${bucket} by ${isCronJob ? 'CRON' : userId}`);

    let deletedCount = 0;

    if (filePath) {
      // حذف ملف محدد
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
        throw error;
      }

      deletedCount = 1;

      // تسجيل عملية الحذف
      await supabase.from('audit_logs').insert({
        action_type: 'DELETE_FILE',
        table_name: 'storage',
        user_id: userId !== 'cron-job' ? userId : null,
        user_email: userEmail,
        description: `تم حذف ملف: ${filePath}`,
        severity: 'info',
      });

      console.log(`Deleted file: ${filePath}`);
    } else if (olderThanHours) {
      // حذف الملفات القديمة
      const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list();

      if (listError) throw listError;

      if (!files || files.length === 0) {
        console.log('No files found in bucket');
        return jsonResponse({ 
          success: true, 
          deletedCount: 0,
          message: 'No files to delete' 
        });
      }

      const oldFiles = files.filter(file => {
        const fileDate = new Date(file.created_at);
        return fileDate < cutoffDate;
      });

      if (oldFiles.length > 0) {
        const filePaths = oldFiles.map(f => f.name);
        
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove(filePaths);

        if (deleteError) throw deleteError;

        deletedCount = oldFiles.length;

        // تسجيل عملية الحذف الجماعي
        await supabase.from('audit_logs').insert({
          action_type: 'BULK_DELETE_FILES',
          table_name: 'storage',
          user_id: userId !== 'cron-job' ? userId : null,
          user_email: userEmail,
          description: `تم حذف ${deletedCount} ملف قديم من ${bucket}`,
          severity: 'info',
        });

        console.log(`Deleted ${deletedCount} old files`);
      }
    }

    return jsonResponse({ 
      success: true, 
      deletedCount,
      message: `تم حذف ${deletedCount} ملف بنجاح` 
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      400
    );
  }
});
