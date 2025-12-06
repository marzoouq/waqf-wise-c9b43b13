import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PublishRequest {
  fiscalYearId: string;
  notifyHeirs?: boolean;
}

Deno.serve(async (req) => {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'المستخدم غير موجود' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is nazer or admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['nazer', 'admin'])
      .single();

    if (!userRole) {
      return new Response(
        JSON.stringify({ error: 'غير مصرح لك بنشر السنة المالية' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: PublishRequest = await req.json();
    const { fiscalYearId, notifyHeirs } = body;

    console.log(`[publish-fiscal-year] Publishing fiscal year: ${fiscalYearId}`);

    // Get fiscal year details
    const { data: fiscalYear, error: fyError } = await supabase
      .from('fiscal_years')
      .select('*')
      .eq('id', fiscalYearId)
      .single();

    if (fyError || !fiscalYear) {
      return new Response(
        JSON.stringify({ error: 'السنة المالية غير موجودة' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (fiscalYear.is_published) {
      return new Response(
        JSON.stringify({ error: 'السنة المالية منشورة بالفعل' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update fiscal year to published
    const { error: updateError } = await supabase
      .from('fiscal_years')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        published_by: user.id,
      })
      .eq('id', fiscalYearId);

    if (updateError) {
      console.error('[publish-fiscal-year] Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'خطأ في نشر السنة المالية', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[publish-fiscal-year] Fiscal year marked as published');

    // Send notifications to heirs if requested
    if (notifyHeirs) {
      const { data: heirs } = await supabase
        .from('beneficiaries')
        .select('user_id, full_name')
        .eq('status', 'نشط')
        .not('user_id', 'is', null);

      for (const heir of heirs || []) {
        await supabase.from('notifications').insert({
          user_id: heir.user_id,
          title: 'تم نشر السنة المالية',
          message: `تم نشر تفاصيل السنة المالية ${fiscalYear.name}. يمكنك الآن الاطلاع على جميع التفاصيل المالية.`,
          type: 'info',
          action_url: '/beneficiary-portal',
        });
      }
      console.log(`[publish-fiscal-year] Sent notifications to ${heirs?.length} heirs`);
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      action_type: 'publish_fiscal_year',
      table_name: 'fiscal_years',
      record_id: fiscalYearId,
      user_id: user.id,
      user_email: user.email,
      description: `نشر السنة المالية ${fiscalYear.name}`,
      new_values: { is_published: true, published_at: new Date().toISOString() },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم نشر السنة المالية بنجاح',
        fiscalYear: {
          id: fiscalYearId,
          name: fiscalYear.name,
          published_at: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[publish-fiscal-year] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    return new Response(
      JSON.stringify({ error: 'حدث خطأ غير متوقع', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
