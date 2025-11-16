import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, userId, quickReplyId } = await req.json();

    console.log('📨 Chatbot request:', { message, userId, quickReplyId });

    // جلب البيانات السياقية حسب نوع السؤال
    let contextData: any = {};
    
    // البحث في نوع الاستفسار
    const messageText = message.toLowerCase();
    
    if (quickReplyId === 'balance' || messageText.includes('رصيد') || messageText.includes('مستفيد')) {
      const { data: beneficiaries, count } = await supabase
        .from('beneficiaries')
        .select('status, category, monthly_income', { count: 'exact' })
        .eq('status', 'active')
        .limit(100);
      
      contextData.beneficiaries = {
        total: count || 0,
        active: beneficiaries?.filter(b => b.status === 'active').length || 0,
        categories: beneficiaries?.reduce((acc: any, b) => {
          acc[b.category] = (acc[b.category] || 0) + 1;
          return acc;
        }, {})
      };
    }
    
    if (quickReplyId === 'reports' || messageText.includes('تقرير') || messageText.includes('مالي')) {
      const { data: entries } = await supabase
        .from('journal_entries')
        .select('entry_date, reference, status, journal_entry_lines(debit_amount, credit_amount)')
        .order('entry_date', { ascending: false })
        .limit(20);
      
      let totalDebits = 0;
      let totalCredits = 0;
      
      entries?.forEach(entry => {
        entry.journal_entry_lines?.forEach((line: any) => {
          totalDebits += line.debit_amount || 0;
          totalCredits += line.credit_amount || 0;
        });
      });
      
      contextData.financial = {
        recentEntries: entries?.length || 0,
        totalDebits,
        totalCredits,
        balance: totalDebits - totalCredits
      };
    }
    
    if (quickReplyId === 'properties' || messageText.includes('عقار') || messageText.includes('إيجار')) {
      const { data: properties, count } = await supabase
        .from('properties')
        .select('status, property_type, contracts(status, monthly_rent)', { count: 'exact' });
      
      const occupied = properties?.filter(p => p.status === 'occupied').length || 0;
      const vacant = properties?.filter(p => p.status === 'vacant').length || 0;
      const totalRent = properties?.reduce((sum, p) => {
        const activeContract = p.contracts?.find((c: any) => c.status === 'active');
        return sum + (activeContract?.monthly_rent || 0);
      }, 0) || 0;
      
      contextData.properties = {
        total: count || 0,
        occupied,
        vacant,
        monthlyRentIncome: totalRent
      };
    }
    
    if (quickReplyId === 'requests' || messageText.includes('طلب')) {
      const { data: requests, count } = await supabase
        .from('beneficiary_requests')
        .select('status, priority, request_type_id, amount', { count: 'exact' })
        .eq('status', 'pending');
      
      const highPriority = requests?.filter(r => r.priority === 'high').length || 0;
      const totalAmount = requests?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      
      contextData.requests = {
        pending: count || 0,
        highPriority,
        totalAmount
      };
    }
    
    if (quickReplyId === 'distributions' || messageText.includes('توزيع')) {
      const { data: distributions } = await supabase
        .from('distributions')
        .select('distribution_date, total_amount, beneficiaries_count, status')
        .order('distribution_date', { ascending: false })
        .limit(10);
      
      contextData.distributions = {
        recent: distributions?.slice(0, 5).map(d => ({
          date: d.distribution_date,
          amount: d.total_amount,
          beneficiaries: d.beneficiaries_count,
          status: d.status
        })),
        totalDistributions: distributions?.length || 0
      };
    }

    // التحقق من وجود LOVABLE_API_KEY
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // إعداد System Prompt
    const systemPrompt = `أنت مساعد ذكي متخصص في إدارة الأوقاف الإسلامية. 
مهمتك مساعدة الإدارة والموظفين في:
- تحليل البيانات المالية والإحصائية بدقة
- الإجابة على الأسئلة حول المستفيدين والعقارات والطلبات
- تقديم توصيات عملية ومدروسة بناءً على البيانات المتاحة
- مساعدة في اتخاذ القرارات الإدارية

قواعد مهمة:
1. استخدم اللغة العربية الفصحى بأسلوب واضح ومباشر
2. كن مختصراً ومفيداً (150-250 كلمة كحد أقصى)
3. قدم الأرقام والإحصائيات بتنسيق واضح
4. استخدم الإيموجي بشكل مناسب ولكن لا تكثر منها
5. إذا لم تكن لديك بيانات كافية، أخبر المستخدم بذلك بوضوح ولا تخمن
6. قدم معلومات دقيقة فقط بناءً على البيانات المتوفرة
7. نسق الأرقام المالية بشكل واضح (استخدم الفواصل)`;

    console.log('🤖 Sending to AI with context:', Object.keys(contextData));

    // إرسال الطلب إلى Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `${message}\n\n===البيانات المتاحة للتحليل===\n${JSON.stringify(contextData, null, 2)}`
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ AI API Error:', errorText);
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const botResponse = aiData.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة على سؤالك.';

    console.log('✅ AI Response received');

    // حفظ المحادثة في قاعدة البيانات
    const { error: insertError } = await supabase.from('chatbot_conversations').insert([
      { 
        user_id: userId, 
        message, 
        message_type: 'user', 
        quick_reply_id: quickReplyId,
        context: contextData 
      },
      { 
        user_id: userId, 
        message: botResponse, 
        response: botResponse, 
        message_type: 'bot' 
      }
    ]);

    if (insertError) {
      console.error('⚠️ Error saving conversation:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: botResponse,
        contextDataSummary: {
          beneficiariesCount: contextData.beneficiaries?.total || 0,
          hasFinancialData: !!contextData.financial,
          propertiesCount: contextData.properties?.total || 0,
          pendingRequestsCount: contextData.requests?.pending || 0,
          recentDistributions: contextData.distributions?.totalDistributions || 0,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('💥 Chatbot Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
