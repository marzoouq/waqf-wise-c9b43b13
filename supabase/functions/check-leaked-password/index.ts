import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse,
  unauthorizedResponse,
  rateLimitResponse 
} from '../_shared/cors.ts';

// ✅ Rate Limiting للحماية من إساءة الاستخدام
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 20;
const WINDOW_MS = 60 * 1000; // دقيقة واحدة

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now - record.lastAttempt > WINDOW_MS) {
    rateLimitMap.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }
  
  record.count++;
  record.lastAttempt = now;
  return true;
}

/**
 * Edge Function للتحقق من كلمات المرور المسربة
 * يستخدم Have I Been Pwned API v3 (k-Anonymity model)
 */
serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck) {
          console.log('[check-leaked-password] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'check-leaked-password',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ✅ JWT Authentication - إلزامي
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return unauthorizedResponse('يجب تسجيل الدخول للتحقق من كلمة المرور');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return unauthorizedResponse('فشل التحقق من الهوية');
    }

    // ✅ Rate Limiting
    if (!checkRateLimit(user.id)) {
      console.warn(`⚠️ Rate limit exceeded for password check: ${user.id}`);
      return rateLimitResponse('تم تجاوز حد المحاولات. انتظر دقيقة');
    }

    const { password } = await req.json();

    if (!password || password.length < 6) {
      return jsonResponse({ isLeaked: false, message: 'Invalid password' });
    }

    // Hash كلمة المرور باستخدام SHA-1
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    // استخدام Have I Been Pwned API (k-Anonymity model)
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    
    if (!response.ok) {
      throw new Error('Failed to check password');
    }

    const data = await response.text();
    const hashes = data.split('\n');
    
    // البحث عن الـ suffix في القائمة
    const foundHash = hashes.find(line => {
      const [hashSuffix] = line.split(':');
      return hashSuffix === suffix;
    });

    const isLeaked = !!foundHash;
    let count = 0;

    if (foundHash) {
      const [, countStr] = foundHash.split(':');
      count = parseInt(countStr, 10);
    }

    // حفظ النتيجة في قاعدة البيانات
    await supabase.from('leaked_password_checks').insert({
      user_id: user.id,
      password_hash: sha1Hash,
      is_leaked: isLeaked,
    });

    return jsonResponse({ 
      isLeaked, 
      count,
      message: isLeaked 
        ? `تم العثور على هذه الكلمة في ${count} تسريب` 
        : 'كلمة المرور آمنة'
    });
  } catch (error) {
    console.error('Password check error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
