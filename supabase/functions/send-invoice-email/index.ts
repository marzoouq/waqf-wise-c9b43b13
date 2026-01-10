import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse 
} from '../_shared/cors.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface SendInvoiceEmailRequest {
  invoiceId: string;
  customerEmail: string;
  customerName: string;
  invoiceNumber: string;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ قراءة body مرة واحدة فقط
    const bodyText = await req.text();
    let body: Record<string, unknown> = {};
    
    if (bodyText) {
      try {
        body = JSON.parse(bodyText);
      } catch {
        return errorResponse('Invalid JSON body', 400);
      }
    }

    // ✅ Health Check Support
    if (body.ping || body.healthCheck || body.testMode) {
      console.log('[send-invoice-email] Health check / test mode received');
      return jsonResponse({
        status: 'healthy',
        function: 'send-invoice-email',
        testMode: !!body.testMode,
        message: body.testMode ? 'اختبار ناجح - لم يتم إرسال بريد فعلي' : undefined,
        timestamp: new Date().toISOString()
      });
    }

    // ✅ استخدام body المحفوظة
    const invoiceId = (body.invoiceId as string) || '';
    const customerEmail = (body.customerEmail as string) || '';
    const customerName = (body.customerName as string) || 'العميل الكريم';
    const invoiceNumber = (body.invoiceNumber as string) || 'غير محدد';
    const totalAmount = typeof body.totalAmount === 'number' ? body.totalAmount : 0;

    // التحقق من البيانات المطلوبة
    if (!invoiceId || !customerEmail) {
      return errorResponse('معرف الفاتورة والبريد الإلكتروني مطلوبان', 400);
    }

    console.log("Sending invoice email:", {
      invoiceId,
      customerEmail,
      invoiceNumber,
    });

    // Send email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "نظام إدارة الوقف <onboarding@resend.dev>",
        to: [customerEmail],
        subject: `فاتورة رقم ${invoiceNumber}`,
        html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f7f9;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #2d6a4f 0%, #40916c 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 14px;
              opacity: 0.95;
            }
            .content {
              padding: 30px 20px;
            }
            .greeting {
              font-size: 18px;
              color: #1b4332;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .invoice-box {
              background: #f8fdf9;
              border: 2px solid #52b788;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .invoice-detail {
              display: flex;
              justify-content: space-between;
              margin: 12px 0;
              padding: 8px 0;
              border-bottom: 1px solid #d8f3dc;
            }
            .invoice-detail:last-child {
              border-bottom: none;
            }
            .label {
              color: #52b788;
              font-weight: 600;
            }
            .value {
              color: #1b4332;
              font-weight: bold;
              font-size: 16px;
            }
            .total-amount {
              background: #2d6a4f;
              color: white;
              padding: 15px;
              border-radius: 6px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin: 20px 0;
            }
            .message {
              color: #495057;
              line-height: 1.6;
              margin: 15px 0;
            }
            .footer {
              background: #e9f5ec;
              padding: 20px;
              text-align: center;
              color: #40916c;
              font-size: 13px;
              line-height: 1.6;
            }
            .footer-line {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🕌 نظام إدارة الوقف</h1>
              <p>نظام شامل لإدارة الأوقاف والمستفيدين</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                السلام عليكم ${customerName}،
              </div>
              
              <p class="message">
                نشكركم على تعاملكم معنا. نرفق لكم تفاصيل الفاتورة:
              </p>
              
              <div class="invoice-box">
                <div class="invoice-detail">
                  <span class="label">رقم الفاتورة</span>
                  <span class="value">${invoiceNumber}</span>
                </div>
                <div class="invoice-detail">
                  <span class="label">التاريخ</span>
                  <span class="value">${new Date().toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              
              <div class="total-amount">
                المبلغ الإجمالي: ${(totalAmount || 0).toFixed(2)} ر.س
              </div>
              
              <p class="message">
                يمكنكم مراجعة تفاصيل الفاتورة الكاملة بالدخول إلى النظام، أو التواصل معنا للاستفسار.
              </p>
            </div>
            
            <div class="footer">
              <div class="footer-line"><strong>نظام إدارة الوقف</strong></div>
              <div class="footer-line">الرقم الضريبي: 300000000000003</div>
              <div class="footer-line">السجل التجاري: 1234567890</div>
              <div class="footer-line">📧 info@waqf.sa | 📱 +966 50 123 4567</div>
              <div class="footer-line" style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #b7e4c7;">
                هذه رسالة تلقائية، الرجاء عدم الرد عليها مباشرة
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(errorData.message || "Failed to send email");
    }

    const responseData = await emailResponse.json();
    console.log("Email sent successfully:", responseData);

    return jsonResponse(responseData);
  } catch (error: unknown) {
    console.error("Error in send-invoice-email function:", error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
};

serve(handler);
