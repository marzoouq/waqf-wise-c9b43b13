import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

// ============ الأدوار المسموح لها بالتحليل الذكي ============
const ALLOWED_ROLES = ['admin', 'nazer', 'accountant'];

// ============ Rate Limiting Configuration ============
const RATE_LIMIT = {
  maxRequests: 10,    // 10 تحليلات
  windowMs: 3600000   // في الساعة
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
          console.log('[generate-ai-insights] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'generate-ai-insights',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }
    // ✅ التحقق من المصادقة
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

    console.log('Authenticated user:', user.id);

    // استخدام service role للعمليات الداخلية
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ✅ التحقق من صلاحيات المستخدم
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasPermission = userRoles?.some(r => ALLOWED_ROLES.includes(r.role));
    
    if (!hasPermission) {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action_type: 'UNAUTHORIZED_AI_INSIGHTS_ATTEMPT',
        table_name: 'custom_reports',
        description: `محاولة إنشاء تحليل ذكي غير مصرح بها من ${user.email}`,
        severity: 'error'
      });
      return forbiddenResponse('ليس لديك صلاحية لإنشاء تحليلات ذكية. مطلوب دور مدير أو ناظر أو محاسب.');
    }

    // 🔐 SECURITY: Rate Limiting
    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      console.warn('⚠️ Rate limit exceeded for user:', user.id);
      return new Response(JSON.stringify({
        success: false,
        error: 'تم تجاوز الحد الأقصى للتحليلات (10/ساعة). يرجى الانتظار.'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    console.log(`Authorized AI insights by user: ${user.id}, Rate limit remaining: ${rateCheck.remaining}`);

    const { reportType, dataQuery, filters } = await req.json();

    // جمع البيانات المطلوبة
    let data;
    switch (reportType) {
      case 'beneficiaries':
        const { data: benData } = await supabase
          .from('beneficiary_statistics')
          .select('*')
          .limit(100);
        data = benData;
        break;
      case 'financial':
        const { data: finData } = await supabase
          .from('journal_entries')
          .select('*, journal_entry_lines(*)')
          .order('entry_date', { ascending: false })
          .limit(50);
        data = finData;
        break;
      case 'properties':
        const { data: propData } = await supabase
          .from('contracts')
          .select('*, properties(*), rental_payments(*)')
          .limit(50);
        data = propData;
        break;
      case 'loans':
        const { data: loanData } = await supabase
          .from('loans')
          .select('*, loan_installments(*), beneficiaries(full_name)')
          .limit(50);
        data = loanData;
        break;
      default:
        data = [];
    }

    // تقليل حجم البيانات للإرسال للـ AI
    const summaryData = data ? JSON.stringify(data.slice(0, 5)) : '[]';
    
    // التحقق من وجود API Key
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY is not set');
      throw new Error('API Key not configured');
    }

    console.log('Calling Lovable AI API...');
    
    // استخدام AI لتحليل البيانات - Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'أنت محلل بيانات خبير في إدارة الأوقاف. قم بتحليل البيانات المقدمة وقدم رؤى قيمة، اتجاهات، وتوصيات عملية. استخدم اللغة العربية واجعل التحليل واضحاً ومختصراً.'
          },
          {
            role: 'user',
            content: `قم بتحليل هذه البيانات الخاصة بـ ${reportType}:\n\nعدد السجلات: ${data?.length || 0}\nعينة من البيانات:\n${summaryData}\n\nقدم تحليلاً مختصراً (500 كلمة كحد أقصى) يتضمن:\n1. الملخص التنفيذي\n2. الاتجاهات الرئيسية\n3. التوصيات العملية`
          }
        ],
        max_tokens: 2000,
      }),
    });

    console.log('AI Response status:', aiResponse.status);
    
    // معالجة أخطاء Rate Limit و Payment
    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        console.error('Rate limit exceeded');
        return errorResponse('تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقاً', 429);
      }
      if (aiResponse.status === 402) {
        console.error('Payment required');
        return errorResponse('يرجى إضافة رصيد لاستخدام خدمات الذكاء الاصطناعي', 402);
      }
      const errorText = await aiResponse.text();
      console.error('AI API Error:', errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received');
    
    const analysis = aiData.choices?.[0]?.message?.content || 'لم يتم إنشاء تحليل';

    // حفظ التقرير مع معرف المستخدم
    const { data: report } = await supabase
      .from('custom_reports')
      .insert({
        name: `تحليل ذكي - ${reportType} - ${new Date().toLocaleDateString('ar-SA')}`,
        description: 'تقرير تحليلي تم إنشاؤه بواسطة الذكاء الاصطناعي',
        report_type: 'ai',
        configuration: {
          analysis,
          dataSnapshot: data ? data.slice(0, 10) : [],
          generatedAt: new Date().toISOString(),
        },
        created_by: user.id,
      })
      .select()
      .maybeSingle();

    // تسجيل العملية
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action_type: 'AI_INSIGHTS_GENERATED',
      table_name: 'custom_reports',
      record_id: report?.id,
      description: `تم إنشاء تحليل ذكي من نوع ${reportType} بواسطة ${user.email}`,
      severity: 'info'
    });

    return jsonResponse({
      success: true,
      analysis,
      reportId: report?.id,
      dataCount: data ? data.length : 0,
    });
  } catch (error) {
    console.error('AI Insights Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
