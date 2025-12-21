import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

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
          console.log('[contract-renewal-alerts] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'contract-renewal-alerts',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { daysBeforeExpiry = 30 } = await req.json().catch(() => ({}));

    console.log(`Checking contracts expiring in ${daysBeforeExpiry} days...`);

    // حساب تاريخ انتهاء الصلاحية
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + daysBeforeExpiry);

    // جلب العقود المنتهية قريباً
    const { data: expiringContracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        id,
        contract_number,
        start_date,
        end_date,
        monthly_rent,
        status,
        tenant_name,
        property_id,
        properties (
          name,
          type,
          location
        )
      `)
      .eq('status', 'active')
      .lte('end_date', expiryDate.toISOString().split('T')[0])
      .gte('end_date', today.toISOString().split('T')[0])
      .order('end_date', { ascending: true });

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return errorResponse('فشل في جلب العقود', 500);
    }

    console.log(`Found ${expiringContracts?.length || 0} contracts expiring soon`);

    const alerts: Array<{
      contractId: string;
      contractNumber: string;
      tenantName: string;
      propertyName: string;
      endDate: string;
      daysRemaining: number;
      alertSent: boolean;
    }> = [];

    for (const contract of expiringContracts || []) {
      const endDate = new Date(contract.end_date);
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // التحقق من عدم إرسال تنبيه مسبقاً لهذا العقد
      const { data: existingAlert } = await supabase
        .from('notifications')
        .select('id')
        .eq('reference_type', 'contract_expiry')
        .eq('reference_id', contract.id)
        .gte('created_at', new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (!existingAlert) {
        // جلب المسؤولين (admin/nazer) لإرسال الإشعارات
        const { data: admins } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['admin', 'nazer']);

        // إنشاء تنبيه جديد
        const alertTitle = daysRemaining <= 7 
          ? `⚠️ عقد ينتهي خلال ${daysRemaining} يوم!`
          : `📅 تنبيه: عقد ينتهي خلال ${daysRemaining} يوم`;

        const props = contract.properties as { name?: string; type?: string; location?: string }[] | { name?: string; type?: string; location?: string } | null;
        const propertyName = Array.isArray(props) ? props[0]?.name : props?.name;
        
        const alertMessage = `
العقد رقم: ${contract.contract_number}
المستأجر: ${contract.tenant_name}
العقار: ${propertyName || 'غير محدد'}
تاريخ الانتهاء: ${contract.end_date}
الإيجار الشهري: ${contract.monthly_rent?.toLocaleString('ar-SA')} ريال
        `.trim();

        // إرسال إشعار لكل مسؤول (admin/nazer)
        let alertSentSuccessfully = false;
        for (const admin of admins || []) {
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: admin.user_id, // ✅ إضافة user_id المطلوب
              title: alertTitle,
              message: alertMessage,
              type: daysRemaining <= 7 ? 'warning' : 'info',
              priority: daysRemaining <= 7 ? 'high' : 'medium',
              reference_type: 'contract_expiry',
              reference_id: contract.id,
              is_read: false
            });
          
          if (!notifError) alertSentSuccessfully = true;
        }

        // إضافة تنبيه ذكي (لا يحتاج user_id)
        await supabase
          .from('smart_alerts')
          .insert({
            title: alertTitle,
            description: alertMessage,
            alert_type: 'contract_expiry',
            severity: daysRemaining <= 7 ? 'critical' : 'warning',
            data: {
              contract_id: contract.id,
              contract_number: contract.contract_number,
              end_date: contract.end_date,
              days_remaining: daysRemaining,
              tenant_name: contract.tenant_name,
              monthly_rent: contract.monthly_rent
            },
            is_dismissed: false
          });

        alerts.push({
          contractId: contract.id,
          contractNumber: contract.contract_number,
          tenantName: contract.tenant_name,
          propertyName: propertyName || 'غير محدد',
          endDate: contract.end_date,
          daysRemaining,
          alertSent: alertSentSuccessfully
        });

        console.log(`Alert created for contract ${contract.contract_number}, notified ${admins?.length || 0} admins`);
      }
    }

    // تسجيل في سجل العمليات
    await supabase
      .from('audit_logs')
      .insert({
        action_type: 'contract_renewal_check',
        description: `تم فحص العقود المنتهية: ${expiringContracts?.length || 0} عقد، إرسال ${alerts.length} تنبيه`,
        new_values: {
          total_checked: expiringContracts?.length || 0,
          alerts_sent: alerts.length,
          days_before_expiry: daysBeforeExpiry
        }
      });

    return jsonResponse({
      success: true,
      summary: {
        totalExpiringContracts: expiringContracts?.length || 0,
        alertsSent: alerts.length,
        daysBeforeExpiry
      },
      alerts
    });

  } catch (error) {
    console.error('Contract renewal alerts error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'خطأ في فحص العقود',
      500
    );
  }
});
