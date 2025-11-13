import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 بدء تشغيل نظام الإشعارات اليومية...');

    // 1. إرسال إشعارات الفواتير المتأخرة
    console.log('📧 إرسال إشعارات الفواتير المتأخرة...');
    const { error: invoicesError } = await supabase.rpc('notify_overdue_invoices');
    
    if (invoicesError) {
      console.error('❌ خطأ في إرسال إشعارات الفواتير:', invoicesError);
    } else {
      console.log('✅ تم إرسال إشعارات الفواتير المتأخرة');
    }

    // 2. إرسال إشعارات الأقساط المتأخرة
    console.log('💰 إرسال إشعارات الأقساط المتأخرة...');
    const { error: installmentsError } = await supabase.rpc('notify_overdue_loan_installments');
    
    if (installmentsError) {
      console.error('❌ خطأ في إرسال إشعارات الأقساط:', installmentsError);
    } else {
      console.log('✅ تم إرسال إشعارات الأقساط المتأخرة');
    }

    // 3. إرسال إشعارات العقود القريبة من الانتهاء
    console.log('📄 إرسال إشعارات العقود القريبة من الانتهاء...');
    const { error: contractsError } = await supabase.rpc('notify_contract_expiring');
    
    if (contractsError) {
      console.error('❌ خطأ في إرسال إشعارات العقود:', contractsError);
    } else {
      console.log('✅ تم إرسال إشعارات العقود');
    }

    // 4. إرسال إشعارات دفعات الإيجار المستحقة
    console.log('🏠 إرسال إشعارات دفعات الإيجار...');
    const { error: rentalsError } = await supabase.rpc('notify_rental_payment_due');
    
    if (rentalsError) {
      console.error('❌ خطأ في إرسال إشعارات الإيجارات:', rentalsError);
    } else {
      console.log('✅ تم إرسال إشعارات الإيجارات');
    }

    // 5. تحديث حالة الأقساط المتأخرة
    console.log('🔄 تحديث حالة الأقساط المتأخرة...');
    const { error: updateError } = await supabase.rpc('update_overdue_installments');
    
    if (updateError) {
      console.error('❌ خطأ في تحديث الأقساط:', updateError);
    } else {
      console.log('✅ تم تحديث حالة الأقساط');
    }

    // 6. تحديث حالة الطلبات المتأخرة
    console.log('📝 تحديث حالة الطلبات المتأخرة...');
    const { error: requestsError } = await supabase.rpc('check_overdue_requests');
    
    if (requestsError) {
      console.error('❌ خطأ في تحديث الطلبات:', requestsError);
    } else {
      console.log('✅ تم تحديث حالة الطلبات');
    }

    // 7. تحديث Materialized Views للتقارير
    console.log('📊 تحديث التقارير المالية...');
    const { error: viewsError } = await supabase.rpc('refresh_financial_views');
    
    if (viewsError) {
      console.error('❌ خطأ في تحديث التقارير:', viewsError);
    } else {
      console.log('✅ تم تحديث التقارير المالية');
    }

    // 8. تنظيف الإشعارات القديمة
    console.log('🧹 تنظيف الإشعارات القديمة...');
    const { data: deletedCount, error: cleanupError } = await supabase.rpc('archive_old_notifications');
    
    if (cleanupError) {
      console.error('❌ خطأ في التنظيف:', cleanupError);
    } else {
      console.log(`✅ تم حذف ${deletedCount} إشعار قديم`);
    }

    console.log('🎉 اكتمل تشغيل نظام الإشعارات اليومية بنجاح');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم تنفيذ جميع المهام اليومية بنجاح',
        results: {
          invoices: !invoicesError,
          installments: !installmentsError,
          contracts: !contractsError,
          rentals: !rentalsError,
          updates: !updateError && !requestsError,
          reports: !viewsError,
          cleanup: !cleanupError,
          deletedNotifications: deletedCount || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ خطأ عام:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
