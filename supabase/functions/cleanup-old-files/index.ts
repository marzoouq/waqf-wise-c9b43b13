import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

/**
 * Edge Function مجدولة لحذف الملفات القديمة تلقائياً
 * تعمل وفق سياسات الاحتفاظ المحددة
 * يُنصح بجدولتها للتشغيل يومياً عبر Cron Job
 * 
 * ⚠️ CRITICAL: يتطلب دور admin فقط
 */
serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 1. التحقق من المصادقة والصلاحيات
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return unauthorizedResponse('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return unauthorizedResponse('Unauthorized');
    }

    // 2. التحقق من دور admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      console.warn('Unauthorized cleanup attempt by:', user.id);
      return forbiddenResponse('Forbidden: Admin role required');
    }

    // 3. استخدام Service Role للعمليات
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🧹 بدء عملية تنظيف الملفات القديمة...');

    let totalDeleted = 0;
    let totalSizeFreed = 0;

    // 1. حذف الملفات المشفرة منتهية الصلاحية
    const { data: expiredFiles } = await supabase
      .from('encrypted_files')
      .select('*, encryption_keys(*)')
      .lte('expires_at', new Date().toISOString())
      .eq('is_deleted', false);

    if (expiredFiles && expiredFiles.length > 0) {
      console.log(`📄 وجد ${expiredFiles.length} ملف منتهي الصلاحية`);

      for (const file of expiredFiles) {
        try {
          // حذف من Storage
          await supabase.storage
            .from('encrypted-files')
            .remove([file.encrypted_file_path]);

          // تسجيل في Audit
          await supabase.from('deleted_files_audit').insert({
            original_file_id: file.id,
            file_name: file.original_file_name,
            file_path: file.encrypted_file_path,
            file_size: file.file_size,
            file_category: file.metadata?.category || 'expired',
            deletion_reason: 'انتهاء صلاحية الملف تلقائياً',
            can_restore: false,
            permanent_deletion_at: new Date().toISOString()
          });

          // حذف السجلات
          await supabase.from('encrypted_files').delete().eq('id', file.id);
          await supabase.from('encryption_keys').delete().eq('id', file.encryption_key_id);

          totalDeleted++;
          totalSizeFreed += file.file_size;
        } catch (error) {
          console.error(`❌ خطأ في حذف الملف ${file.id}:`, error);
        }
      }
    }

    // 2. حذف الملفات المحذوفة مؤقتاً التي انتهت فترة استرجاعها
    const { data: permanentDeleteFiles } = await supabase
      .from('deleted_files_audit')
      .select('*')
      .lte('permanent_deletion_at', new Date().toISOString())
      .eq('can_restore', true);

    if (permanentDeleteFiles && permanentDeleteFiles.length > 0) {
      console.log(`📄 وجد ${permanentDeleteFiles.length} ملف جاهز للحذف النهائي`);

      for (const file of permanentDeleteFiles) {
        try {
          // حذف من Storage
          await supabase.storage
            .from('encrypted-files')
            .remove([file.file_path]);

          // تحديث السجل
          await supabase
            .from('deleted_files_audit')
            .update({
              can_restore: false,
              permanent_deletion_at: new Date().toISOString()
            })
            .eq('id', file.id);

          totalDeleted++;
          totalSizeFreed += file.file_size || 0;
        } catch (error) {
          console.error(`❌ خطأ في الحذف النهائي للملف ${file.id}:`, error);
        }
      }
    }

    // 3. تطبيق سياسات الاحتفاظ التلقائية
    const { data: retentionPolicies } = await supabase
      .from('file_retention_policies')
      .select('*')
      .eq('is_active', true)
      .eq('auto_delete', true);

    if (retentionPolicies && retentionPolicies.length > 0) {
      console.log(`📋 تطبيق ${retentionPolicies.length} سياسة احتفاظ`);

      for (const policy of retentionPolicies) {
        try {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - policy.retention_days);

          // البحث عن الملفات التي تجاوزت فترة الاحتفاظ
          const { data: oldFiles } = await supabase
            .from('encrypted_files')
            .select('*')
            .lt('uploaded_at', cutoffDate.toISOString())
            .eq('is_deleted', false);

          if (oldFiles && oldFiles.length > 0) {
            console.log(`📄 سياسة "${policy.policy_name}": وجد ${oldFiles.length} ملف قديم`);

            for (const file of oldFiles) {
              // التحقق من التصنيف
              if (file.metadata?.category === policy.file_category) {
                // إذا كان يتطلب موافقة، إنشاء طلب حذف
                if (policy.requires_approval) {
                  await supabase.from('file_deletion_requests').insert({
                    file_id: file.id,
                    file_category: policy.file_category,
                    reason: `تطبيق سياسة احتفاظ: ${policy.policy_name}`,
                    priority: 'normal',
                    status: 'pending'
                  });
                } else {
                  // حذف مباشر
                  await supabase.storage
                    .from('encrypted-files')
                    .remove([file.encrypted_file_path]);

                  await supabase.from('deleted_files_audit').insert({
                    original_file_id: file.id,
                    file_name: file.original_file_name,
                    file_path: file.encrypted_file_path,
                    file_size: file.file_size,
                    file_category: policy.file_category,
                    deletion_reason: `سياسة احتفاظ: ${policy.policy_name}`,
                    retention_policy_id: policy.id,
                    can_restore: false,
                    permanent_deletion_at: new Date().toISOString()
                  });

                  await supabase.from('encrypted_files').delete().eq('id', file.id);

                  totalDeleted++;
                  totalSizeFreed += file.file_size;
                }
              }
            }
          }
        } catch (error) {
          console.error(`❌ خطأ في تطبيق سياسة ${policy.policy_name}:`, error);
        }
      }
    }

    // 4. تنظيف سجلات الوصول القديمة (أكثر من 180 يوم)
    const accessLogCutoff = new Date();
    accessLogCutoff.setDate(accessLogCutoff.getDate() - 180);
    
    const { error: logCleanupError } = await supabase
      .from('sensitive_data_access_log')
      .delete()
      .lt('accessed_at', accessLogCutoff.toISOString());

    if (logCleanupError) {
      console.error('❌ خطأ في تنظيف سجلات الوصول:', logCleanupError);
    } else {
      console.log('✅ تم تنظيف سجلات الوصول القديمة');
    }

    const sizeMB = (totalSizeFreed / (1024 * 1024)).toFixed(2);

    console.log(`✅ اكتملت عملية التنظيف:`);
    console.log(`   - عدد الملفات المحذوفة: ${totalDeleted}`);
    console.log(`   - المساحة المحررة: ${sizeMB} MB`);

    return jsonResponse({
      success: true,
      message: 'تمت عملية التنظيف بنجاح',
      stats: {
        filesDeleted: totalDeleted,
        sizeFreedMB: parseFloat(sizeMB)
      }
    });
  } catch (error) {
    console.error('❌ خطأ في عملية التنظيف:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'خطأ غير معروف',
      500
    );
  }
});
