import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

interface DistributionSettings {
  maintenance_percentage: number;
  nazer_percentage: number;
  waqif_charity_percentage: number;
  waqf_corpus_percentage: number;
  reserve_percentage: number;
  calculation_order: string;
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
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support / Test Mode
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck || parsed.testMode) {
          console.log('[generate-distribution-summary] Health check / test mode received');
          return jsonResponse({
            status: 'healthy',
            function: 'generate-distribution-summary',
            timestamp: new Date().toISOString(),
            testMode: parsed.testMode || false
          });
        }
      } catch { /* not JSON, continue */ }
    }

    // 🔐 التحقق من المصادقة
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[generate-distribution-summary] ❌ No authorization header');
      return errorResponse('غير مصرح - يجب تسجيل الدخول', 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 🔐 التحقق من صحة التوكن والصلاحيات
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[generate-distribution-summary] ❌ Invalid token:', authError);
      return errorResponse('رمز المصادقة غير صحيح', 401);
    }

    // 🔐 التحقق من صلاحيات المستخدم (admin, nazer, accountant)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAccess = roles?.some(r => ['admin', 'nazer', 'accountant'].includes(r.role));
    if (!hasAccess) {
      console.error('[generate-distribution-summary] ❌ Unauthorized role:', { userId: user.id, roles });
      return errorResponse('ليس لديك صلاحية للوصول لهذه الخدمة', 403);
    }

    console.log('[generate-distribution-summary] ✅ Authorized:', { userId: user.id, roles: roles?.map(r => r.role) });

    const { period_start, period_end, distribution_type = 'شهري', waqf_corpus_percentage = 0 } = await req.json();

    console.log(`📊 Starting distribution calculation for period ${period_start} to ${period_end}`);

    // 1. جلب إعدادات التوزيع
    const { data: settings, error: settingsError } = await supabase
      .from('waqf_distribution_settings')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (settingsError) {
      console.error('❌ Error fetching settings:', settingsError);
      throw settingsError;
    }
    if (!settings) throw new Error('لا توجد إعدادات توزيع نشطة');

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

    // في وضع الاختبار (لا توجد إيرادات حقيقية) نعيد نتيجة تجريبية
    if (netRevenues <= 0) {
      console.log('[generate-distribution-summary] No revenues - returning test summary');
      return jsonResponse({
        success: true,
        testMode: true,
        message: 'لا يوجد صافي إيرادات للتوزيع في الفترة المحددة',
        summary: {
          total_revenues: totalRevenues,
          total_expenses: totalExpenses,
          net_revenues: netRevenues,
          distributable_amount: 0,
          beneficiaries_count: 0
        }
      });
    }

    // 5. الحساب التسلسلي حسب الأحكام الشرعية
    let remainingAmount = netRevenues;

    // 1️⃣ الصيانة والعمارة (أول ما يُخرج)
    const maintenanceAmount = remainingAmount * ((settings.maintenance_percentage || 0) / 100);
    remainingAmount -= maintenanceAmount;
    console.log(`🔧 Maintenance (${settings.maintenance_percentage}%): ${maintenanceAmount} SAR | Remaining: ${remainingAmount}`);

    // 2️⃣ نسبة الناظر (من الباقي)
    const nazerShare = remainingAmount * ((settings.nazer_percentage || 0) / 100);
    remainingAmount -= nazerShare;
    console.log(`👤 Nazer (${settings.nazer_percentage}%): ${nazerShare} SAR | Remaining: ${remainingAmount}`);

    // 3️⃣ صدقة الواقف (من الباقي)
    const waqifCharity = remainingAmount * ((settings.waqif_charity_percentage || 0) / 100);
    remainingAmount -= waqifCharity;
    console.log(`💝 Waqif Charity (${settings.waqif_charity_percentage}%): ${waqifCharity} SAR | Remaining: ${remainingAmount}`);

    // 4️⃣ الاحتياطي (اختياري، من الباقي)
    const reserveAmount = settings.reserve_percentage 
      ? remainingAmount * ((settings.reserve_percentage || 0) / 100)
      : 0;
    remainingAmount -= reserveAmount;
    console.log(`🏦 Reserve (${settings.reserve_percentage || 0}%): ${reserveAmount} SAR | Remaining: ${remainingAmount}`);

    const waqfCorpus = 0; // Not used in sequential calculation

    // Validation
    const totalPercentages = 
      (settings.maintenance_percentage || 0) +
      (settings.nazer_percentage || 0) +
      (settings.waqif_charity_percentage || 0) +
      (settings.reserve_percentage || 0);

    if (totalPercentages > 50) {
      throw new Error(
        `مجموع النسب (${totalPercentages}%) مرتفع جداً. يجب ألا يتجاوز 50% لضمان نصيب معقول للمستفيدين.`
      );
    }

    if ((settings.maintenance_percentage || 0) === 0) {
      console.warn('⚠️ تحذير: نسبة الصيانة 0% - قد يؤثر على حفظ أصل الوقف');
    }

    console.log(`👤 Nazer Share (${settings.nazer_percentage}%): ${nazerShare} SAR`);
    console.log(`💝 Waqif Charity (${settings.waqif_charity_percentage}%): ${waqifCharity} SAR`);
    console.log(`🔧 Maintenance (${settings.maintenance_percentage}%): ${maintenanceAmount} SAR`);

    // 6. المبلغ المتاح للتوزيع
    const distributableAmount = remainingAmount;
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
        maintenance_amount: maintenanceAmount,
        nazer_share: nazerShare,
        nazer_percentage: settings.nazer_percentage || 0,
        waqif_charity: waqifCharity,
        charity_percentage: settings.waqif_charity_percentage || 0,
        waqf_corpus: waqfCorpus,
        corpus_percentage: waqf_corpus_percentage,
        reserve_amount: reserveAmount,
        distributable_amount: distributableAmount,
        total_amount: distributableAmount,
        beneficiaries_count: beneficiaries.length,
        sons_count: sons.length,
        daughters_count: daughters.length,
        wives_count: wives.length,
        status: 'مسودة',
        calculation_notes: 'حساب تسلسلي شرعي: صيانة ← ناظر ← صدقة ← احتياطي ← مستفيدين',
      })
      .select()
      .maybeSingle();

    if (distError) throw distError;
    if (!distribution) throw new Error('فشل إنشاء سجل التوزيع');

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

    // 12. إنشاء سجلات الاحتياطيات
    if (maintenanceAmount > 0) {
      await supabase.from('waqf_reserves').insert({
        reserve_type: 'صيانة',
        distribution_id: distribution.id,
        amount: maintenanceAmount,
        current_balance: maintenanceAmount,
      });
    }

    if (reserveAmount > 0) {
      await supabase.from('waqf_reserves').insert({
        reserve_type: 'احتياطي',
        distribution_id: distribution.id,
        amount: reserveAmount,
        current_balance: reserveAmount,
      });
    }

    return jsonResponse({
      success: true,
      distribution: distribution,
      details: distributionDetails,
      summary: {
        total_revenues: totalRevenues,
        total_expenses: totalExpenses,
        net_revenues: netRevenues,
        maintenance_amount: maintenanceAmount,
        nazer_share: nazerShare,
        waqif_charity: waqifCharity,
        waqf_corpus: waqfCorpus,
        reserve_amount: reserveAmount,
        distributable_amount: distributableAmount,
        beneficiaries_count: beneficiaries.length
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});
