import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 🔐 SECURITY: Generate secure random password
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(x => chars[x % chars.length]).join('') + '@Waqf';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 🔐 SECURITY: Verify Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'غير مصرح - يجب تسجيل الدخول' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

    // 🔐 SECURITY: Extract and verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Invalid token:', authError);
      return new Response(
        JSON.stringify({ error: 'رمز المصادقة غير صحيح' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 🔐 SECURITY: Check if user has admin or nazer role
    const { data: roles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('❌ Error checking roles:', roleError);
      return new Response(
        JSON.stringify({ error: 'خطأ في التحقق من الصلاحيات' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hasPermission = roles?.some(r => ['admin', 'nazer'].includes(r.role));
    if (!hasPermission) {
      console.error('❌ User lacks required permissions:', { userId: user.id, roles });
      
      // 📝 Audit log: Unauthorized access attempt
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        table_name: 'beneficiaries',
        severity: 'warning',
        description: 'محاولة غير مصرح بها لإنشاء حسابات مستفيدين',
        ip_address: req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP'),
        user_agent: req.headers.get('User-Agent')
      });

      return new Response(
        JSON.stringify({ error: 'ليس لديك صلاحية لتنفيذ هذه العملية' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Authorized user creating beneficiary accounts:', { 
      userId: user.id,
      email: user.email 
    });

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
        // 🔐 SECURITY: Use secure random password generation
        const internalEmail = `${beneficiary.national_id}@waqf.internal`;
        const tempPassword = generateSecurePassword();

        console.log('🔐 Creating account with secure password for:', beneficiary.national_id);

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
              // تحديث كلمة المرور بكلمة مرور آمنة جديدة
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

              // 📝 Audit log
              await supabaseAdmin.from('audit_logs').insert({
                user_id: user.id,
                user_email: user.email,
                action_type: 'BENEFICIARY_ACCOUNT_UPDATED',
                table_name: 'beneficiaries',
                record_id: beneficiary.id,
                severity: 'info',
                description: `تم تحديث حساب المستفيد: ${beneficiary.full_name}`,
                new_values: { beneficiary_id: beneficiary.id, user_id: existingUser.id }
              });

              results.push({
                beneficiary_id: beneficiary.id,
                national_id: beneficiary.national_id,
                status: 'updated',
                user_id: existingUser.id,
                password: tempPassword, // للعرض مرة واحدة
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

        // 📝 Audit log
        await supabaseAdmin.from('audit_logs').insert({
          user_id: user.id,
          user_email: user.email,
          action_type: 'BENEFICIARY_ACCOUNT_CREATED',
          table_name: 'beneficiaries',
          record_id: beneficiary.id,
          severity: 'info',
          description: `تم إنشاء حساب للمستفيد: ${beneficiary.full_name}`,
          new_values: { beneficiary_id: beneficiary.id, user_id: authData.user?.id }
        });

        results.push({
          beneficiary_id: beneficiary.id,
          national_id: beneficiary.national_id,
          status: 'created',
          user_id: authData.user?.id,
          password: tempPassword, // للعرض مرة واحدة
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
    console.error('❌ Error in create-beneficiary-accounts:', error);
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
