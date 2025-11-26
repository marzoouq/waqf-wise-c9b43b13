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
      { national_id: '1014548273', full_name: 'عبدالرحمن مرزوق علي الثبيتي', phone: '0501234567' },
      { national_id: '1014548257', full_name: 'فاطمه محمد سعد الشهراني', phone: '0501234568' },
      { national_id: '1050953866', full_name: 'امل السيد ابراهيم ابوالريش', phone: '0501234569' },
      { national_id: '1014548265', full_name: 'حنان مرزوق علي الثبيتي', phone: '0501234570' },
      { national_id: '1048839425', full_name: 'منى مرزوق علي الثبيتي', phone: '0501234571' },
      { national_id: '1048839417', full_name: 'هدى مرزوق علي الثبيتي', phone: '0501234572' },
      { national_id: '1014548331', full_name: 'فاطمه مرزوق علي الثبيتي', phone: '0501234573' },
      { national_id: '1014548315', full_name: 'سلوى مرزوق علي الثبيتي', phone: '0501234574' },
      { national_id: '1014548281', full_name: 'عفاف مرزوق علي الثبيتي', phone: '0501234575' },
      { national_id: '1014548323', full_name: 'امل مرزوق علي الثبيتي', phone: '0501234576' },
      { national_id: '1014548307', full_name: 'ماجد ابن مرزوق ابن علي الثبيتي', phone: '0501234577' },
      { national_id: '1086970629', full_name: 'محمد مرزوق علي الثبيتي', phone: '0501234578' },
      { national_id: '1014548349', full_name: 'عبدالله مرزوق علي الثبيتي', phone: '0501234579' },
      { national_id: '1014548299', full_name: 'عبدالعزيز مرزوق علي الثبيتي', phone: '0501234580' },
    ]

    const results = []
    const password = 'Test@123456'

    console.log('🧹 تنظيف البيانات القديمة...')
    
    // Step 1: حذف جميع المستخدمين في auth.users الذين لديهم emails مثل @waqf.internal
    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers()
    const waqfUsers = allUsers?.users?.filter(u => u.email?.includes('@waqf.internal')) || []
    
    console.log(`🗑️ حذف ${waqfUsers.length} مستخدم من auth.users`)
    for (const user of waqfUsers) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (error) {
        console.error(`❌ فشل حذف ${user.email}: ${error.message}`)
      }
    }
    
    // Step 2: حذف الأدوار القديمة المرتبطة بالمستفيدين
    const nationalIds = beneficiaries.map(b => b.national_id)
    const { error: roleDeleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .in('user_id', waqfUsers.map(u => u.id))
    
    if (roleDeleteError) {
      console.error(`❌ خطأ في حذف الأدوار: ${roleDeleteError.message}`)
    }

    // Step 3: تحديث beneficiaries لإزالة الربط مع المستخدمين المحذوفين
    const { error: unlinkError } = await supabaseAdmin
      .from('beneficiaries')
      .update({ 
        user_id: null,
        can_login: false,
        login_enabled_at: null
      })
      .in('national_id', nationalIds)
    
    if (unlinkError) {
      console.error(`❌ خطأ في فك الربط: ${unlinkError.message}`)
    }

    console.log('✅ تم تنظيف البيانات القديمة')

    // Step 4: إنشاء المستخدمين الجدد
    console.log('\n📝 إنشاء المستخدمين الجدد...\n')
    
    for (const ben of beneficiaries) {
      const email = `${ben.national_id}@waqf.internal`
      console.log(`🔧 معالجة: ${ben.full_name} (${ben.national_id})`)
      
      try {
        // إنشاء مستخدم جديد في auth.users
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
          console.error(`  ❌ فشل إنشاء المصادقة: ${authError.message}`)
          results.push({ 
            national_id: ben.national_id, 
            success: false, 
            error: authError.message 
          })
          continue
        }

        console.log(`  ✅ تم إنشاء حساب المصادقة: ${authData.user.id}`)

        // تحديث/إنشاء المستفيد في جدول beneficiaries
        const { data: existingBen } = await supabaseAdmin
          .from('beneficiaries')
          .select('id')
          .eq('national_id', ben.national_id)
          .maybeSingle()

        if (existingBen) {
          console.log(`  📝 تحديث بيانات المستفيد الموجود`)
          const { error: updateError } = await supabaseAdmin
            .from('beneficiaries')
            .update({
              full_name: ben.full_name,
              phone: ben.phone,
              email,
              user_id: authData.user.id,
              can_login: true,
              login_enabled_at: new Date().toISOString(),
              verification_status: 'موثق'
            })
            .eq('national_id', ben.national_id)
          
          if (updateError) {
            console.error(`  ❌ فشل تحديث المستفيد: ${updateError.message}`)
            
            // حذف المستخدم الذي تم إنشاؤه
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            
            results.push({ 
              national_id: ben.national_id, 
              success: false, 
              error: updateError.message 
            })
            continue
          }
        } else {
          console.log(`  ➕ إنشاء مستفيد جديد`)
          const { error: insertError } = await supabaseAdmin
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
          
          if (insertError) {
            console.error(`  ❌ فشل إنشاء المستفيد: ${insertError.message}`)
            
            // حذف المستخدم الذي تم إنشاؤه
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            
            results.push({ 
              national_id: ben.national_id, 
              success: false, 
              error: insertError.message 
            })
            continue
          }
        }

        // إضافة دور المستفيد في user_roles
        console.log(`  👤 إضافة دور المستفيد`)
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'beneficiary'
          })

        if (roleError && !roleError.message.includes('duplicate')) {
          console.error(`  ⚠️ تحذير عند إضافة الدور: ${roleError.message}`)
        }

        console.log(`  ✅ اكتمل بنجاح: ${ben.full_name}\n`)
        results.push({ 
          national_id: ben.national_id, 
          success: true, 
          email,
          user_id: authData.user.id 
        })
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'خطأ غير متوقع'
        console.error(`  ❌ خطأ عام: ${errorMessage}\n`)
        results.push({ 
          national_id: ben.national_id, 
          success: false, 
          error: errorMessage 
        })
      }
    }
    
    console.log('🎉 انتهت عملية الإعداد')

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
