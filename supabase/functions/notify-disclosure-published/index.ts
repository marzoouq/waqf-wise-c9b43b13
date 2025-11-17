import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    return new Response(
      JSON.stringify({
        success: true,
        notificationsCount: notifications.length,
        emailsCount: emailNotifications.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
