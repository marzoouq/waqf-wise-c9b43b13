import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse 
} from '../_shared/cors.ts';

/**
 * Edge Function للتحقق من كلمات المرور المسربة
 * يستخدم Have I Been Pwned API v3 (k-Anonymity model)
 */
serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        await supabase.from('leaked_password_checks').insert({
          user_id: user.id,
          password_hash: sha1Hash,
          is_leaked: isLeaked,
        });
      }
    }

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
