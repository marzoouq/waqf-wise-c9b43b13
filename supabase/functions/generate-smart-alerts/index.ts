import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse 
} from '../_shared/cors.ts';

interface SmartAlert {
  alert_type: 'contract_expiring' | 'rent_overdue' | 'loan_due' | 'request_overdue' | 'anomaly' | 'recommendation';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action_url: string;
  data: Record<string, unknown>;
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
        if (parsed.ping || parsed.healthCheck) {
          console.log('[generate-smart-alerts] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'generate-smart-alerts',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const alerts: SmartAlert[] = [];

    // 1. التحقق من العقود القاربة على الانتهاء (30 يوم)
    const { data: expiringContracts } = await supabase
      .from('contracts')
      .select('id, contract_number, tenant_name, end_date, property:properties(name)')
      .eq('status', 'نشط')
      .gte('end_date', new Date().toISOString().split('T')[0])
      .lte('end_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (expiringContracts && expiringContracts.length > 0) {
      alerts.push({
        alert_type: 'contract_expiring',
        severity: expiringContracts.length > 5 ? 'critical' : 'warning',
        title: `${expiringContracts.length} عقد قارب على الانتهاء`,
        description: `يوجد ${expiringContracts.length} عقد سينتهي خلال 30 يوم. يُنصح بالتواصل مع المستأجرين لتجديد العقود.`,
        action_url: '/properties?tab=contracts',
        data: { count: expiringContracts.length, contracts: expiringContracts.slice(0, 5) }
      });
    }

    // 2. التحقق من الإيجارات المتأخرة
    const { data: overdueRents } = await supabase
      .from('rental_payments')
      .select('id, payment_number, amount_due, due_date, contract:contracts(tenant_name)')
      .in('status', ['معلق', 'متأخر'])
      .lt('due_date', new Date().toISOString().split('T')[0]);

    if (overdueRents && overdueRents.length > 0) {
      const totalOverdue = overdueRents.reduce((sum, r) => sum + Number(r.amount_due), 0);
      alerts.push({
        alert_type: 'rent_overdue',
        severity: overdueRents.length > 10 ? 'critical' : 'warning',
        title: `${overdueRents.length} دفعة إيجار متأخرة`,
        description: `إجمالي المتأخرات: ${totalOverdue.toLocaleString('ar-SA')} ريال. يُنصح بالمتابعة مع المستأجرين.`,
        action_url: '/properties?tab=payments',
        data: { count: overdueRents.length, total_amount: totalOverdue }
      });
    }

    // 3. التحقق من القروض المتأخرة
    const { data: overdueLoans } = await supabase
      .from('loans')
      .select('id, loan_number, principal_amount')
      .eq('status', 'defaulted');

    if (overdueLoans && overdueLoans.length > 5) {
      alerts.push({
        alert_type: 'loan_due',
        severity: 'critical',
        title: `تنبيه: ${overdueLoans.length} قرض متأخر`,
        description: `يوجد ${overdueLoans.length} قرض متأخر. يُنصح بمتابعة المستفيدين وتفعيل خطط السداد.`,
        action_url: '/loans',
        data: { count: overdueLoans.length, type: 'overdue_loans' }
      });
    }

    // 4. التحقق من الطلبات المعلقة لفترة طويلة (أكثر من 7 أيام)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: oldRequests } = await supabase
      .from('beneficiary_requests')
      .select('id, request_number')
      .eq('status', 'قيد المراجعة')
      .lt('submitted_at', sevenDaysAgo);

    if (oldRequests && oldRequests.length > 0) {
      alerts.push({
        alert_type: 'request_overdue',
        severity: 'warning',
        title: `${oldRequests.length} طلب معلق منذ أكثر من أسبوع`,
        description: 'هناك طلبات تحتاج إلى مراجعة عاجلة لتحسين وقت الاستجابة.',
        action_url: '/requests',
        data: { count: oldRequests.length, type: 'pending_requests' }
      });
    }

    // 5. توصيات ذكية بناءً على البيانات - حساب معدل الإشغال الصحيح
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('total_units, occupied_units');

    let totalUnits = 0;
    let occupiedUnits = 0;
    
    if (propertiesData && propertiesData.length > 0) {
      propertiesData.forEach(prop => {
        totalUnits += Number(prop.total_units) || 0;
        occupiedUnits += Number(prop.occupied_units) || 0;
      });
    }

    const occupancyRate = totalUnits > 0 
      ? ((occupiedUnits / totalUnits) * 100).toFixed(1) 
      : 0;

    if (Number(occupancyRate) < 70) {
      alerts.push({
        alert_type: 'recommendation',
        severity: 'info',
        title: `معدل الإشغال: ${occupancyRate}%`,
        description: `معدل الإشغال منخفض (${occupiedUnits}/${totalUnits} وحدة). يُنصح بتفعيل حملة تسويقية لزيادة الإيجارات.`,
        action_url: '/properties',
        data: { occupancy_rate: occupancyRate, occupied: occupiedUnits, total: totalUnits, type: 'low_occupancy' }
      });
    }

    // حذف التنبيهات القديمة (أكثر من 30 يوم)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('smart_alerts')
      .delete()
      .lt('created_at', thirtyDaysAgo);

    // التحقق من التنبيهات المكررة قبل الإدراج
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAlerts } = await supabase
      .from('smart_alerts')
      .select('title, alert_type')
      .gte('created_at', today);

    const existingTitles = new Set(existingAlerts?.map(a => `${a.alert_type}:${a.title}`) || []);

    // فلترة التنبيهات المكررة
    const newAlerts = alerts.filter(alert => 
      !existingTitles.has(`${alert.alert_type}:${alert.title}`)
    );

    // إدراج التنبيهات الجديدة فقط
    if (newAlerts.length > 0) {
      const { error: insertError } = await supabase
        .from('smart_alerts')
        .insert(newAlerts);

      if (insertError) throw insertError;
    }

    console.log(`[generate-smart-alerts] Generated: ${alerts.length}, New: ${newAlerts.length}, Skipped duplicates: ${alerts.length - newAlerts.length}`);

    return jsonResponse({ 
      success: true, 
      alerts_generated: alerts.length,
      message: `تم إنشاء ${alerts.length} تنبيه ذكي` 
    });

  } catch (error) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
