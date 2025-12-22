import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse
} from '../_shared/cors.ts';

// ============ Rate Limiting - 50 إشعار/دقيقة لكل مستخدم ============
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 50;
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

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface NotificationRequest {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  channel?: 'app' | 'email' | 'sms' | 'all';
  priority?: 'low' | 'medium' | 'high';
}

interface NotificationPreferences {
  email?: boolean;
  sms?: boolean;
  [key: string]: unknown;
}

// قالب البريد الإلكتروني الاحترافي بالعربية
function getEmailTemplate(title: string, message: string, type: string, actionUrl?: string): string {
  const typeColors: Record<string, { bg: string; border: string; icon: string }> = {
    info: { bg: '#EBF5FF', border: '#3B82F6', icon: 'ℹ️' },
    success: { bg: '#ECFDF5', border: '#10B981', icon: '✅' },
    warning: { bg: '#FFFBEB', border: '#F59E0B', icon: '⚠️' },
    error: { bg: '#FEF2F2', border: '#EF4444', icon: '🚨' },
  };

  const colors = typeColors[type] || typeColors.info;

  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f4f4f5; direction: rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                نظام إدارة الوقف
              </h1>
              <p style="margin: 10px 0 0 0; color: #cbd5e1; font-size: 14px;">
                إشعار جديد
              </p>
            </td>
          </tr>
          
          <!-- Alert Box -->
          <tr>
            <td style="padding: 30px;">
              <div style="background-color: ${colors.bg}; border-right: 4px solid ${colors.border}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width: 40px; vertical-align: top; font-size: 24px;">
                      ${colors.icon}
                    </td>
                    <td>
                      <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                        ${title}
                      </h2>
                      <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                        ${message}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
              
              ${actionUrl ? `
              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                      عرض التفاصيل
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
              
              <!-- Info -->
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                تم إرسال هذا الإشعار في ${new Date().toLocaleDateString('ar-SA', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                هذه رسالة آلية من نظام إدارة الوقف
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                إذا لم تكن ترغب في استلام هذه الإشعارات، يمكنك تعديل إعدادات الإشعارات من حسابك
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support
    try {
      const bodyClone = await req.clone().json();
      if (bodyClone.ping || bodyClone.healthCheck) {
        console.log('[SEND-NOTIFICATION] Health check received');
        return jsonResponse({
          status: 'healthy',
          function: 'send-notification',
          timestamp: new Date().toISOString()
        });
      }
    } catch {
      // ليس JSON أو فارغ، استمر في المعالجة العادية
    }

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
      return unauthorizedResponse('Invalid token');
    }

    // ✅ فحص الصلاحيات - فقط المسؤولون يمكنهم إرسال إشعارات
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAccess = roles?.some(r => ['admin', 'nazer', 'accountant'].includes(r.role));
    if (!hasAccess) {
      console.warn(`[send-notification] Unauthorized access by user: ${user.id}`);
      return forbiddenResponse('ليس لديك صلاحية لإرسال الإشعارات');
    }

    // ✅ Rate Limiting
    if (!checkRateLimit(user.id)) {
      console.warn(`[send-notification] Rate limit exceeded for user: ${user.id}`);
      return errorResponse('تجاوزت الحد المسموح (50 إشعار/دقيقة). يرجى الانتظار.', 429);
    }

    const { 
      userId, 
      title, 
      message, 
      type = 'info',
      actionUrl,
      channel = 'app',
      priority = 'medium'
    }: NotificationRequest = await req.json();

    if (!userId || !title || !message) {
      return errorResponse('userId, title, and message are required');
    }

    const results = {
      app: false,
      email: false,
      sms: false,
    };

    // 1. إنشاء إشعار داخل التطبيق (دائماً)
    if (channel === 'app' || channel === 'all') {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          action_url: actionUrl,
          channel: 'app',
          is_read: false,
        });

      if (!notifError) {
        results.app = true;
        console.log(`✅ App notification created for user ${userId}`);
      }
    }

    // 2. إرسال بريد إلكتروني فعلي عبر Resend
    if (channel === 'email' || channel === 'all') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, notification_preferences')
        .eq('user_id', userId)
        .single();

      const preferences = profile?.notification_preferences as NotificationPreferences | null;
      const emailEnabled = preferences?.email !== false;

      if (profile?.email && emailEnabled && RESEND_API_KEY) {
        try {
          const emailHtml = getEmailTemplate(title, message, type, actionUrl);

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "نظام إدارة الوقف <onboarding@resend.dev>",
              to: [profile.email],
              subject: title,
              html: emailHtml,
            }),
          });

          const emailResult = await emailResponse.json();

          if (emailResponse.ok) {
            results.email = true;
            console.log(`📧 Email sent successfully to ${profile.email}`, emailResult);
            
            // تسجيل في جدول الإشعارات كـ sent
            await supabase.from('notifications').insert({
              user_id: userId,
              title,
              message,
              type,
              channel: 'email',
              delivery_status: 'sent',
            });
          } else {
            console.error('📧 Email send failed:', emailResult);
            // تسجيل كـ failed
            await supabase.from('notifications').insert({
              user_id: userId,
              title,
              message,
              type,
              channel: 'email',
              delivery_status: 'failed',
            });
          }
        } catch (error) {
          console.error('📧 Email send error:', error);
          await supabase.from('notifications').insert({
            user_id: userId,
            title,
            message,
            type,
            channel: 'email',
            delivery_status: 'failed',
          });
        }
      } else if (!RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not configured');
      }
    }

    // 3. إرسال SMS (إذا طُلب)
    if (channel === 'sms' || channel === 'all') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, notification_preferences')
        .eq('user_id', userId)
        .single();

      const preferences = profile?.notification_preferences as NotificationPreferences | null;
      const smsEnabled = preferences?.sms !== false;

      if (profile?.phone && smsEnabled) {
        try {
          // يمكن إضافة تكامل مع Twilio هنا
          console.log(`📱 SMS notification queued for ${profile.phone}`);
          results.sms = true;

          await supabase.from('notifications').insert({
            user_id: userId,
            title,
            message,
            type,
            channel: 'sms',
            delivery_status: 'pending',
          });
        } catch (error) {
          console.error('SMS send error:', error);
        }
      }
    }

    return jsonResponse({
      success: true,
      results,
      message: 'Notification sent successfully',
    });
  } catch (error) {
    console.error('Notification error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
