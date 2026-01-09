// Edge Function: محاكاة توزيع متقدمة - مؤمّنة
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { 
  handleCors, 
  jsonResponse, 
  errorResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

// ============ الأدوار المسموح لها بمحاكاة التوزيع ============
const ALLOWED_ROLES = ['admin', 'nazer', 'accountant'];

// ============ Rate Limiting - 20 محاكاة/ساعة لكل مستخدم ============
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
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

interface SimulationParams {
  total_amount: number;
  period_start?: string;
  period_end?: string;
  waqf_corpus_percentage?: number;
  nazer_percentage?: number;
  reserve_percentage?: number;
  maintenance_percentage?: number;
  development_percentage?: number;
}

interface BeneficiaryWithPriority {
  id: string;
  full_name: string;
  beneficiary_number: string;
  priority_level: number;
  category: string;
  iban: string | null;
  bank_name: string | null;
}

interface DistributionDetail {
  beneficiary_id: string;
  beneficiary_name: string;
  beneficiary_number: string;
  priority_level: number;
  category: string;
  allocated_amount: number;
  iban: string | null;
  bank_name: string | null;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck || parsed.testMode) {
          console.log('[simulate-distribution] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'simulate-distribution',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }
    // ============ التحقق من المصادقة والصلاحيات ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Distribution simulation attempt without authorization header');
      return forbiddenResponse('مطلوب تسجيل الدخول لمحاكاة التوزيع');
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Invalid token for distribution simulation:', authError?.message);
      return forbiddenResponse('جلسة غير صالحة');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // التحقق من صلاحيات المستخدم
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasPermission = userRoles?.some(r => ALLOWED_ROLES.includes(r.role));
    
    if (!hasPermission) {
      // تسجيل محاولة الوصول غير المصرح بها
      await supabaseClient.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action_type: 'UNAUTHORIZED_SIMULATION_ATTEMPT',
        table_name: 'distributions',
        description: `محاولة محاكاة توزيع غير مصرح بها من ${user.email}`,
        severity: 'error'
      });
      return forbiddenResponse('ليس لديك صلاحية لمحاكاة التوزيع. مطلوب دور مدير أو ناظر أو محاسب.');
    }

    // ✅ Rate Limiting
    if (!checkRateLimit(user.id)) {
      console.warn(`[simulate-distribution] Rate limit exceeded for user: ${user.id}`);
      return errorResponse('تجاوزت الحد المسموح (20 محاكاة/ساعة). يرجى الانتظار.', 429);
    }

    // ============ تنفيذ المحاكاة ============
    console.log(`Authorized distribution simulation by user: ${user.id}`);

    const params: SimulationParams = await req.json();

    console.log('📊 بدء محاكاة التوزيع:', params);

    // 1. حساب الاستقطاعات
    const nazer_share = params.total_amount * (params.nazer_percentage || 0.05);
    const reserve = params.total_amount * (params.reserve_percentage || 0.10);
    const waqf_corpus = params.total_amount * (params.waqf_corpus_percentage || 0.05);
    const maintenance = params.total_amount * (params.maintenance_percentage || 0.03);
    const development = params.total_amount * (params.development_percentage || 0.02);

    const total_deductions = nazer_share + reserve + waqf_corpus + maintenance + development;
    const distributable_amount = params.total_amount - total_deductions;

    console.log('💰 الاستقطاعات:', {
      nazer_share,
      reserve,
      waqf_corpus,
      maintenance,
      development,
      total_deductions,
      distributable_amount,
    });

    // 2. جلب المستفيدين النشطين مع أولوياتهم
    const { data: beneficiaries, error: beneficiariesError } = await supabaseClient
      .from('beneficiaries')
      .select('id, full_name, beneficiary_number, priority_level, category, iban, bank_name')
      .eq('status', 'نشط')
      .order('priority_level', { ascending: false })
      .order('category');

    if (beneficiariesError) {
      console.error('❌ خطأ في جلب المستفيدين:', beneficiariesError);
      throw beneficiariesError;
    }

    if (!beneficiaries || beneficiaries.length === 0) {
      return jsonResponse({
        error: 'لا يوجد مستفيدون نشطون',
        summary: {
          total_revenues: params.total_amount,
          deductions: {
            nazer_share,
            reserve,
            waqf_corpus,
            maintenance,
            development,
            total: total_deductions,
          },
          distributable_amount,
          beneficiaries_count: 0,
        },
        details: [],
      });
    }

    console.log(`👥 تم جلب ${beneficiaries.length} مستفيد نشط`);

    // 3. حساب القروض والاستقطاعات التلقائية
    const { data: activeLoans } = await supabaseClient
      .from('loans')
      .select('beneficiary_id, remaining_balance, monthly_installment')
      .eq('status', 'نشط');

    const loanDeductions = new Map<string, number>();
    if (activeLoans) {
      activeLoans.forEach((loan) => {
        const currentDeduction = loanDeductions.get(loan.beneficiary_id) || 0;
        loanDeductions.set(
          loan.beneficiary_id,
          currentDeduction + (loan.monthly_installment || 0)
        );
      });
    }

    console.log('📋 استقطاعات القروض:', Object.fromEntries(loanDeductions));

    // 4. توزيع المبلغ حسب الأولوية والفئة
    const distribution: DistributionDetail[] = [];
    
    // تجميع المستفيدين حسب الأولوية
    const priorityGroups = new Map<number, BeneficiaryWithPriority[]>();
    beneficiaries.forEach((b: BeneficiaryWithPriority) => {
      const priority = b.priority_level || 1;
      if (!priorityGroups.has(priority)) {
        priorityGroups.set(priority, []);
      }
      priorityGroups.get(priority)!.push(b);
    });

    // ترتيب الأولويات من الأعلى للأدنى
    const sortedPriorities = Array.from(priorityGroups.keys()).sort((a, b) => b - a);

    // توزيع متساوٍ ضمن كل أولوية
    let remainingAmount = distributable_amount;
    const totalBeneficiaries = beneficiaries.length;
    const baseAmount = distributable_amount / totalBeneficiaries;

    console.log('📐 حساب التوزيع:', {
      totalBeneficiaries,
      baseAmount,
      remainingAmount,
    });

    beneficiaries.forEach((beneficiary: BeneficiaryWithPriority) => {
      let allocatedAmount = baseAmount;

      // خصم القرض إن وجد
      const loanDeduction = loanDeductions.get(beneficiary.id) || 0;
      const finalAmount = Math.max(0, allocatedAmount - loanDeduction);

      distribution.push({
        beneficiary_id: beneficiary.id,
        beneficiary_name: beneficiary.full_name,
        beneficiary_number: beneficiary.beneficiary_number || '',
        priority_level: beneficiary.priority_level || 1,
        category: beneficiary.category || 'عام',
        allocated_amount: Math.round(finalAmount * 100) / 100,
        iban: beneficiary.iban,
        bank_name: beneficiary.bank_name,
      });
    });

    // 5. إعداد الملخص النهائي
    const summary = {
      total_revenues: params.total_amount,
      deductions: {
        nazer_share: Math.round(nazer_share * 100) / 100,
        reserve: Math.round(reserve * 100) / 100,
        waqf_corpus: Math.round(waqf_corpus * 100) / 100,
        maintenance: Math.round(maintenance * 100) / 100,
        development: Math.round(development * 100) / 100,
        total: Math.round(total_deductions * 100) / 100,
      },
      distributable_amount: Math.round(distributable_amount * 100) / 100,
      beneficiaries_count: beneficiaries.length,
      total_distributed: Math.round(distribution.reduce((sum, d) => sum + d.allocated_amount, 0) * 100) / 100,
    };

    console.log('✅ اكتملت المحاكاة:', summary);

    // تسجيل العملية
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action_type: 'DISTRIBUTION_SIMULATION',
      table_name: 'distributions',
      description: `محاكاة توزيع بمبلغ ${params.total_amount} ريال بواسطة ${user.email}`,
      new_values: summary,
      severity: 'info'
    });

    return jsonResponse({
      success: true,
      summary,
      details: distribution,
      metadata: {
        simulation_date: new Date().toISOString(),
        priority_levels: sortedPriorities,
        loan_deductions_count: loanDeductions.size,
        simulated_by: user.email,
      },
    });
  } catch (error) {
    console.error('❌ خطأ في المحاكاة:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      500
    );
  }
});
