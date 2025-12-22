import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse 
} from '../_shared/cors.ts';

/**
 * Edge Function لتشفير الملفات قبل تخزينها
 * يستخدم AES-256-GCM للتشفير
 */
serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support for FormData functions
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      try {
        const body = await req.json();
        if (body.ping || body.healthCheck) {
          console.log('[ENCRYPT-FILE] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'encrypt-file',
            timestamp: new Date().toISOString()
          });
        }
      } catch {
        // ليس JSON، استمر للتحقق من FormData
      }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return unauthorizedResponse('غير مصرح بالوصول');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return unauthorizedResponse('فشل التحقق من الهوية');
    }

    // ✅ التحقق من الصلاحيات - فقط الموظفين يمكنهم تشفير الملفات
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = roles?.map(r => r.role) || [];
    const allowedRoles = ['admin', 'nazer', 'accountant', 'staff'];
    const hasPermission = userRoles.some(role => allowedRoles.includes(role));

    if (!hasPermission) {
      console.warn(`⚠️ محاولة تشفير ملف بدون صلاحية: ${user.id}`);
      return errorResponse('ليس لديك صلاحية لتشفير الملفات', 403);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileCategory = formData.get('category') as string || 'general';
    const expiresInDays = parseInt(formData.get('expiresInDays') as string || '0');

    if (!file) {
      throw new Error('لم يتم إرفاق ملف');
    }

    console.log(`🔐 تشفير ملف: ${file.name} (${file.size} bytes)`);

    // قراءة محتوى الملف
    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);

    // توليد مفتاح تشفير و IV
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));

    // تشفير البيانات
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      fileData
    );

    // تصدير المفتاح
    const exportedKey = await crypto.subtle.exportKey("raw", key);
    const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
    const ivBase64 = btoa(String.fromCharCode(...iv));

    // حساب checksum
    const checksumBuffer = await crypto.subtle.digest("SHA-256", fileData);
    const checksumArray = Array.from(new Uint8Array(checksumBuffer));
    const checksum = checksumArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // تحويل البيانات المشفرة إلى Base64 للتخزين
    const encryptedArray = new Uint8Array(encryptedData);
    const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));

    // رفع الملف المشفر إلى Storage
    const encryptedFileName = `encrypted_${Date.now()}_${crypto.randomUUID()}.enc`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('encrypted-files')
      .upload(encryptedFileName, encryptedBase64, {
        contentType: 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`فشل رفع الملف المشفر: ${uploadError.message}`);
    }

    // حفظ metadata التشفير في قاعدة البيانات
    const expiresAt = expiresInDays > 0 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // أولاً: إنشاء مفتاح التشفير في encryption_keys
    const { data: keyData, error: keyError } = await supabase
      .from('encryption_keys')
      .insert({
        key_name: `file_key_${Date.now()}`,
        key_type: 'aes-256',
        key_purpose: 'file_encryption',
        is_active: true,
        created_by: user.id,
        metadata: { key_base64: keyBase64 }
      })
      .select()
      .single();

    if (keyError) {
      throw new Error(`فشل حفظ مفتاح التشفير: ${keyError.message}`);
    }

    // ثانياً: تسجيل الملف المشفر
    const { data: fileRecord, error: fileError } = await supabase
      .from('encrypted_files')
      .insert({
        original_file_name: file.name,
        encrypted_file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        encryption_key_id: keyData.id,
        encryption_iv: ivBase64,
        checksum: checksum,
        uploaded_by: user.id,
        expires_at: expiresAt,
        metadata: {
          original_size: file.size,
          encrypted_size: encryptedArray.length,
          category: fileCategory
        }
      })
      .select()
      .single();

    if (fileError) {
      // حذف الملف المشفر إذا فشل حفظ السجل
      await supabase.storage.from('encrypted-files').remove([uploadData.path]);
      throw new Error(`فشل حفظ سجل الملف: ${fileError.message}`);
    }

    // تسجيل الوصول
    await supabase.from('sensitive_data_access_log').insert({
      user_id: user.id,
      user_email: user.email,
      table_name: 'encrypted_files',
      record_id: fileRecord.id,
      access_type: 'encrypt',
      access_reason: `تشفير ملف: ${file.name}`,
      was_granted: true
    });

    console.log(`✅ تم تشفير الملف بنجاح: ${fileRecord.id}`);

    return jsonResponse({
      success: true,
      message: 'تم تشفير الملف بنجاح',
      file: {
        id: fileRecord.id,
        original_name: file.name,
        encrypted_path: uploadData.path,
        checksum: checksum,
        expires_at: expiresAt
      }
    });
  } catch (error) {
    console.error('❌ خطأ في تشفير الملف:', error);
    
    // تسجيل تفاصيل كاملة للمطورين
    console.error('Full error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // رسالة آمنة للعميل
    let safeMessage = 'حدث خطأ أثناء تشفير الملف';
    
    if (error instanceof Error) {
      if (error.message.includes('غير مصرح') || error.message.includes('unauthorized')) {
        safeMessage = 'غير مصرح بالوصول';
      } else if (error.message.includes('لم يتم إرفاق')) {
        safeMessage = 'لم يتم إرفاق ملف';
      } else if (error.message.includes('فشل رفع') || error.message.includes('upload')) {
        safeMessage = 'فشل رفع الملف، يرجى المحاولة مرة أخرى';
      }
    }
    
    return errorResponse(safeMessage, 500);
  }
});
