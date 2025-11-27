import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  handleCors, 
  jsonResponse, 
  errorResponse 
} from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🔔 بدء تشغيل الإشعارات الدورية اليومية...');

    // تحديث الطلبات المتأخرة
    console.log('📋 فحص الطلبات المتأخرة...');
    const { error: overdueError } = await supabase.rpc('check_overdue_requests');
    
    if (overdueError) {
      console.error('❌ خطأ في تحديث الطلبات المتأخرة:', overdueError);
    } else {
      console.log('✅ تم تحديث الطلبات المتأخرة');
    }

    // تشغيل دالة إشعارات دفعات الإيجار المستحقة
    console.log('📋 فحص دفعات الإيجار المستحقة...');
    const { error: rentalError } = await supabase.rpc('notify_rental_payment_due');
    
    if (rentalError) {
      console.error('❌ خطأ في إشعارات دفعات الإيجار:', rentalError);
      throw rentalError;
    }
    console.log('✅ تم إرسال إشعارات دفعات الإيجار');

    // تشغيل دالة إشعارات العقود القريبة من الانتهاء
    console.log('📋 فحص العقود القريبة من الانتهاء...');
    const { error: contractError } = await supabase.rpc('notify_contract_expiring');
    
    if (contractError) {
      console.error('❌ خطأ في إشعارات العقود:', contractError);
      throw contractError;
    }
    console.log('✅ تم إرسال إشعارات العقود');

    // عد الإشعارات الجديدة المرسلة اليوم
    const today = new Date().toISOString().split('T')[0];
    const { count, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`);

    if (countError) {
      console.error('⚠️ خطأ في عد الإشعارات:', countError);
    }

    const result = {
      success: true,
      message: 'تم إرسال الإشعارات اليومية بنجاح',
      timestamp: new Date().toISOString(),
      notificationsToday: count || 0,
    };

    console.log('🎉 اكتمل تشغيل الإشعارات الدورية:', result);

    return jsonResponse(result);

  } catch (error) {
    console.error('💥 خطأ في تشغيل الإشعارات الدورية:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      500
    );
  }
});
