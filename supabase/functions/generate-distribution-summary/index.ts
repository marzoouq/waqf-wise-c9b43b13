import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DistributionSettings {
  nazer_percentage: number;
  waqif_charity_percentage: number;
  waqf_corpus_percentage: number;
  wives_share_ratio: number;
  distribution_rule: string;
}

interface Beneficiary {
  id: string;
  full_name: string;
  beneficiary_type: string;
  iban: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { period_start, period_end, distribution_type = 'شهري', waqf_corpus_percentage = 0 } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`📊 Starting distribution calculation for period ${period_start} to ${period_end}`);

    // 1. جلب إعدادات التوزيع
    const { data: settings, error: settingsError } = await supabase
      .from('waqf_distribution_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (settingsError) {
      console.error('❌ Error fetching settings:', settingsError);
      throw settingsError;
    }

    // 2. حساب الإيرادات (من الإيجارات)
    const { data: rentalPayments } = await supabase
      .from('rental_payments')
      .select('amount_paid')
      .gte('payment_date', period_start)
      .lte('payment_date', period_end)
      .eq('payment_status', 'مدفوع');

    const totalRevenues = rentalPayments?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;
    console.log(`💰 Total Revenues: ${totalRevenues} SAR`);

    // 3. حساب المصروفات
    const { data: expenses } = await supabase
      .from('payments')
      .select('amount')
      .eq('payment_type', 'صرف')
      .gte('payment_date', period_start)
      .lte('payment_date', period_end);

    const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    console.log(`💸 Total Expenses: ${totalExpenses} SAR`);

    // 4. صافي الإيرادات
    const netRevenues = totalRevenues - totalExpenses;
    console.log(`✅ Net Revenues: ${netRevenues} SAR`);

    if (netRevenues <= 0) {
      throw new Error('لا يوجد صافي إيرادات للتوزيع');
    }

    // 5. حساب الاستقطاعات (من صافي الإيرادات)
    const nazerShare = netRevenues * (settings.nazer_percentage / 100);
    const waqifCharity = netRevenues * (settings.waqif_charity_percentage / 100);
    const waqfCorpus = netRevenues * (waqf_corpus_percentage / 100);

    console.log(`👤 Nazer Share (${settings.nazer_percentage}%): ${nazerShare} SAR`);
    console.log(`💝 Waqif Charity (${settings.waqif_charity_percentage}%): ${waqifCharity} SAR`);
    console.log(`🏛️ Waqf Corpus (${waqf_corpus_percentage}%): ${waqfCorpus} SAR`);

    // 6. المبلغ المتاح للتوزيع
    const distributableAmount = netRevenues - nazerShare - waqifCharity - waqfCorpus;
    console.log(`📦 Distributable Amount: ${distributableAmount} SAR`);

    // 7. جلب المستفيدين النشطين
    const { data: beneficiaries, error: benError } = await supabase
      .from('beneficiaries')
      .select('id, full_name, beneficiary_type, iban')
      .eq('status', 'نشط');

    if (benError) throw benError;
    if (!beneficiaries || beneficiaries.length === 0) {
      throw new Error('لا يوجد مستفيدون نشطون');
    }

    console.log(`👥 Active Beneficiaries: ${beneficiaries.length}`);

    // 8. تصنيف المستفيدين
    const wives = beneficiaries.filter(b => b.beneficiary_type === 'زوجة');
    const sons = beneficiaries.filter(b => b.beneficiary_type === 'ولد');
    const daughters = beneficiaries.filter(b => b.beneficiary_type === 'بنت');
    const others = beneficiaries.filter(b => !['زوجة', 'ولد', 'بنت'].includes(b.beneficiary_type || ''));

    console.log(`👰 Wives: ${wives.length}, 👦 Sons: ${sons.length}, 👧 Daughters: ${daughters.length}`);

    // 9. حساب التوزيع حسب القاعدة الشرعية
    let distributionDetails: Array<{ beneficiary_id: string; beneficiary_type: string; allocated_amount: number }> = [];

    if (settings.distribution_rule === 'شرعي') {
      // أ) حصة الزوجات (الثمن = 12.5%)
      const wivesTotal = distributableAmount * (settings.wives_share_ratio / 100);
      const wivesPerPerson = wives.length > 0 ? wivesTotal / wives.length : 0;

      wives.forEach(wife => {
        distributionDetails.push({
          beneficiary_id: wife.id,
          beneficiary_type: 'زوجة',
          allocated_amount: wivesPerPerson
        });
      });

      // ب) الباقي للأولاد والبنات (للذكر مثل حظ الأنثيين)
      const remainingAmount = distributableAmount - wivesTotal;
      
      // حساب الأسهم: كل ابن = سهمان، كل بنت = سهم واحد
      const totalShares = (sons.length * 2) + (daughters.length * 1);
      const shareValue = totalShares > 0 ? remainingAmount / totalShares : 0;

      sons.forEach(son => {
        distributionDetails.push({
          beneficiary_id: son.id,
          beneficiary_type: 'ولد',
          allocated_amount: shareValue * 2
        });
      });

      daughters.forEach(daughter => {
        distributionDetails.push({
          beneficiary_id: daughter.id,
          beneficiary_type: 'بنت',
          allocated_amount: shareValue * 1
        });
      });

      console.log(`💰 Wives Total: ${wivesTotal} SAR (${wivesPerPerson} SAR each)`);
      console.log(`💰 Remaining: ${remainingAmount} SAR`);
      console.log(`📊 Total Shares: ${totalShares} (Share Value: ${shareValue} SAR)`);
    } else if (settings.distribution_rule === 'متساوي') {
      // التوزيع المتساوي
      const perPerson = distributableAmount / beneficiaries.length;
      beneficiaries.forEach(b => {
        distributionDetails.push({
          beneficiary_id: b.id,
          beneficiary_type: b.beneficiary_type || 'أخرى',
          allocated_amount: perPerson
        });
      });
    }

    // 10. إنشاء سجل التوزيع
    const { data: distribution, error: distError } = await supabase
      .from('distributions')
      .insert({
        month: new Date(period_start).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
        distribution_date: new Date().toISOString().split('T')[0],
        distribution_type: distribution_type,
        period_start: period_start,
        period_end: period_end,
        total_revenues: totalRevenues,
        total_expenses: totalExpenses,
        net_revenues: netRevenues,
        nazer_share: nazerShare,
        waqif_charity: waqifCharity,
        waqf_corpus: waqfCorpus,
        distributable_amount: distributableAmount,
        total_amount: distributableAmount,
        beneficiaries_count: beneficiaries.length,
        status: 'مسودة'
      })
      .select()
      .single();

    if (distError) throw distError;

    console.log(`✅ Distribution created with ID: ${distribution.id}`);

    // 11. حفظ تفاصيل التوزيع
    const detailsToInsert = distributionDetails.map(d => ({
      distribution_id: distribution.id,
      beneficiary_id: d.beneficiary_id,
      beneficiary_type: d.beneficiary_type,
      allocated_amount: d.allocated_amount,
      payment_status: 'معلق'
    }));

    const { error: detailsError } = await supabase
      .from('distribution_details')
      .insert(detailsToInsert);

    if (detailsError) throw detailsError;

    console.log(`✅ ${detailsToInsert.length} distribution details saved`);

    return new Response(
      JSON.stringify({
        success: true,
        distribution: distribution,
        details: distributionDetails,
        summary: {
          total_revenues: totalRevenues,
          total_expenses: totalExpenses,
          net_revenues: netRevenues,
          nazer_share: nazerShare,
          waqif_charity: waqifCharity,
          waqf_corpus: waqfCorpus,
          distributable_amount: distributableAmount,
          beneficiaries_count: beneficiaries.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
