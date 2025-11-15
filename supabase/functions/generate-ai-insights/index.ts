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

    const { reportType, dataQuery, filters } = await req.json();

    // جمع البيانات المطلوبة
    let data;
    switch (reportType) {
      case 'beneficiaries':
        const { data: benData } = await supabase
          .from('beneficiary_statistics')
          .select('*')
          .limit(100);
        data = benData;
        break;
      case 'financial':
        const { data: finData } = await supabase
          .from('journal_entries')
          .select('*, journal_entry_lines(*)')
          .order('entry_date', { ascending: false })
          .limit(50);
        data = finData;
        break;
      case 'properties':
        const { data: propData } = await supabase
          .from('contracts')
          .select('*, properties(*), rental_payments(*)')
          .limit(50);
        data = propData;
        break;
      case 'loans':
        const { data: loanData } = await supabase
          .from('loans')
          .select('*, loan_installments(*), beneficiaries(full_name)')
          .limit(50);
        data = loanData;
        break;
      default:
        data = [];
    }

    // تقليل حجم البيانات للإرسال للـ AI
    const summaryData = data ? JSON.stringify(data.slice(0, 5)) : '[]';
    
    // التحقق من وجود API Key
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY is not set');
      throw new Error('API Key not configured');
    }

    console.log('Calling Lovable AI API...');
    
    // استخدام AI لتحليل البيانات
    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'أنت محلل بيانات خبير في إدارة الأوقاف. قم بتحليل البيانات المقدمة وقدم رؤى قيمة، اتجاهات، وتوصيات عملية. استخدم اللغة العربية واجعل التحليل واضحاً ومختصراً.'
          },
          {
            role: 'user',
            content: `قم بتحليل هذه البيانات الخاصة بـ ${reportType}:\n\nعدد السجلات: ${data?.length || 0}\nعينة من البيانات:\n${summaryData}\n\nقدم تحليلاً مختصراً (500 كلمة كحد أقصى) يتضمن:\n1. الملخص التنفيذي\n2. الاتجاهات الرئيسية\n3. التوصيات العملية`
          }
        ],
        max_tokens: 2000,
      }),
    });

    console.log('AI Response status:', aiResponse.status);
    
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received');
    
    const analysis = aiData.choices?.[0]?.message?.content || 'لم يتم إنشاء تحليل';

    // حفظ التقرير
    const { data: report } = await supabase
      .from('custom_reports')
      .insert({
        name: `تحليل ذكي - ${reportType} - ${new Date().toLocaleDateString('ar-SA')}`,
        description: 'تقرير تحليلي تم إنشاؤه بواسطة الذكاء الاصطناعي',
        report_type: 'ai',
        configuration: {
          analysis,
          dataSnapshot: data ? data.slice(0, 10) : [],
          generatedAt: new Date().toISOString(),
        },
        created_by: req.headers.get('user-id'),
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        reportId: report?.id,
        dataCount: data ? data.length : 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('AI Insights Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});