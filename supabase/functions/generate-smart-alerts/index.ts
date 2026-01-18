/**
 * Generate Smart Alerts Edge Function
 * توليد التنبيهات الذكية للنظام
 * @version 2.0.0 - إضافة Rate Limiting و Audit Logging
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse 
} from '../_shared/cors.ts';

// ============ Rate Limiting - 5 تشغيلات/ساعة لكل مستخدم ============
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

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
    let requestBody: Record<string, unknown> = {};
    if (bodyClone) {
      try {
        requestBody = JSON.parse(bodyClone);
        if (requestBody.ping || requestBody.healthCheck) {
          console.log('[generate-smart-alerts] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'generate-smart-alerts',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }

    // ✅ CRON_SECRET Authentication Support (for scheduled jobs)
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedSecret = requestBody.cron_secret || req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("authorization");
    
    // السماح بالوصول إذا كان هناك JWT صالح أو CRON_SECRET صحيح
    const hasValidCronSecret = cronSecret && providedSecret === cronSecret;
    const hasAuthHeader = authHeader && authHeader.startsWith("Bearer ");
    
    if (!hasValidCronSecret && !hasAuthHeader) {
      console.log('[generate-smart-alerts] Unauthorized: No valid JWT or CRON_SECRET');
      return errorResponse("Unauthorized: يتطلب JWT أو CRON_SECRET صالح", 401);
    }

    const authMethod = hasValidCronSecret ? 'CRON_SECRET' : 'JWT';
    console.log(`[generate-smart-alerts] Authenticated via ${authMethod}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ✅ Rate Limiting للمستخدمين (ليس للمهام المجدولة)
    if (!hasValidCronSecret && hasAuthHeader) {
      const token = authHeader!.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user && !checkRateLimit(user.id)) {
        console.warn(`[generate-smart-alerts] Rate limit exceeded for user: ${user.id}`);
        return errorResponse("تجاوزت الحد المسموح (5 تشغيلات/ساعة)", 429);
      }
    }

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

    // ✅ تسجيل في audit_logs للتدقيق الجنائي
    try {
      let userId: string | null = null;
      let userEmail: string | null = 'cron_job@system';
      
      if (!hasValidCronSecret && hasAuthHeader) {
        const token = authHeader!.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
        userEmail = user?.email || null;
      }
      
      await supabase.from('audit_logs').insert({
        action_type: 'generate_smart_alerts',
        table_name: 'smart_alerts',
        user_id: userId,
        user_email: userEmail,
        description: `توليد التنبيهات الذكية: ${alerts.length} تنبيه، ${newAlerts.length} جديد`,
        severity: 'info',
        ip_address: req.headers.get('x-forwarded-for') || 'system',
        user_agent: req.headers.get('user-agent') || 'cron_job',
        metadata: { 
          alerts_generated: alerts.length, 
          new_alerts: newAlerts.length,
          skipped_duplicates: alerts.length - newAlerts.length,
          authMethod 
        }
      });
    } catch (auditError) {
      console.warn('[generate-smart-alerts] Failed to log audit:', auditError);
    }

    return jsonResponse({ 
      success: true, 
      alerts_generated: alerts.length,
      new_alerts: newAlerts.length,
      message: `تم إنشاء ${newAlerts.length} تنبيه ذكي جديد` 
    });

  } catch (error) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
