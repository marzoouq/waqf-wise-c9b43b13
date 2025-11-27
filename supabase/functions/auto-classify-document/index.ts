import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

const classificationCategories = [
  { id: 'contract', name: 'عقود', keywords: ['عقد', 'اتفاقية', 'إيجار', 'تأجير', 'شراء', 'بيع'] },
  { id: 'financial', name: 'مالية', keywords: ['فاتورة', 'سند', 'قبض', 'صرف', 'إيراد', 'مصروف', 'حساب'] },
  { id: 'identity', name: 'هوية', keywords: ['هوية', 'جواز', 'إقامة', 'رخصة', 'شهادة ميلاد'] },
  { id: 'property', name: 'عقارات', keywords: ['صك', 'ملكية', 'أرض', 'مبنى', 'شقة', 'عقار'] },
  { id: 'legal', name: 'قانونية', keywords: ['حكم', 'قرار', 'محكمة', 'وكالة', 'توكيل'] },
  { id: 'correspondence', name: 'مراسلات', keywords: ['خطاب', 'رسالة', 'مذكرة', 'إشعار', 'طلب'] },
  { id: 'report', name: 'تقارير', keywords: ['تقرير', 'إحصائية', 'ملخص', 'بيان'] },
  { id: 'other', name: 'أخرى', keywords: [] }
];

function classifyByKeywords(text: string): { category: string; confidence: number } {
  const normalizedText = text.toLowerCase();
  let bestMatch = { category: 'other', confidence: 0.3 };
  
  for (const cat of classificationCategories) {
    if (cat.id === 'other') continue;
    
    let matchCount = 0;
    for (const keyword of cat.keywords) {
      if (normalizedText.includes(keyword)) {
        matchCount++;
      }
    }
    
    if (matchCount > 0) {
      const confidence = Math.min(0.95, 0.4 + (matchCount * 0.15));
      if (confidence > bestMatch.confidence) {
        bestMatch = { category: cat.id, confidence };
      }
    }
  }
  
  return bestMatch;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { documentId, useAI = false } = await req.json();

    if (!documentId) {
      return errorResponse('معرف المستند مطلوب', 400);
    }

    // جلب المستند
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, name, description, file_type, category')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return errorResponse('المستند غير موجود', 404);
    }

    // جلب محتوى OCR إن وجد
    const { data: ocrData } = await supabase
      .from('document_ocr_results')
      .select('extracted_text')
      .eq('document_id', documentId)
      .single();

    const textToAnalyze = [
      document.name || '',
      document.description || '',
      ocrData?.extracted_text || ''
    ].join(' ');

    let classification: { category: string; confidence: number };

    if (useAI) {
      // استخدام Lovable AI للتصنيف
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      
      if (lovableApiKey) {
        try {
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                  content: `أنت مصنف مستندات. صنف المستند إلى إحدى الفئات التالية فقط:
                  contract, financial, identity, property, legal, correspondence, report, other
                  أجب بصيغة JSON فقط: {"category": "الفئة", "confidence": 0.0-1.0}`
                },
                {
                  role: 'user',
                  content: `صنف هذا المستند:\n${textToAnalyze.substring(0, 1000)}`
                }
              ],
              max_tokens: 100,
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const content = aiData.choices?.[0]?.message?.content || '';
            
            try {
              const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
              classification = {
                category: parsed.category || 'other',
                confidence: Math.min(0.98, parsed.confidence || 0.7)
              };
            } catch {
              classification = classifyByKeywords(textToAnalyze);
            }
          } else {
            classification = classifyByKeywords(textToAnalyze);
          }
        } catch (aiError) {
          console.error('AI Classification error:', aiError);
          classification = classifyByKeywords(textToAnalyze);
        }
      } else {
        classification = classifyByKeywords(textToAnalyze);
      }
    } else {
      classification = classifyByKeywords(textToAnalyze);
    }

    // تحديث المستند بالتصنيف
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        category: classification.category,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Update error:', updateError);
      return errorResponse('فشل في تحديث التصنيف', 500);
    }

    // تسجيل في سجل التصنيف
    await supabase
      .from('audit_logs')
      .insert({
        action_type: 'auto_classify',
        table_name: 'documents',
        record_id: documentId,
        description: `تصنيف تلقائي للمستند: ${classification.category}`,
        new_values: { 
          category: classification.category, 
          confidence: classification.confidence,
          method: useAI ? 'ai' : 'keywords'
        }
      });

    const categoryInfo = classificationCategories.find(c => c.id === classification.category);

    return jsonResponse({
      success: true,
      documentId,
      classification: {
        category: classification.category,
        categoryName: categoryInfo?.name || 'أخرى',
        confidence: classification.confidence,
        method: useAI ? 'ai' : 'keywords'
      }
    });

  } catch (error) {
    console.error('Auto-classify error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'خطأ في التصنيف التلقائي',
      500
    );
  }
});
