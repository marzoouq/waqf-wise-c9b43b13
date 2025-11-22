import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function لفك تشفير الملفات
 * يتحقق من الصلاحيات ويسجل عمليات الوصول
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

    const { fileId, accessReason } = await req.json();

    if (!fileId) {
      throw new Error('معرف الملف مطلوب');
    }

    console.log(`🔓 طلب فك تشفير ملف: ${fileId} من المستخدم: ${user.email}`);

    // التحقق من وجود الملف
    const { data: fileRecord, error: fileError } = await supabase
      .from('encrypted_files')
      .select('*, encryption_keys(*)')
      .eq('id', fileId)
      .eq('is_deleted', false)
      .single();

    if (fileError || !fileRecord) {
      throw new Error('الملف غير موجود أو تم حذفه');
    }

    // التحقق من صلاحية المستخدم
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = roles?.map(r => r.role) || [];
    const hasAccess = userRoles.includes('admin') || 
                     userRoles.includes('nazer') || 
                     fileRecord.uploaded_by === user.id;

    if (!hasAccess) {
      // تسجيل محاولة وصول مرفوضة
      await supabase.from('sensitive_data_access_log').insert({
        user_id: user.id,
        user_email: user.email,
        table_name: 'encrypted_files',
        record_id: fileId,
        access_type: 'decrypt',
        access_reason: accessReason || 'محاولة فك تشفير',
        was_granted: false,
        denial_reason: 'صلاحيات غير كافية'
      });

      throw new Error('ليس لديك صلاحية للوصول لهذا الملف');
    }

    // التحقق من انتهاء صلاحية الملف
    if (fileRecord.expires_at && new Date(fileRecord.expires_at) < new Date()) {
      throw new Error('انتهت صلاحية الملف');
    }

    // تحميل الملف المشفر من Storage
    const { data: encryptedFileData, error: downloadError } = await supabase.storage
      .from('encrypted-files')
      .download(fileRecord.encrypted_file_path);

    if (downloadError) {
      throw new Error(`فشل تحميل الملف المشفر: ${downloadError.message}`);
    }

    // قراءة البيانات المشفرة
    const encryptedText = await encryptedFileData.text();
    const encryptedBytes = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));

    // استيراد مفتاح التشفير
    const keyBase64 = fileRecord.encryption_keys.metadata.key_base64;
    const keyBytes = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
    
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // فك تشفير IV
    const iv = Uint8Array.from(atob(fileRecord.encryption_iv), c => c.charCodeAt(0));

    // فك التشفير
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedBytes
    );

    // التحقق من checksum
    const checksumBuffer = await crypto.subtle.digest("SHA-256", decryptedData);
    const checksumArray = Array.from(new Uint8Array(checksumBuffer));
    const calculatedChecksum = checksumArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (calculatedChecksum !== fileRecord.checksum) {
      throw new Error('فشل التحقق من سلامة الملف - checksum غير متطابق');
    }

    // تحويل إلى Base64 للإرسال
    const decryptedArray = new Uint8Array(decryptedData);
    const decryptedBase64 = btoa(String.fromCharCode(...decryptedArray));

    // تسجيل الوصول الناجح
    await supabase.from('sensitive_data_access_log').insert({
      user_id: user.id,
      user_email: user.email,
      table_name: 'encrypted_files',
      record_id: fileId,
      access_type: 'decrypt',
      access_reason: accessReason || 'فك تشفير ملف',
      was_granted: true
    });

    // تحديث عداد الوصول
    await supabase
      .from('encrypted_data_registry')
      .upsert({
        table_name: 'encrypted_files',
        column_name: 'file_data',
        record_id: fileId,
        encryption_key_id: fileRecord.encryption_key_id,
        last_accessed_at: new Date().toISOString(),
        access_count: (fileRecord.metadata?.access_count || 0) + 1
      });

    console.log(`✅ تم فك تشفير الملف بنجاح: ${fileId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم فك تشفير الملف بنجاح',
        file: {
          id: fileRecord.id,
          original_name: fileRecord.original_file_name,
          mime_type: fileRecord.mime_type,
          size: fileRecord.file_size,
          data: decryptedBase64
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ خطأ في فك تشفير الملف:', error);
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
