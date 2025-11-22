import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function للحذف الآمن للملفات
 * يتبع سياسات الاحتفاظ ويسجل عمليات الحذف
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('غير مصرح بالوصول');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('فشل التحقق من الهوية');
    }

    const { 
      fileId, 
      fileCategory = 'general',
      deletionReason, 
      permanentDelete = false,
      restoreDays = 30
    } = await req.json();

    if (!fileId) {
      throw new Error('معرف الملف مطلوب');
    }

    console.log(`🗑️ طلب حذف ملف: ${fileId} من المستخدم: ${user.email}`);

    // التحقق من صلاحية المستخدم
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = roles?.map(r => r.role) || [];
    const isAdmin = userRoles.includes('admin') || userRoles.includes('nazer');

    if (!isAdmin && permanentDelete) {
      throw new Error('فقط المدراء يمكنهم الحذف النهائي');
    }

    // الحصول على معلومات الملف
    let fileRecord;
    let filePath;
    let fileName;
    let fileSize;
    let storageBucket = 'encrypted-files';

    // محاولة البحث في جداول مختلفة
    const { data: encryptedFile } = await supabase
      .from('encrypted_files')
      .select('*')
      .eq('id', fileId)
      .eq('is_deleted', false)
      .maybeSingle();

    if (encryptedFile) {
      fileRecord = encryptedFile;
      filePath = encryptedFile.encrypted_file_path;
      fileName = encryptedFile.original_file_name;
      fileSize = encryptedFile.file_size;
    } else {
      // البحث في جداول المرفقات الأخرى
      const { data: attachment } = await supabase
        .from('beneficiary_attachments')
        .select('*')
        .eq('id', fileId)
        .maybeSingle();

      if (attachment) {
        fileRecord = attachment;
        filePath = attachment.file_path;
        fileName = attachment.file_name;
        fileSize = attachment.file_size;
        storageBucket = 'beneficiary-documents';
      }
    }

    if (!fileRecord) {
      throw new Error('الملف غير موجود');
    }

    // التحقق من سياسة الاحتفاظ
    const { data: retentionPolicy } = await supabase
      .from('file_retention_policies')
      .select('*')
      .eq('file_category', fileCategory)
      .eq('is_active', true)
      .maybeSingle();

    let requiresApproval = retentionPolicy?.requires_approval ?? true;

    // إذا كان الحذف يتطلب موافقة وليس المستخدم مدير
    if (requiresApproval && !isAdmin && !permanentDelete) {
      // إنشاء طلب حذف
      const { data: deletionRequest } = await supabase
        .from('file_deletion_requests')
        .insert({
          file_id: fileId,
          file_category: fileCategory,
          requested_by: user.id,
          reason: deletionReason || 'طلب حذف ملف',
          status: 'pending'
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          message: 'تم إنشاء طلب الحذف - في انتظار الموافقة',
          requestId: deletionRequest.id,
          requiresApproval: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // إذا كان حذف نهائي
    if (permanentDelete) {
      // حذف الملف من Storage
      const { error: storageError } = await supabase.storage
        .from(storageBucket)
        .remove([filePath]);

      if (storageError) {
        console.warn(`⚠️ فشل حذف الملف من Storage: ${storageError.message}`);
      }

      // تسجيل الحذف في Audit
      await supabase.from('deleted_files_audit').insert({
        original_file_id: fileId,
        file_name: fileName,
        file_path: filePath,
        file_size: fileSize,
        file_category: fileCategory,
        deleted_by: user.id,
        deletion_reason: deletionReason || 'حذف نهائي',
        retention_policy_id: retentionPolicy?.id,
        can_restore: false,
        permanent_deletion_at: new Date().toISOString()
      });

      // حذف السجل من الجدول الأصلي
      if (encryptedFile) {
        await supabase.from('encrypted_files').delete().eq('id', fileId);
        await supabase.from('encryption_keys').delete().eq('id', encryptedFile.encryption_key_id);
      } else {
        await supabase.from('beneficiary_attachments').delete().eq('id', fileId);
      }

      console.log(`✅ تم الحذف النهائي للملف: ${fileId}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'تم حذف الملف نهائياً',
          permanentDelete: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // حذف مؤقت (soft delete)
    const restoreUntil = new Date(Date.now() + restoreDays * 24 * 60 * 60 * 1000).toISOString();

    // تسجيل الحذف في Audit
    await supabase.from('deleted_files_audit').insert({
      original_file_id: fileId,
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      file_category: fileCategory,
      deleted_by: user.id,
      deletion_reason: deletionReason || 'حذف مؤقت',
      retention_policy_id: retentionPolicy?.id,
      can_restore: true,
      restore_until: restoreUntil,
      permanent_deletion_at: new Date(Date.now() + (restoreDays + 90) * 24 * 60 * 60 * 1000).toISOString()
    });

    // تحديث حالة الملف
    if (encryptedFile) {
      await supabase
        .from('encrypted_files')
        .update({ is_deleted: true })
        .eq('id', fileId);
    }

    console.log(`✅ تم الحذف المؤقت للملف: ${fileId} (استرجاع حتى ${restoreUntil})`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `تم حذف الملف مؤقتاً - يمكن استرجاعه حتى ${restoreDays} يوم`,
        permanentDelete: false,
        restoreUntil: restoreUntil
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ خطأ في حذف الملف:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
