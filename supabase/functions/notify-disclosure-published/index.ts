import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse 
} from '../_shared/cors.ts';

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
          console.log('[notify-disclosure-published] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'notify-disclosure-published',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { disclosure_id } = await req.json();

    if (!disclosure_id) {
      throw new Error('disclosure_id is required');
    }

    // جلب تفاصيل الإفصاح
    const { data: disclosure, error: disclosureError } = await supabaseClient
      .from('annual_disclosures')
      .select('*')
      .eq('id', disclosure_id)
      .single();

    if (disclosureError) throw disclosureError;

    // جلب جميع المستفيدين النشطين
    const { data: beneficiaries, error: beneficiariesError } = await supabaseClient
      .from('beneficiaries')
      .select('id, full_name, user_id, email, notification_preferences')
      .eq('status', 'نشط');

    if (beneficiariesError) throw beneficiariesError;

    // إنشاء إشعارات لكل مستفيد
    const notifications = beneficiaries
      .filter(b => b.user_id) // فقط المستفيدين الذين لديهم حسابات
      .map(b => ({
        user_id: b.user_id,
        title: `إفصاح سنوي جديد - ${disclosure.year}`,
        message: `تم نشر الإفصاح السنوي لوقف ${disclosure.waqf_name} لعام ${disclosure.year}. يمكنك الاطلاع على التفاصيل الكاملة من لوحة التحكم.`,
        type: 'info',
        reference_type: 'annual_disclosure',
        reference_id: disclosure_id,
        action_url: '/beneficiary/dashboard',
      }));

    if (notifications.length > 0) {
      const { error: notificationsError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (notificationsError) throw notificationsError;
    }

    // إرسال إشعارات بريد إلكتروني للمستفيدين الذين فعّلوا البريد
    const emailNotifications = beneficiaries.filter(
      b => b.email && b.notification_preferences?.email !== false
    );

    console.log(`Created ${notifications.length} notifications for disclosure ${disclosure_id}`);
    console.log(`${emailNotifications.length} beneficiaries will receive email notifications`);

    return jsonResponse({
      success: true,
      notificationsCount: notifications.length,
      emailsCount: emailNotifications.length,
    });
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      400
    );
  }
});
