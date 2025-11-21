import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, MessageSquare, Send, ArrowRight, Phone, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBeneficiaryProfile } from "@/hooks/useBeneficiaryProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { useNavigate } from "react-router-dom";

export default function BeneficiarySupport() {
  const { user } = useAuth();
  const { beneficiary } = useBeneficiaryProfile(user?.id);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const faqs = [
    {
      question: "كيف أطلب فزعة طارئة؟",
      answer:
        "للحصول على فزعة طارئة، اذهب إلى لوحة التحكم ← 'الخدمات والطلبات' ← 'طلب فزعة'. قم بملء النموذج بالتفاصيل المطلوبة وأرفق المستندات الداعمة إن وجدت. سيتم مراجعة طلبك وإبلاغك بالقرار في أقرب وقت ممكن.",
    },
    {
      question: "كيف أحدث بياناتي الشخصية؟",
      answer:
        "يمكنك تحديث بياناتك الشخصية بطريقتين: 1) من خلال قائمة الإعدادات (الزر في أعلى الصفحة) حيث يمكنك تعديل الإيميل ورقم الهاتف مباشرة، أو 2) من خلال 'الخدمات والطلبات' ← 'تحديث البيانات' لإرسال طلب تحديث للإدارة.",
    },
    {
      question: "كيف أتابع حالة طلباتي؟",
      answer:
        "يمكنك متابعة جميع طلباتك من خلال 'الخدمات والطلبات' ← 'سجل الطلبات'. ستجد هناك قائمة بجميع طلباتك مع حالة كل طلب (قيد المراجعة، موافق، مرفوض) والتاريخ والمبلغ إن وجد.",
    },
    {
      question: "كيف أحصل على كشف حسابي؟",
      answer:
        "يمكنك تحميل كشف حسابك من قسم 'التقارير' في لوحة التحكم الرئيسية. اضغط على زر 'كشف الحساب (PDF)' وسيتم تحميل ملف PDF يحتوي على جميع مدفوعاتك بالتفصيل.",
    },
    {
      question: "كيف أتواصل مع إدارة الوقف؟",
      answer:
        "يمكنك التواصل مع إدارة الوقف عبر نظام الرسائل الداخلية. اضغط على زر 'الرسائل' في بطاقة الملف الشخصي أو من قائمة الإعدادات، ثم اختر المستلم (الناظر، المشرف، المحاسب) واكتب رسالتك.",
    },
    {
      question: "كيف أرفع مستندات جديدة؟",
      answer:
        "لرفع مستندات جديدة، اذهب إلى لوحة التحكم واضغط على بطاقة 'رفع مستند' من قسم الإجراءات السريعة. يمكنك رفع الصور والملفات بصيغ PDF، JPG، PNG.",
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
    {
      question: "كيف يمكنني الاستفادة من المساعد الذكي؟",
      answer:
        "المساعد الذكي متاح في لوحة التحكم الرئيسية. يمكنك استخدامه للحصول على إجابات فورية عن أي سؤال يتعلق بحسابك، المدفوعات، الطلبات، أو أي استفسار عام عن الوقف. ببساطة اضغط على أيقونة المساعد الذكي واكتب سؤالك.",
    },
  ];

  const handleSubmitSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // إنشاء طلب دعم فني
      const { error } = await supabase.from("beneficiary_requests").insert({
        beneficiary_id: beneficiary?.id,
        request_type_id: "support",
        description: `${subject}\n\n${message}`,
        priority: "عادية",
        status: "قيد المراجعة",
      });

      if (error) throw error;

      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "سيتم الرد عليك في أقرب وقت ممكن",
      });

      setSubject("");
      setMessage("");
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل إرسال الطلب",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileOptimizedLayout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">الدعم الفني والمساعدة</h1>
            <p className="text-muted-foreground mt-1">
              الأسئلة الشائعة ومراسلة فريق الدعم
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/beneficiary-dashboard")}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للوحة التحكم
          </Button>
        </div>

        {/* معلومات التواصل السريع */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">الهاتف</p>
                  <p className="text-sm text-muted-foreground">للحالات العاجلة فقط</p>
                  <p className="text-sm font-medium mt-1" dir="ltr">+966 XX XXX XXXX</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">البريد الإلكتروني</p>
                  <p className="text-sm text-muted-foreground">للاستفسارات العامة</p>
                  <p className="text-sm font-medium mt-1">support@waqf.sa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs defaultValue="faq" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faq" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              الأسئلة الشائعة
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              راسلنا
            </TabsTrigger>
          </TabsList>

          {/* الأسئلة الشائعة */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  الأسئلة الشائعة
                </CardTitle>
                <CardDescription>
                  إجابات على الأسئلة الأكثر شيوعاً من المستفيدين
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-right hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-right">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* مراسلة الدعم الفني */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  راسل فريق الدعم الفني
                </CardTitle>
                <CardDescription>
                  إذا لم تجد إجابة لسؤالك في الأسئلة الشائعة، يمكنك مراسلتنا مباشرة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSupportTicket} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">الموضوع</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="مثال: استفسار عن دفعة شهر رمضان"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">الرسالة</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="اكتب استفسارك أو طلبك بالتفصيل..."
                      rows={8}
                      required
                    />
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>ملاحظة:</strong> سيتم الرد على رسالتك خلال 24-48 ساعة عمل.
                      للحالات العاجلة، يرجى الاتصال بنا هاتفياً.
                    </p>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      "جاري الإرسال..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 ml-2" />
                        إرسال الرسالة
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileOptimizedLayout>
  );
}
