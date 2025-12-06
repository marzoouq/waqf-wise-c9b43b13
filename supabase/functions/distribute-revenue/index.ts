import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DistributionRequest {
  totalAmount: number;
  fiscalYearId: string;
  distributionDate: string;
  notes?: string;
  notifyHeirs?: boolean;
}

interface HeirShare {
  beneficiary_id: string;
  heir_type: string;
  share_amount: number;
  share_percentage: number;
  beneficiary_name?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'غير مصرح' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is nazer or admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'المستخدم غير موجود' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['nazer', 'admin'])
      .single();

    if (!userRole) {
      return new Response(
        JSON.stringify({ error: 'غير مصرح لك بتنفيذ التوزيع' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: DistributionRequest = await req.json();
    const { totalAmount, fiscalYearId, distributionDate, notes, notifyHeirs } = body;

    console.log(`[distribute-revenue] Starting distribution: ${totalAmount} SAR`);

    // Calculate shariah-based distribution
    const { data: heirShares, error: calcError } = await supabase
      .rpc('calculate_shariah_distribution', { p_total_amount: totalAmount });

    if (calcError) {
      console.error('[distribute-revenue] Calculation error:', calcError);
      return new Response(
        JSON.stringify({ error: 'خطأ في حساب التوزيع', details: calcError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[distribute-revenue] Calculated shares for ${heirShares?.length} heirs`);

    // Get beneficiary names
    const beneficiaryIds = heirShares.map((h: HeirShare) => h.beneficiary_id);
    const { data: beneficiaries } = await supabase
      .from('beneficiaries')
      .select('id, full_name, user_id')
      .in('id', beneficiaryIds);

    const beneficiaryMap = new Map(beneficiaries?.map(b => [b.id, b]) || []);

    // Create heir_distributions records
    const distributionRecords = heirShares.map((heir: HeirShare) => ({
      fiscal_year_id: fiscalYearId,
      beneficiary_id: heir.beneficiary_id,
      heir_type: heir.heir_type,
      share_amount: heir.share_amount,
      distribution_date: distributionDate,
      notes: notes || `توزيع غلة الوقف - ${new Date(distributionDate).toLocaleDateString('ar-SA')}`,
      is_historical: false,
    }));

    const { data: insertedDistributions, error: insertError } = await supabase
      .from('heir_distributions')
      .insert(distributionRecords)
      .select();

    if (insertError) {
      console.error('[distribute-revenue] Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'خطأ في إنشاء سجلات التوزيع', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[distribute-revenue] Created ${insertedDistributions?.length} distribution records`);

    // Create payment records for each heir
    const paymentRecords = heirShares.map((heir: HeirShare) => {
      const beneficiary = beneficiaryMap.get(heir.beneficiary_id);
      const distribution = insertedDistributions?.find(d => d.beneficiary_id === heir.beneficiary_id);
      return {
        payment_number: `PAY-${Date.now()}-${heir.beneficiary_id.substring(0, 8)}`,
        payment_date: distributionDate,
        payment_type: 'payment',
        amount: heir.share_amount,
        payment_method: 'bank_transfer',
        payer_name: 'الوقف',
        reference_type: 'distribution',
        reference_id: distribution?.id,
        status: 'completed',
        description: `حصة ${heir.heir_type} من توزيع غلة الوقف`,
      };
    });

    const { error: paymentError } = await supabase
      .from('payments')
      .insert(paymentRecords);

    if (paymentError) {
      console.error('[distribute-revenue] Payment insert error:', paymentError);
    }

    // Update beneficiary balances
    for (const heir of heirShares) {
      await supabase
        .from('beneficiaries')
        .update({
          total_received: supabase.rpc('increment_field', { 
            row_id: heir.beneficiary_id, 
            field_name: 'total_received', 
            increment_value: heir.share_amount 
          }),
          account_balance: supabase.rpc('increment_field', { 
            row_id: heir.beneficiary_id, 
            field_name: 'account_balance', 
            increment_value: heir.share_amount 
          }),
        })
        .eq('id', heir.beneficiary_id);
    }

    // Send notifications if requested
    if (notifyHeirs) {
      for (const heir of heirShares) {
        const beneficiary = beneficiaryMap.get(heir.beneficiary_id);
        if (beneficiary?.user_id) {
          await supabase.from('notifications').insert({
            user_id: beneficiary.user_id,
            title: 'تم صرف حصتك من توزيع الغلة',
            message: `تم إيداع مبلغ ${heir.share_amount.toLocaleString('ar-SA')} ر.س في حسابك`,
            type: 'distribution',
            action_url: '/beneficiary-portal',
          });
        }
      }
      console.log('[distribute-revenue] Notifications sent');
    }

    // Calculate summary
    const summary = {
      totalAmount,
      heirsCount: heirShares.length,
      wivesShare: heirShares
        .filter((h: HeirShare) => h.heir_type === 'زوجة')
        .reduce((sum: number, h: HeirShare) => sum + h.share_amount, 0),
      sonsShare: heirShares
        .filter((h: HeirShare) => h.heir_type === 'ابن')
        .reduce((sum: number, h: HeirShare) => sum + h.share_amount, 0),
      daughtersShare: heirShares
        .filter((h: HeirShare) => h.heir_type === 'بنت')
        .reduce((sum: number, h: HeirShare) => sum + h.share_amount, 0),
      distributions: heirShares.map((heir: HeirShare) => ({
        ...heir,
        beneficiary_name: beneficiaryMap.get(heir.beneficiary_id)?.full_name,
      })),
    };

    console.log('[distribute-revenue] Distribution completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم توزيع الغلة بنجاح',
        summary,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[distribute-revenue] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    return new Response(
      JSON.stringify({ error: 'حدث خطأ غير متوقع', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
