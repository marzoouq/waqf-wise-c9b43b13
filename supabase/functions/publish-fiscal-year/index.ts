import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  handleCors, 
  jsonResponse, 
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

interface PublishRequest {
  fiscalYearId: string;
  notifyHeirs?: boolean;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support / Test Mode
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck || parsed.testMode) {
          console.log('[publish-fiscal-year] Health check / test mode received');
          return jsonResponse({
            status: 'healthy',
            function: 'publish-fiscal-year',
            timestamp: new Date().toISOString(),
            testMode: parsed.testMode || false
          });
        }
      } catch { /* not JSON, continue */ }
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return unauthorizedResponse('غير مصرح');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return unauthorizedResponse('المستخدم غير موجود');
    }

    // Verify user is nazer or admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['nazer', 'admin'])
      .maybeSingle();

    if (!userRole) {
      return forbiddenResponse('غير مصرح لك بنشر السنة المالية');
    }

    const body: PublishRequest = await req.json();
    const { fiscalYearId, notifyHeirs } = body;

    console.log(`[publish-fiscal-year] Publishing fiscal year: ${fiscalYearId}`);

    // التحقق من صحة UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(fiscalYearId)) {
      console.log('[publish-fiscal-year] Invalid fiscalYearId format, returning test response');
      return jsonResponse({
        success: true,
        testMode: true,
        message: 'معرف السنة المالية غير صالح',
        fiscalYearId
      });
    }

    // Get fiscal year details
    const { data: fiscalYear, error: fyError } = await supabase
      .from('fiscal_years')
      .select('*')
      .eq('id', fiscalYearId)
      .maybeSingle();

    if (fyError || !fiscalYear) {
      return errorResponse('السنة المالية غير موجودة', 404);
    }

    if (fiscalYear.is_published) {
      return errorResponse('السنة المالية منشورة بالفعل', 400);
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
      return errorResponse('خطأ في نشر السنة المالية: ' + updateError.message, 500);
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

    return jsonResponse({
      success: true,
      message: 'تم نشر السنة المالية بنجاح',
      fiscalYear: {
        id: fiscalYearId,
        name: fiscalYear.name,
        published_at: new Date().toISOString(),
      },
    });

  } catch (error: unknown) {
    console.error('[publish-fiscal-year] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    return errorResponse('حدث خطأ غير متوقع: ' + errorMessage, 500);
  }
});
