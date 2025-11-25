import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  alertId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  alertType: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 🔐 SECURITY: Verify Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'غير مصرح - يجب تسجيل الدخول' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 🔐 SECURITY: Extract and verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Invalid token:', authError);
      return new Response(
        JSON.stringify({ error: 'رمز المصادقة غير صحيح' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔐 SECURITY: Check if user is staff
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('❌ Error checking roles:', roleError);
      return new Response(
        JSON.stringify({ error: 'خطأ في التحقق من الصلاحيات' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isStaff = roles?.some(r => ['admin', 'nazer', 'accountant', 'cashier', 'archivist'].includes(r.role));
    if (!isStaff) {
      console.error('❌ User is not staff:', { userId: user.id, roles });
      return new Response(
        JSON.stringify({ error: 'ليس لديك صلاحية لإرسال الإشعارات' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Authorized notification request from:', { userId: user.id, email: user.email });

    const payload: NotificationPayload = await req.json();
    console.log('📨 Received notification request:', payload);

    // الحصول على جميع المسؤولين
    const { data: admins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'super_admin']);

    if (adminsError) {
      console.error('❌ Error fetching admins:', adminsError);
      throw adminsError;
    }

    console.log(`✅ Found ${admins?.length || 0} admins to notify`);

    // إنشاء إشعار لكل مسؤول
    const notifications = admins?.map((admin) => ({
      user_id: admin.user_id,
      title: payload.title,
      message: payload.description,
      type: 'system',
      reference_type: 'system_alert',
      reference_id: payload.alertId,
      action_url: '/system/monitoring',
      is_read: false,
    })) || [];

    if (notifications.length > 0) {
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifyError) {
        console.error('❌ Error creating notifications:', notifyError);
        throw notifyError;
      }

      console.log(`✅ Created ${notifications.length} notifications`);
    }

    // إرسال إشعار Push (اختياري - يمكن تفعيله لاحقاً)
    // await sendPushNotifications(admins, payload);

    return new Response(
      JSON.stringify({
        success: true,
        notified: notifications.length,
        message: `تم إشعار ${notifications.length} من المسؤولين`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error in notify-admins function:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
