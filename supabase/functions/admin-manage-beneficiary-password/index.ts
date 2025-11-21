import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    
    // إنشاء عميل Supabase بصلاحيات Service Role للوصول الكامل
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { action, beneficiaryId, nationalId, newPassword } = await req.json();

    console.log('Admin manage password request:', { action, beneficiaryId, nationalId });

    if (action === 'reset-password') {
      // التحقق من وجود المستفيد
      const { data: beneficiary, error: beneficiaryError } = await supabaseAdmin
        .from('beneficiaries')
        .select('id, national_id, user_id, full_name')
        .eq('id', beneficiaryId)
        .single();

      if (beneficiaryError || !beneficiary) {
        console.error('Beneficiary not found:', beneficiaryError);
        return new Response(
          JSON.stringify({ error: 'المستفيد غير موجود' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!beneficiary.user_id) {
        return new Response(
          JSON.stringify({ error: 'المستفيد لا يملك حساب مفعل' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // تحديث كلمة المرور مباشرة باستخدام Admin API
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        beneficiary.user_id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Error updating password:', updateError);
        return new Response(
          JSON.stringify({ error: 'فشل تحديث كلمة المرور: ' + updateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Password updated successfully for user:', beneficiary.user_id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'تم تحديث كلمة المرور بنجاح',
          beneficiary: {
            id: beneficiary.id,
            full_name: beneficiary.full_name,
            national_id: beneficiary.national_id
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'عملية غير معروفة' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-manage-beneficiary-password:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});