import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
    )

    const beneficiaries = [
      // المستفيدون الأصليون (5)
      { national_id: '1014548273', full_name: 'عبدالرحمن مرزوق علي الثبيتي', phone: '0501234567' },
      { national_id: '1014548257', full_name: 'فاطمه محمد سعد الشهراني', phone: '0501234568' },
      { national_id: '1050953866', full_name: 'امل السيد ابراهيم ابوالريش', phone: '0501234569' },
      { national_id: '1014548265', full_name: 'حنان مرزوق علي الثبيتي', phone: '0501234570' },
      { national_id: '1048839425', full_name: 'منى مرزوق علي الثبيتي', phone: '0501234571' },
      
      // مستفيدون إضافيون (14)
      { national_id: '1023456789', full_name: 'أحمد بن محمد العتيبي', phone: '0501234572' },
      { national_id: '1034567890', full_name: 'سارة بنت عبدالله القحطاني', phone: '0501234573' },
      { national_id: '1045678901', full_name: 'خالد بن سعد الدوسري', phone: '0501234574' },
      { national_id: '1056789012', full_name: 'نورة بنت علي المطيري', phone: '0501234575' },
      { national_id: '1067890123', full_name: 'محمد بن أحمد الشمري', phone: '0501234576' },
      { national_id: '1078901234', full_name: 'هند بنت خالد الحربي', phone: '0501234577' },
      { national_id: '1089012345', full_name: 'سلطان بن عبدالعزيز العنزي', phone: '0501234578' },
      { national_id: '1090123456', full_name: 'ريم بنت فهد السبيعي', phone: '0501234579' },
      { national_id: '1012345678', full_name: 'فيصل بن ناصر الغامدي', phone: '0501234580' },
      { national_id: '1023456780', full_name: 'لطيفة بنت سليمان الزهراني', phone: '0501234581' },
      { national_id: '1034567891', full_name: 'بدر بن راشد القرني', phone: '0501234582' },
      { national_id: '1045678902', full_name: 'جواهر بنت مشعل اليامي', phone: '0501234583' },
      { national_id: '1056789013', full_name: 'طلال بن عبيد الحارثي', phone: '0501234584' },
      { national_id: '1067890124', full_name: 'شهد بنت تركي البقمي', phone: '0501234585' },
    ]

    const results = []
    const password = 'Test@123456'

    for (const ben of beneficiaries) {
      const email = `${ben.national_id}@waqf.internal`
      
      // حذف المستخدم القديم إن وجد
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
      const oldUser = existingUser?.users?.find(u => u.email === email)
      
      if (oldUser) {
        await supabaseAdmin.auth.admin.deleteUser(oldUser.id)
      }

      // إنشاء مستخدم جديد
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: ben.full_name,
          national_id: ben.national_id
        }
      })

      if (authError) {
        results.push({ national_id: ben.national_id, success: false, error: authError.message })
        continue
      }

      // تحديث/إنشاء المستفيد
      const { data: existingBen } = await supabaseAdmin
        .from('beneficiaries')
        .select('id')
        .eq('national_id', ben.national_id)
        .maybeSingle()

      if (existingBen) {
        // تحديث المستفيد الموجود
        await supabaseAdmin
          .from('beneficiaries')
          .update({
            user_id: authData.user.id,
            email,
            can_login: true,
            login_enabled_at: new Date().toISOString(),
            verification_status: 'موثق'
          })
          .eq('national_id', ben.national_id)
      } else {
        // إنشاء مستفيد جديد
        await supabaseAdmin
          .from('beneficiaries')
          .insert({
            full_name: ben.full_name,
            national_id: ben.national_id,
            email,
            phone: ben.phone,
            category: 'عائلة',
            status: 'نشط',
            user_id: authData.user.id,
            can_login: true,
            login_enabled_at: new Date().toISOString(),
            verification_status: 'موثق'
          })
      }

      // إضافة دور المستفيد (تجاهل إذا كان موجوداً)
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: authData.user.id,
          role: 'beneficiary'
        }, {
          onConflict: 'user_id,role',
          ignoreDuplicates: true
        })

      results.push({ 
        national_id: ben.national_id, 
        success: true, 
        email,
        user_id: authData.user.id 
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: 'تم إنشاء حسابات المستفيدين التجريبية بنجاح'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
