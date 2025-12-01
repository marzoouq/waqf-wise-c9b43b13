import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, extractionType = 'contract' } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'النص مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'خطأ في الإعدادات' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt = "";
    let tools: any[] = [];

    if (extractionType === 'contract') {
      systemPrompt = `أنت مساعد ذكي متخصص في استخراج بيانات العقود العقارية من النصوص العربية.
قم بتحليل النص المعطى واستخراج جميع البيانات المتعلقة بالعقد بدقة.
إذا لم تجد معلومة معينة، أرجع null لها.
التواريخ يجب أن تكون بصيغة YYYY-MM-DD.
المبالغ المالية يجب أن تكون أرقام فقط بدون فواصل أو رموز.`;

      tools = [{
        type: "function",
        function: {
          name: "extract_contract_data",
          description: "استخراج بيانات عقد الإيجار من النص",
          parameters: {
            type: "object",
            properties: {
              contract_number: { type: "string", description: "رقم العقد" },
              tenant_name: { type: "string", description: "اسم المستأجر الكامل" },
              tenant_id_number: { type: "string", description: "رقم الهوية أو السجل التجاري" },
              tenant_phone: { type: "string", description: "رقم جوال المستأجر" },
              tenant_email: { type: ["string", "null"], description: "البريد الإلكتروني" },
              contract_type: { 
                type: "string", 
                enum: ["سكني", "تجاري", "مكتبي", "صناعي"],
                description: "نوع العقد" 
              },
              start_date: { type: "string", description: "تاريخ بداية العقد بصيغة YYYY-MM-DD" },
              end_date: { type: "string", description: "تاريخ نهاية العقد بصيغة YYYY-MM-DD" },
              monthly_rent: { type: "number", description: "قيمة الإيجار الشهري" },
              annual_rent: { type: "number", description: "قيمة الإيجار السنوي" },
              security_deposit: { type: ["number", "null"], description: "مبلغ التأمين" },
              payment_frequency: { 
                type: "string",
                enum: ["شهري", "ربع سنوي", "نصف سنوي", "سنوي"],
                description: "تكرار الدفع" 
              },
              is_renewable: { type: "boolean", description: "هل العقد قابل للتجديد" },
              units_count: { type: ["number", "null"], description: "عدد الوحدات" },
              property_name: { type: ["string", "null"], description: "اسم العقار إن وجد" },
              property_location: { type: ["string", "null"], description: "موقع العقار" },
              terms_and_conditions: { type: ["string", "null"], description: "الشروط والأحكام" },
              notes: { type: ["string", "null"], description: "ملاحظات إضافية" }
            },
            required: ["tenant_name", "tenant_id_number", "tenant_phone", "contract_type", "start_date", "end_date"],
            additionalProperties: false
          }
        }
      }];
    } else if (extractionType === 'property') {
      systemPrompt = `أنت مساعد ذكي متخصص في استخراج بيانات العقارات من النصوص العربية.
قم بتحليل النص المعطى واستخراج جميع البيانات المتعلقة بالعقار بدقة.
إذا لم تجد معلومة معينة، أرجع null لها.`;

      tools = [{
        type: "function",
        function: {
          name: "extract_property_data",
          description: "استخراج بيانات العقار من النص",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "اسم العقار" },
              type: { 
                type: "string",
                enum: ["سكني", "تجاري", "سكني تجاري", "صناعي", "إداري", "زراعي"],
                description: "نوع العقار" 
              },
              location: { type: "string", description: "موقع العقار (المدينة والحي)" },
              units: { type: "number", description: "عدد الوحدات الكلي" },
              occupied: { type: ["number", "null"], description: "عدد الوحدات المشغولة" },
              monthly_revenue: { type: ["number", "null"], description: "الإيراد الشهري المتوقع" },
              status: { 
                type: "string",
                enum: ["نشط", "معلق", "قيد الصيانة", "متاح للإيجار"],
                description: "حالة العقار" 
              },
              description: { type: ["string", "null"], description: "وصف العقار" },
              tax_percentage: { type: ["number", "null"], description: "نسبة الضريبة %" },
              shop_count: { type: ["number", "null"], description: "عدد المحلات" },
              apartment_count: { type: ["number", "null"], description: "عدد الشقق" },
              revenue_type: { 
                type: "string",
                enum: ["شهري", "سنوي"],
                description: "نوع الإيراد" 
              }
            },
            required: ["name", "type", "location", "units"],
            additionalProperties: false
          }
        }
      }];
    }

    console.log(`استدعاء Lovable AI لاستخراج بيانات ${extractionType}...`);
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `قم بتحليل النص التالي واستخراج البيانات:\n\n${text}` }
        ],
        tools: tools,
        tool_choice: { type: "function", function: { name: tools[0].function.name } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("خطأ في Lovable AI:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "يرجى إضافة رصيد لحساب Lovable AI." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'خطأ في معالجة البيانات' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await aiResponse.json();
    console.log("استجابة الذكاء الاصطناعي:", JSON.stringify(result, null, 2));

    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("لم يتم العثور على استدعاء الأداة في الاستجابة");
      return new Response(
        JSON.stringify({ error: 'فشل في استخراج البيانات' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    console.log("البيانات المستخرجة:", extractedData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData,
        extractionType 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("خطأ في معالجة الطلب:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'خطأ غير متوقع' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
