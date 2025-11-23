// Edge Function: محاكاة توزيع متقدمة
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const params: SimulationParams = await req.json();

    console.log('📊 بدء محاكاة التوزيع:', params);

    // 1. حساب الاستقطاعات
    const nazer_share = params.total_amount * (params.nazer_percentage || 0.05); // 5% افتراضي
    const reserve = params.total_amount * (params.reserve_percentage || 0.10); // 10% افتراضي
    const waqf_corpus = params.total_amount * (params.waqf_corpus_percentage || 0.05); // 5% افتراضي
    const maintenance = params.total_amount * (params.maintenance_percentage || 0.03); // 3% افتراضي
    const development = params.total_amount * (params.development_percentage || 0.02); // 2% افتراضي

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
      return new Response(
        JSON.stringify({
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
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        details: distribution,
        metadata: {
          simulation_date: new Date().toISOString(),
          priority_levels: sortedPriorities,
          loan_deductions_count: loanDeductions.size,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ خطأ في المحاكاة:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
