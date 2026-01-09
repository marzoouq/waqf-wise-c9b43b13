import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse,
  unauthorizedResponse,
  rateLimitResponse 
} from '../_shared/cors.ts';

// ============ Rate Limiting & Role Configuration ============
const ALLOWED_ROLES = ['admin', 'nazer', 'accountant'];
const RATE_LIMIT = {
  maxRequests: 20,    // 20 تحليل
  windowMs: 60000     // في الدقيقة
};
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }
  
  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - userLimit.count };
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
        if (parsed.ping || parsed.healthCheck || parsed.testMode) {
          console.log('[property-ai-assistant] Health check / test mode received');
          return jsonResponse({
            status: 'healthy',
            function: 'property-ai-assistant',
            timestamp: new Date().toISOString(),
            version: '2.1.0'
          });
        }
      } catch { /* not JSON, continue */ }
    }
    // ✅ التحقق من المصادقة - إصلاح أمني
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return unauthorizedResponse('غير مصرح - يرجى تسجيل الدخول');
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return unauthorizedResponse('رمز غير صالح أو منتهي الصلاحية');
    }

    // 🔐 SECURITY: Check user role
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: userRoles } = await supabaseService
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasPermission = userRoles?.some(r => ALLOWED_ROLES.includes(r.role));
    if (!hasPermission) {
      console.error('❌ Unauthorized role for property AI:', { userId: user.id, roles: userRoles });
      return new Response(JSON.stringify({
        success: false,
        error: 'ليس لديك صلاحية لاستخدام المساعد الذكي للعقارات'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 🔐 SECURITY: Rate Limiting
    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      console.warn('⚠️ Rate limit exceeded for user:', user.id);
      return rateLimitResponse('تم تجاوز الحد الأقصى للتحليل (20/دقيقة). يرجى الانتظار.');
    }

    console.log('Authenticated user for property AI:', user.id, 'Rate limit remaining:', rateCheck.remaining);

    // Parse body - استخدام النص المحفوظ من health check
    let body;
    try {
      body = JSON.parse(bodyClone);
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }
    
    const { action, data } = body;
    
    // التحقق من وجود action
    if (!action) {
      return errorResponse('Action is required', 400);
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "analyze_property":
        systemPrompt = `أنت مساعد ذكي متخصص في تحليل العقارات الاستثمارية. قم بتحليل البيانات المقدمة وقدم رؤى واقتراحات.`;
        userPrompt = `
          حلل هذا العقار:
          - الاسم: ${data.name}
          - النوع: ${data.type}
          - الموقع: ${data.location}
          - الإيجار الشهري: ${data.monthly_rent} ريال
          - معدل الإشغال: ${data.occupancy_rate}%
          
          قدم:
          1. تحليل العائد على الاستثمار (ROI)
          2. توصيات لتحسين الإيرادات
          3. تقييم الموقع والطلب
          4. مقترحات للصيانة والتطوير
        `;
        break;

      case "suggest_maintenance":
        systemPrompt = `أنت مساعد ذكي متخصص في إدارة صيانة العقارات. قم بتحليل سجل الصيانة واقترح خطة صيانة مثالية.`;
        userPrompt = `
          بناءً على سجل الصيانة التالي:
          ${JSON.stringify(data.maintenance_history, null, 2)}
          
          اقترح:
          1. جدول صيانة دورية شامل
          2. أولويات الصيانة العاجلة
          3. تقدير التكاليف المتوقعة
          4. توصيات لتقليل تكاليف الصيانة
        `;
        break;

      case "predict_revenue":
        systemPrompt = `أنت مساعد ذكي متخصص في التوقعات المالية للعقارات. قم بتحليل البيانات التاريخية وتوقع الإيرادات المستقبلية.`;
        userPrompt = `
          بناءً على بيانات الإيرادات التاريخية:
          ${JSON.stringify(data.revenue_history, null, 2)}
          
          قدم:
          1. توقعات الإيرادات للأشهر الـ 6 القادمة
          2. تحليل الاتجاهات والأنماط
          3. عوامل المخاطر المحتملة
          4. توصيات لزيادة الإيرادات
        `;
        break;

      case "optimize_contracts":
        systemPrompt = `أنت مساعد ذكي متخصص في إدارة عقود الإيجار. قم بتحليل العقود الحالية واقترح تحسينات.`;
        userPrompt = `
          حلل العقود التالية:
          ${JSON.stringify(data.contracts, null, 2)}
          
          اقترح:
          1. تعديلات على قيمة الإيجار بناءً على السوق
          2. شروط عقد أفضل
          3. استراتيجيات لتقليل معدل الإخلاء
          4. خطة لتجديد العقود المنتهية
        `;
        break;

      case "alert_insights":
        systemPrompt = `أنت مساعد ذكي متخصص في تحليل التنبيهات والمخاطر العقارية. قم بتحليل التنبيهات وتقديم رؤى استباقية.`;
        userPrompt = `
          حلل التنبيهات التالية:
          ${JSON.stringify(data.alerts, null, 2)}
          
          قدم:
          1. تحديد المخاطر الحرجة
          2. خطة عمل للتعامل مع كل تنبيه
          3. توصيات لتجنب تنبيهات مستقبلية
          4. تحليل الأنماط المتكررة
        `;
        break;

      default:
        throw new Error("Invalid action");
    }

    // استدعاء Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return rateLimitResponse('تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً');
      }
      if (aiResponse.status === 402) {
        return errorResponse('يرجى إضافة رصيد إلى حساب Lovable AI', 402);
      }
      
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResult = await aiResponse.json();
    const analysis = aiResult.choices[0].message.content;

    return jsonResponse({ success: true, analysis });
    
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Unknown error",
      500
    );
  }
});
