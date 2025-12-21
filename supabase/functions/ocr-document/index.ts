import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support for FormData functions
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      try {
        const body = await req.json();
        if (body.ping || body.healthCheck) {
          console.log('[OCR-DOCUMENT] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'ocr-document',
            timestamp: new Date().toISOString()
          });
        }
      } catch {
        // ليس JSON، استمر للتحقق من FormData
      }
    }

    // التحقق من JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return unauthorizedResponse('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return unauthorizedResponse('Invalid or expired token');
    }

    // التحقق من الصلاحيات - يجب أن يكون أرشيفي أو مسؤول
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAccess = roles?.some(r => ['admin', 'nazer', 'archivist'].includes(r.role));
    
    if (!hasAccess) {
      return forbiddenResponse('Unauthorized - Archivist or Admin access required');
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

    // استخدام Lovable AI لـ OCR - إصلاح الرابط
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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

    return jsonResponse({
      success: true,
      extractedText,
      processingTime,
      logId: logData.id,
    });
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
    
    return errorResponse(safeMessage, 500);
  }
});
