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
    // التحقق من JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من الصلاحيات - يجب أن يكون أرشيفي أو مسؤول
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAccess = roles?.some(r => ['admin', 'nazer', 'archivist'].includes(r.role));
    
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Archivist or Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { documentId, attachmentId, fileUrl } = await req.json();

    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    // تحديث حالة المعالجة
    const processingStart = Date.now();
    const { data: logData } = await supabase
      .from('ocr_processing_log')
      .insert({
        document_id: documentId,
        attachment_id: attachmentId,
        status: 'processing',
        processed_by: req.headers.get('user-id'),
      })
      .select()
      .single();

    // تحميل الملف
    const fileResponse = await fetch(fileUrl);
    const fileBlob = await fileResponse.blob();
    const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(await fileBlob.arrayBuffer())));

    // استخدام Lovable AI لـ OCR
    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'استخرج كل النص من هذه الصورة/المستند بدقة عالية. قدم النص فقط بدون أي تعليقات إضافية.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${fileBlob.type};base64,${fileBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('OCR processing failed');
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices[0]?.message?.content || '';
    const processingTime = Date.now() - processingStart;

    // تحديث النتيجة
    await supabase
      .from('ocr_processing_log')
      .update({
        status: 'completed',
        extracted_text: extractedText,
        confidence_score: 0.95,
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString(),
      })
      .eq('id', logData.id);

    // حفظ النص في المستند أو المرفق
    if (documentId) {
      await supabase
        .from('documents')
        .update({ description: (await supabase.from('documents').select('description').eq('id', documentId).single()).data?.description + '\n\n[نص مستخرج]: ' + extractedText })
        .eq('id', documentId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        extractedText,
        processingTime,
        logId: logData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('OCR Error:', error);
    
    // تسجيل تفاصيل كاملة للمطورين
    console.error('Full error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // رسالة آمنة للعميل
    let safeMessage = 'حدث خطأ أثناء معالجة المستند';
    
    if (error instanceof Error) {
      if (error.message.includes('authorization') || error.message.includes('Unauthorized')) {
        safeMessage = 'غير مصرح بالوصول - يتطلب دور أرشيفي أو مسؤول';
      } else if (error.message.includes('required')) {
        safeMessage = 'بيانات مطلوبة مفقودة';
      } else if (error.message.includes('processing failed') || error.message.includes('OCR')) {
        safeMessage = 'فشلت معالجة استخراج النص، يرجى المحاولة مرة أخرى';
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: safeMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});