import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse
} from '../_shared/cors.ts';

// ============ Rate Limiting - 20 ملف/دقيقة لكل مستخدم ============
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(userId);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetIn: record.resetTime - now };
}

// ============ Input Validation ============
function validateFileSize(size: number): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: `حجم الملف يتجاوز الحد المسموح (${MAX_FILE_SIZE / (1024 * 1024)} MB)` };
  }
  return { valid: true };
}

function validateExpiresInDays(value: string | null): { valid: boolean; value: number; error?: string } {
  if (!value) return { valid: true, value: 0 };
  
  const numValue = parseInt(value, 10);
  if (isNaN(numValue)) {
    return { valid: false, value: 0, error: 'expiresInDays يجب أن يكون رقماً' };
  }
  if (numValue < 0) {
    return { valid: false, value: 0, error: 'expiresInDays لا يمكن أن يكون سالباً' };
  }
  if (numValue > 365) {
    return { valid: false, value: 0, error: 'expiresInDays لا يمكن أن يتجاوز 365 يوم' };
  }
  return { valid: true, value: numValue };
}

/**
 * Edge Function لتشفير الملفات قبل تخزينها
 * يستخدم AES-256-GCM للتشفير
 * 
 * ✅ محمي بـ: JWT + Role Check + Rate Limiting + Input Validation
 */
serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support for FormData functions
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      try {
        const clonedReq = req.clone();
        const body = await clonedReq.json();
        if (body.ping || body.healthCheck || body.test || body.testMode) {
          console.log('[encrypt-file] Health check / test mode received');
          return jsonResponse({
            status: 'healthy',
            function: 'encrypt-file',
            timestamp: new Date().toISOString(),
            version: '2.1.0'
          });
        }
      } catch {
        // ليس JSON، استمر للتحقق من FormData
      }
    }

    // ============ المصادقة ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('[encrypt-file] ❌ No authentication provided');
      return unauthorizedResponse('غير مصرح بالوصول - يرجى تسجيل الدخول');
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.warn('[encrypt-file] ❌ Invalid token:', authError?.message);
      return unauthorizedResponse('فشل التحقق من الهوية - يرجى إعادة تسجيل الدخول');
    }

    // ============ فحص الصلاحيات ============
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('[encrypt-file] Error fetching roles:', rolesError);
      return errorResponse('خطأ في التحقق من الصلاحيات', 500);
    }

    const userRoles = roles?.map(r => r.role) || [];
    const allowedRoles = ['admin', 'nazer', 'accountant', 'staff'];
    const hasPermission = userRoles.some(role => allowedRoles.includes(role));

    if (!hasPermission) {
      console.warn(`[encrypt-file] ❌ Forbidden - User ${user.id} lacks required role (has: ${userRoles.join(', ') || 'none'})`);
      return forbiddenResponse('ليس لديك صلاحية لتشفير الملفات');
    }

    // ============ Rate Limiting ============
    const rateLimitResult = checkRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      console.warn(`[encrypt-file] Rate limit exceeded for user: ${user.id}`);
      return errorResponse(`تجاوزت الحد المسموح (${RATE_LIMIT} ملف/دقيقة). يرجى الانتظار ${Math.ceil(rateLimitResult.resetIn / 1000)} ثانية.`, 429);
    }

    console.log(`[encrypt-file] ✅ Authorized - User: ${user.id}, Roles: ${userRoles.join(', ')}, Remaining: ${rateLimitResult.remaining}`);

    // ============ قراءة ومعالجة الملف ============
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileCategory = formData.get('category') as string || 'general';
    const expiresInDaysRaw = formData.get('expiresInDays') as string;

    if (!file) {
      return errorResponse('لم يتم إرفاق ملف', 400);
    }

    // ============ التحقق من المدخلات ============
    const fileSizeValidation = validateFileSize(file.size);
    if (!fileSizeValidation.valid) {
      return errorResponse(fileSizeValidation.error!, 400);
    }

    const expiresValidation = validateExpiresInDays(expiresInDaysRaw);
    if (!expiresValidation.valid) {
      return errorResponse(expiresValidation.error!, 400);
    }
    const expiresInDays = expiresValidation.value;

    console.log(`[encrypt-file] 🔐 تشفير ملف: ${file.name} (${file.size} bytes)`);

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
      .maybeSingle();

    if (keyError) {
      throw new Error(`فشل حفظ مفتاح التشفير: ${keyError.message}`);
    }
    if (!keyData) throw new Error('فشل إنشاء مفتاح التشفير');

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
      .maybeSingle();

    if (fileError) {
      // حذف الملف المشفر إذا فشل حفظ السجل
      await supabase.storage.from('encrypted-files').remove([uploadData.path]);
      throw new Error(`فشل حفظ سجل الملف: ${fileError.message}`);
    }
    if (!fileRecord) throw new Error('فشل تسجيل الملف المشفر');

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

    // تسجيل في audit_logs
    await supabase.from('audit_logs').insert({
      action_type: 'file_encryption',
      user_id: user.id,
      user_email: user.email,
      description: `تم تشفير ملف: ${file.name}`,
      new_values: {
        file_id: fileRecord.id,
        file_name: file.name,
        file_size: file.size,
        category: fileCategory,
        expires_at: expiresAt
      }
    });

    console.log(`[encrypt-file] ✅ تم تشفير الملف بنجاح: ${fileRecord.id}`);

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
    console.error('[encrypt-file] ❌ خطأ في تشفير الملف:', error);
    
    // تسجيل تفاصيل كاملة للمطورين
    console.error('[encrypt-file] Full error details:', {
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
