import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse 
} from '../_shared/cors.ts';

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
    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Unauthorized access attempt');
      return unauthorizedResponse('Unauthorized');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { bucket, filePath, olderThanHours = 24 }: CleanupRequest = await req.json();

    console.log(`Cleanup request for bucket: ${bucket}`);

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
