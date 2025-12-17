import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse 
} from '../_shared/cors.ts';

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

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
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

    // 2. إرسال بريد إلكتروني (إذا طُلب)
    if (channel === 'email' || channel === 'all') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, notification_preferences')
        .eq('user_id', userId)
        .single();

      // التحقق من تفضيلات المستخدم
      const preferences = profile?.notification_preferences as NotificationPreferences | null;
      const emailEnabled = preferences?.email !== false;

      if (profile?.email && emailEnabled) {
        try {
          // يمكن إضافة تكامل مع Resend أو SendGrid هنا
          console.log(`📧 Email notification queued for ${profile.email}`);
          results.email = true;
          
          // تسجيل في جدول الإشعارات
          await supabase.from('notifications').insert({
            user_id: userId,
            title,
            message,
            type,
            channel: 'email',
            delivery_status: 'pending',
          });
        } catch (error) {
          console.error('Email send error:', error);
        }
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
