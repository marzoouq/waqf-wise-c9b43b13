import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export function FAQSection() {
  const faqs = [
    {
      question: "كيف أطلب فزعة طارئة؟",
      answer:
        "للحصول على فزعة طارئة، اذهب إلى تبويب 'الخدمات والطلبات'، ثم اختر 'طلب فزعة'. قم بملء النموذج بالتفاصيل المطلوبة وأرفق المستندات الداعمة إن وجدت. سيتم مراجعة طلبك وإبلاغك بالقرار في أقرب وقت ممكن.",
    },
    {
      question: "كيف أحدث بياناتي الشخصية؟",
      answer:
        "يمكنك تحديث بياناتك الشخصية بطريقتين: 1) من خلال قائمة الإعدادات (الزر في أعلى الصفحة) حيث يمكنك تعديل الإيميل ورقم الهاتف مباشرة، أو 2) من خلال تبويب 'الخدمات والطلبات' ← 'تحديث البيانات' لإرسال طلب تحديث للإدارة.",
    },
    {
      question: "كيف أتابع حالة طلباتي؟",
      answer:
        "يمكنك متابعة جميع طلباتك من خلال تبويب 'الخدمات والطلبات' ← 'سجل الطلبات'. ستجد هناك قائمة بجميع طلباتك مع حالة كل طلب (قيد المراجعة، موافق، مرفوض) والتاريخ والمبلغ إن وجد.",
    },
    {
      question: "كيف أحصل على كشف حسابي؟",
      answer:
        "يمكنك تحميل كشف حسابك من قسم 'التقارير والمستندات' في تبويب 'نظرة عامة'. اضغط على زر 'كشف الحساب (PDF)' وسيتم تحميل ملف PDF يحتوي على جميع مدفوعاتك بالتفصيل.",
    },
    {
      question: "كيف أتواصل مع إدارة الوقف؟",
      answer:
        "يمكنك التواصل مع إدارة الوقف عبر نظام الرسائل الداخلية. اضغط على زر 'الرسائل' في بطاقة الملف الشخصي أو من قائمة الإعدادات، ثم اختر المستلم (الناظر، المشرف، المحاسب) واكتب رسالتك.",
    },
    {
      question: "كيف أرفع مستندات جديدة؟",
      answer:
        "لرفع مستندات جديدة، اذهب إلى تبويب 'نظرة عامة' واضغط على بطاقة 'رفع مستند' من قسم الإجراءات السريعة، أو اضغط على أيقونة الرسائل ثم اختر 'رفع مستند'. يمكنك رفع الصور والملفات بصيغ PDF، JPG، PNG.",
    },
    {
      question: "ماذا أفعل إذا نسيت كلمة المرور؟",
      answer:
        "إذا نسيت كلمة المرور، يمكنك إعادة تعيينها من صفحة تسجيل الدخول عن طريق النقر على 'نسيت كلمة المرور'. سيتم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني المسجل.",
    },
    {
      question: "كيف أستفيد من الشفافية المالية؟",
      answer:
        "تبويب 'الشفافية المالية' يعرض لك تفاصيل شاملة عن إيرادات ومصروفات الوقف، بما في ذلك العقارات والوحدات المؤجرة، الإيجارات، والإفصاحات السنوية. يمكنك أيضاً تحميل الإفصاحات السنوية بصيغة PDF.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          الأسئلة الشائعة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-right">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-right">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
