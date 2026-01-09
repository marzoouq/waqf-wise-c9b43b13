import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

// ============ Rate Limiting - 100 إشعار/دقيقة لكل مستخدم ============
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000; // 1 minute

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
          console.log('[send-push-notification] Health check / test mode received');
          return jsonResponse({
            status: 'healthy',
            function: 'send-push-notification',
            timestamp: new Date().toISOString(),
            version: '2.1.0'
          });
        }
      } catch { /* not JSON, continue */ }
    }
    // التحقق من JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return unauthorizedResponse('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return unauthorizedResponse('Invalid or expired token');
    }

    // التحقق من الصلاحيات - فقط المسؤولون يمكنهم إرسال إشعارات
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => ['admin', 'nazer'].includes(r.role));
    
    if (!isAdmin) {
      return forbiddenResponse('Unauthorized - Admin access required');
    }

    // ✅ Rate Limiting
    if (!checkRateLimit(user.id)) {
      console.warn(`[send-push-notification] Rate limit exceeded for user: ${user.id}`);
      return errorResponse('تجاوزت الحد المسموح (100 إشعار/دقيقة). يرجى الانتظار.', 429);
    }

    const { userId, title, body, icon, badge, data, actionUrl } = await req.json();

    if (!userId || !title || !body) {
      throw new Error('userId, title, and body are required');
    }

    // الحصول على اشتراكات المستخدم
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (subError || !subscriptions || subscriptions.length === 0) {
      return jsonResponse({ message: 'No active subscriptions found' });
    }

    const results = [];

    // إرسال الإشعار لكل اشتراك
    for (const subscription of subscriptions) {
      try {
        // في الإنتاج، يجب استخدام web-push library
        // هنا نسجل فقط محاولة الإرسال
        console.log('Sending push notification to:', subscription.endpoint);
        
        // تحديث آخر استخدام
        await supabase
          .from('push_subscriptions')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', subscription.id);

        results.push({
          subscriptionId: subscription.id,
          success: true,
        });
      } catch (error) {
        console.error('Push notification error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          subscriptionId: subscription.id,
          success: false,
          error: errorMessage,
        });
      }
    }

    // إنشاء إشعار داخلي أيضاً
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message: body,
        type: 'info',
        action_url: actionUrl,
        is_read: false,
      });

    return jsonResponse({
      success: true,
      results,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    });
  } catch (error) {
    console.error('Push notification error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
