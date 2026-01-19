/**
 * Weekly Report Edge Function
 * إنشاء وإرسال تقرير أسبوعي للإدارة
 * @version 2.0.0 - إضافة Rate Limiting و Audit Logging
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

interface WeeklyStats {
  period: { start: string; end: string };
  beneficiaries: {
    total: number;
    active: number;
    new: number;
  };
  financials: {
    totalRevenue: number;
    totalExpenses: number;
    distributions: number;
    distributionAmount: number;
  };
  requests: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  properties: {
    total: number;
    occupied: number;
    occupancyRate: number;
  };
  system: {
    totalErrors: number;
    resolvedErrors: number;
    activeAlerts: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateWeeklyReport(supabase: any): Promise<WeeklyStats> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const startDate = weekAgo.toISOString();
  const endDate = now.toISOString();

  // جلب إحصائيات المستفيدين
  const [beneficiariesTotal, beneficiariesActive, beneficiariesNew] = await Promise.all([
    supabase.from("beneficiaries").select("*", { count: "exact", head: true }),
    supabase.from("beneficiaries").select("*", { count: "exact", head: true }).eq("status", "نشط"),
    supabase.from("beneficiaries").select("*", { count: "exact", head: true }).gte("created_at", startDate),
  ]);

  // جلب إحصائيات مالية
  const [revenuesResult, expensesResult, distributionsResult] = await Promise.all([
    supabase.from("rental_payments").select("amount_due").gte("payment_date", startDate).eq("status", "مدفوع"),
    supabase.from("journal_entry_lines").select("credit_amount").gte("created_at", startDate),
    supabase.from("distribution_details").select("allocated_amount").gte("created_at", startDate),
  ]);

  const revenues = revenuesResult.data || [];
  const expenses = expensesResult.data || [];
  const distributions = distributionsResult.data || [];

  const totalRevenue = revenues.reduce((sum: number, r: { amount_due?: number }) => sum + (r.amount_due || 0), 0);
  const totalExpenses = expenses.reduce((sum: number, e: { credit_amount?: number }) => sum + (e.credit_amount || 0), 0);
  const distributionAmount = distributions.reduce((sum: number, d: { allocated_amount?: number }) => sum + (d.allocated_amount || 0), 0);

  // جلب إحصائيات الطلبات
  const [requestsTotal, requestsApproved, requestsRejected, requestsPending] = await Promise.all([
    supabase.from("beneficiary_requests").select("*", { count: "exact", head: true }).gte("created_at", startDate),
    supabase.from("beneficiary_requests").select("*", { count: "exact", head: true }).gte("created_at", startDate).eq("status", "موافق"),
    supabase.from("beneficiary_requests").select("*", { count: "exact", head: true }).gte("created_at", startDate).eq("status", "مرفوض"),
    supabase.from("beneficiary_requests").select("*", { count: "exact", head: true }).in("status", ["معلق", "قيد المراجعة"]),
  ]);

  // جلب إحصائيات العقارات
  const [propertiesTotal, contractsActive] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("contracts").select("*", { count: "exact", head: true }).eq("status", "نشط"),
  ]);

  const totalProperties = propertiesTotal.count || 0;
  const occupiedProperties = contractsActive.count || 0;
  const occupancyRate = totalProperties ? Math.round(occupiedProperties / totalProperties * 100) : 0;

  // جلب إحصائيات النظام
  const [errorsTotal, errorsResolved, alertsActive] = await Promise.all([
    supabase.from("system_error_logs").select("*", { count: "exact", head: true }).gte("created_at", startDate),
    supabase.from("system_error_logs").select("*", { count: "exact", head: true }).gte("created_at", startDate).eq("status", "resolved"),
    supabase.from("system_alerts").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);

  return {
    period: {
      start: startDate,
      end: endDate,
    },
    beneficiaries: {
      total: beneficiariesTotal.count || 0,
      active: beneficiariesActive.count || 0,
      new: beneficiariesNew.count || 0,
    },
    financials: {
      totalRevenue,
      totalExpenses,
      distributions: distributions.length,
      distributionAmount,
    },
    requests: {
      total: requestsTotal.count || 0,
      approved: requestsApproved.count || 0,
      rejected: requestsRejected.count || 0,
      pending: requestsPending.count || 0,
    },
    properties: {
      total: totalProperties,
      occupied: occupiedProperties,
      occupancyRate,
    },
    system: {
      totalErrors: errorsTotal.count || 0,
      resolvedErrors: errorsResolved.count || 0,
      activeAlerts: alertsActive.count || 0,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendReportNotification(supabase: any, report: WeeklyStats) {
  // إرسال إشعار للمديرين
  const { data: admins } = await supabase
    .from("user_roles")
    .select("user_id")
    .in("role", ["admin", "nazer"]);

  if (admins && admins.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    
    // ✅ فحص الإشعارات المرسلة اليوم لتجنب التكرار
    const { data: existingNotifications } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("title", "📊 التقرير الأسبوعي جاهز")
      .gte("created_at", `${today}T00:00:00.000Z`);
    
    const alreadyNotifiedUsers = new Set(
      existingNotifications?.map((n: { user_id: string }) => n.user_id) || []
    );
    
    // إرسال فقط للمستخدمين الذين لم يتلقوا إشعار اليوم
    const newNotifications = admins
      .filter((admin: { user_id: string }) => !alreadyNotifiedUsers.has(admin.user_id))
      .map((admin: { user_id: string }) => ({
        user_id: admin.user_id,
        title: "📊 التقرير الأسبوعي جاهز",
        message: `تقرير الأسبوع: ${report.beneficiaries.active} مستفيد نشط، ${report.financials.totalRevenue.toLocaleString('ar-SA')} ريال إيرادات، ${report.requests.approved} طلب تمت الموافقة عليه`,
        type: "info",
        priority: "medium",
        action_url: "/system-monitoring",
        delivery_status: "pending"
      }));

    if (newNotifications.length > 0) {
      await supabase.from("notifications").insert(newNotifications);
      console.log(`[weekly-report] أرسل ${newNotifications.length} إشعار جديد`);
    } else {
      console.log('[weekly-report] تم تجاهل الإشعارات - موجودة مسبقاً');
    }
  }

  return { success: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ Health Check Support
    const bodyClone = await req.clone().text();
    let requestBody: Record<string, unknown> = {};
    if (bodyClone) {
      try {
        requestBody = JSON.parse(bodyClone);
        if (requestBody.ping || requestBody.healthCheck) {
          console.log('[weekly-report] Health check received');
          return new Response(JSON.stringify({
            status: 'healthy',
            function: 'weekly-report',
            timestamp: new Date().toISOString()
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
      console.log('[weekly-report] Unauthorized: No valid JWT or CRON_SECRET');
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "يتطلب JWT أو CRON_SECRET صالح" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authMethod = hasValidCronSecret ? 'CRON_SECRET' : 'JWT';
    console.log(`[weekly-report] Authenticated via ${authMethod}`);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ✅ Rate Limiting للمستخدمين (ليس للمهام المجدولة)
    if (!hasValidCronSecret && hasAuthHeader) {
      const token = authHeader!.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user && !checkRateLimit(user.id)) {
        console.warn(`[weekly-report] Rate limit exceeded for user: ${user.id}`);
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded", message: "تجاوزت الحد المسموح (5 تشغيلات/ساعة)" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // توليد التقرير
    const report = await generateWeeklyReport(supabase);

    // إرسال الإشعارات
    await sendReportNotification(supabase, report);

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
        action_type: 'weekly_report',
        table_name: 'notifications',
        user_id: userId,
        user_email: userEmail,
        description: `تشغيل التقرير الأسبوعي: ${report.beneficiaries.active} مستفيد نشط، ${report.financials.totalRevenue} ريال إيرادات`,
        severity: 'info',
        ip_address: req.headers.get('x-forwarded-for') || 'system',
        user_agent: req.headers.get('user-agent') || 'cron_job',
        metadata: { report_period: report.period, authMethod }
      });
    } catch (auditError) {
      console.warn('[weekly-report] Failed to log audit:', auditError);
    }

    console.log("Weekly report generated successfully:", JSON.stringify(report));

    return new Response(
      JSON.stringify({
        success: true,
        message: "تم إنشاء التقرير الأسبوعي بنجاح",
        report,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating weekly report:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
