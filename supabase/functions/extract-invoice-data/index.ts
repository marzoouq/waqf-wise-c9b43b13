/**
 * Edge Function: استخراج بيانات الفواتير من الصور باستخدام Lovable AI
 * يستخدم google/gemini-2.5-flash لتحليل صور الفواتير واستخراج البيانات منها
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

interface ExtractedInvoiceData {
  invoice_number?: string;
  invoice_date?: string;
  vendor_name?: string;
  vendor_vat_number?: string;
  vendor_address?: string;
  customer_name?: string;
  customer_vat_number?: string;
  customer_address?: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    total: number;
  }[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  confidence_scores: {
    [key: string]: number;
  };
  overall_confidence: number;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorizedResponse('يجب تسجيل الدخول');
    }

    // Check user role (admin, nazer, accountant only)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'nazer', 'accountant'])
      .maybeSingle();

    if (!userRole) {
      return forbiddenResponse('صلاحيات غير كافية');
    }

    const { image_base64, image_url } = await req.json();

    if (!image_base64 && !image_url) {
      return errorResponse('يجب تقديم صورة إما بتنسيق Base64 أو URL', 400);
    }

    console.log('🔍 بدء تحليل صورة الفاتورة باستخدام Lovable AI...');

    // استخدام Lovable AI لتحليل الصورة
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY غير متوفر');
    }

    const prompt = `أنت نظام ذكي متخصص في استخراج بيانات الفواتير الضريبية السعودية.

قم بتحليل صورة الفاتورة المرفقة واستخرج البيانات التالية بدقة عالية:

1. **معلومات الفاتورة:**
   - رقم الفاتورة (invoice_number)
   - تاريخ الفاتورة (invoice_date) بتنسيق YYYY-MM-DD

2. **بيانات البائع/المورد:**
   - اسم البائع (vendor_name)
   - الرقم الضريبي للبائع (vendor_vat_number)
   - عنوان البائع (vendor_address)

3. **بيانات العميل/المشتري:**
   - اسم العميل (customer_name)
   - الرقم الضريبي للعميل (customer_vat_number)
   - عنوان العميل (customer_address)

4. **بنود الفاتورة (items):** لكل بند استخرج:
   - الوصف (description)
   - الكمية (quantity)
   - السعر قبل الضريبة (unit_price)
   - نسبة الضريبة (tax_rate) - عادة 15%
   - المجموع شامل الضريبة (total)

5. **المبالغ المالية:**
   - المجموع قبل الضريبة (subtotal)
   - قيمة الضريبة (tax_amount)
   - المجموع الإجمالي (total_amount)

6. **نسبة الثقة (confidence_scores):** لكل حقل، قدّر نسبة الثقة من 0 إلى 100

**IMPORTANT:** 
- الرد يجب أن يكون بتنسيق JSON فقط
- إذا لم تجد قيمة، استخدم null
- تأكد من صحة الأرقام الضريبية (15 رقم تبدأ بـ 3)
- احسب overall_confidence كمتوسط نسب الثقة

أعد النتيجة بصيغة JSON التالية فقط بدون أي نص إضافي:

{
  "invoice_number": "INV-2024-001",
  "invoice_date": "2024-01-15",
  "vendor_name": "اسم الشركة البائعة",
  "vendor_vat_number": "300000000000003",
  "vendor_address": "العنوان",
  "customer_name": "اسم العميل",
  "customer_vat_number": "311111111111113",
  "customer_address": "عنوان العميل",
  "items": [
    {
      "description": "خدمة استشارات",
      "quantity": 1,
      "unit_price": 1000,
      "tax_rate": 15,
      "total": 1150
    }
  ],
  "subtotal": 1000,
  "tax_amount": 150,
  "total_amount": 1150,
  "confidence_scores": {
    "invoice_number": 95,
    "invoice_date": 98,
    "vendor_name": 90,
    "items": 85
  },
  "overall_confidence": 92
}`;

    const aiPayload: any = {
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    };

    // إضافة الصورة
    if (image_base64) {
      aiPayload.messages[0].content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${image_base64}`,
        },
      });
    } else if (image_url) {
      aiPayload.messages[0].content.push({
        type: 'image_url',
        image_url: {
          url: image_url,
        },
      });
    }

    const aiResponse = await fetch('https://api.lovable.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify(aiPayload),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ خطأ في Lovable AI:', errorText);
      throw new Error(`فشل تحليل الصورة: ${aiResponse.status} ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    console.log('✅ تم تحليل الصورة بنجاح');

    const content = aiResult.choices[0].message.content;
    
    // استخراج JSON من الرد
    let extractedData: ExtractedInvoiceData;
    try {
      // محاولة استخراج JSON من الرد
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('❌ خطأ في تحليل JSON:', content);
      throw new Error('فشل في تحليل البيانات المستخرجة من الصورة');
    }

    // التحقق من البيانات الأساسية
    if (!extractedData.items || extractedData.items.length === 0) {
      throw new Error('لم يتم العثور على بنود في الفاتورة');
    }

    console.log('📊 البيانات المستخرجة:', {
      invoice_number: extractedData.invoice_number,
      items_count: extractedData.items.length,
      total: extractedData.total_amount,
      confidence: extractedData.overall_confidence,
    });

    return jsonResponse({
      success: true,
      data: extractedData,
      processed_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ خطأ في معالجة الطلب:', error);
    return errorResponse(
      error?.message || 'خطأ غير معروف',
      500
    );
  }
});
