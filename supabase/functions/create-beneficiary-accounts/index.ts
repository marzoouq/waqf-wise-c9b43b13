import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // جلب المستفيدين المفعلين بدون حسابات
    const { data: beneficiaries, error: fetchError } = await supabaseAdmin
      .from('beneficiaries')
      .select('id, full_name, national_id, email')
      .eq('can_login', true)
      .is('user_id', null);

    if (fetchError) throw fetchError;

    const results = [];
    const errors = [];

    for (const beneficiary of beneficiaries || []) {
      try {
        // توليد البريد وكلمة المرور
        const internalEmail = `${beneficiary.national_id}@waqf.internal`;
        const tempPassword = `${beneficiary.national_id}@Waqf`;

        // إنشاء حساب Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: internalEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: beneficiary.full_name,
            national_id: beneficiary.national_id,
            beneficiary_id: beneficiary.id,
          },
        });

        if (authError) {
          // إذا كان الحساب موجوداً، نحاول تحديث كلمة المرور
          if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
            const { data: users } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = users.users.find(u => u.email === internalEmail);
            
            if (existingUser) {
              // تحديث كلمة المرور
              await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                password: tempPassword,
                email_confirm: true,
              });

              // تحديث beneficiaries table
              await supabaseAdmin
                .from('beneficiaries')
                .update({
                  user_id: existingUser.id,
                  email: internalEmail,
                  username: beneficiary.national_id,
                  login_enabled_at: new Date().toISOString(),
                })
                .eq('id', beneficiary.id);

              results.push({
                beneficiary_id: beneficiary.id,
                national_id: beneficiary.national_id,
                status: 'updated',
                user_id: existingUser.id,
              });
              continue;
            }
          }
          throw authError;
        }

        // تحديث beneficiaries table
        const { error: updateError } = await supabaseAdmin
          .from('beneficiaries')
          .update({
            user_id: authData.user?.id,
            email: internalEmail,
            username: beneficiary.national_id,
            login_enabled_at: new Date().toISOString(),
          })
          .eq('id', beneficiary.id);

        if (updateError) throw updateError;

        // إنشاء profile و role
        try {
          await supabaseAdmin.rpc('create_user_profile_and_role', {
            p_user_id: authData.user!.id,
            p_full_name: beneficiary.full_name,
            p_email: internalEmail,
            p_role: 'beneficiary'
          });
        } catch (roleError) {
          console.error('Error creating profile/role:', roleError);
        }

        results.push({
          beneficiary_id: beneficiary.id,
          national_id: beneficiary.national_id,
          status: 'created',
          user_id: authData.user?.id,
        });
      } catch (error) {
        errors.push({
          beneficiary_id: beneficiary.id,
          national_id: beneficiary.national_id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: beneficiaries?.length || 0,
        created: results.length,
        failed: errors.length,
        results,
        errors,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
