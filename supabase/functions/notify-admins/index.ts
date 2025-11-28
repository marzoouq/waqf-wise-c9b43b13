import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

interface NotificationPayload {
  alertId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  alertType: string;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 🔐 SECURITY: Verify Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return unauthorizedResponse('غير مصرح - يجب تسجيل الدخول');
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
      return unauthorizedResponse('رمز المصادقة غير صحيح');
    }

    // 🔐 SECURITY: Check if user is staff
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('❌ Error checking roles:', roleError);
      return errorResponse('خطأ في التحقق من الصلاحيات', 500);
    }

    const isStaff = roles?.some(r => ['admin', 'nazer', 'accountant', 'cashier', 'archivist'].includes(r.role));
    if (!isStaff) {
      console.error('❌ User is not staff:', { userId: user.id, roles });
      return forbiddenResponse('ليس لديك صلاحية لإرسال الإشعارات');
    }

    console.log('✅ Authorized notification request from:', { userId: user.id, email: user.email });

    const payload: NotificationPayload = await req.json();
    console.log('📨 Received notification request:', payload);

    // الحصول على جميع المسؤولين (admin و nazer هم الأدوار الإدارية العليا)
    const { data: admins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'nazer']);

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

    return jsonResponse({
      success: true,
      notified: notifications.length,
      message: `تم إشعار ${notifications.length} من المسؤولين`,
    });
  } catch (error) {
    console.error('❌ Error in notify-admins function:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      500
    );
  }
});
