import { Link } from "react-router-dom";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { HelpCircle, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "ما هي منصة الوقف؟",
    answer: "منصة الوقف هي نظام إلكتروني متكامل لإدارة الأوقاف الإسلامية. تشمل إدارة المستفيدين، المحاسبة المالية، توزيع الغلة، الأرشفة الإلكترونية، وإدارة العقارات والأصول الوقفية."
  },
  {
    question: "كيف يمكنني التسجيل كمستفيد؟",
    answer: "يمكنك التسجيل من خلال الضغط على زر 'سجل الآن' في الصفحة الرئيسية. ستحتاج لتقديم بياناتك الشخصية ورقم الهوية الوطنية وإثبات الأهلية للاستفادة من خدمات الوقف."
  },
  {
    question: "هل المنصة آمنة؟",
    answer: "نعم، نستخدم أحدث تقنيات التشفير والحماية لضمان أمان بياناتك. نطبق معايير أمان صارمة تشمل التشفير، المصادقة الثنائية، والمراقبة المستمرة."
  },
  {
    question: "كيف يتم توزيع غلة الوقف؟",
    answer: "يتم توزيع الغلة وفق شروط الواقف المحددة في صك الوقف، وبموافقة الناظر. يتم الصرف من خلال نظام آلي دقيق يضمن وصول المستحقات للمستفيدين في الوقت المحدد."
  },
  {
    question: "ما هي طرق الصرف المتاحة؟",
    answer: "نوفر عدة طرق للصرف تشمل: التحويل البنكي المباشر، سندات الصرف الإلكترونية، والصرف النقدي عند الحاجة. يتم التنسيق مع المستفيد لاختيار الطريقة المناسبة."
  },
  {
    question: "كيف يمكنني تقديم طلب فزعة طارئة؟",
    answer: "من خلال بوابة المستفيد، اختر 'طلب جديد' ثم 'فزعة طارئة'. قم بوصف الحالة وإرفاق المستندات الداعمة. سيتم مراجعة طلبك بأسرع وقت ممكن."
  },
  {
    question: "ما هي مدة معالجة الطلبات؟",
    answer: "تختلف مدة المعالجة حسب نوع الطلب. الفزعات الطارئة تُعالج خلال 24-48 ساعة، بينما الطلبات العادية قد تستغرق 3-7 أيام عمل."
  },
  {
    question: "كيف أتواصل مع الدعم الفني؟",
    answer: "يمكنك التواصل معنا عبر: البريد الإلكتروني info@waqf.sa، الهاتف +966 50 000 0000، أو من خلال نموذج التواصل في المنصة. فريق الدعم متاح خلال ساعات العمل الرسمية."
  },
  {
    question: "هل يمكنني تحديث بياناتي؟",
    answer: "نعم، يمكنك تحديث بياناتك من خلال بوابة المستفيد. بعض التغييرات قد تتطلب موافقة الإدارة ورفع مستندات داعمة."
  },
  {
    question: "ما هي الأجهزة المدعومة؟",
    answer: "المنصة تعمل على جميع الأجهزة والمتصفحات الحديثة. يمكنك الوصول إليها من الكمبيوتر، الجوال، أو الجهاز اللوحي."
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
      <LandingHeader />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">الأسئلة الشائعة</h1>
          <p className="text-muted-foreground">إجابات على الأسئلة الأكثر شيوعاً حول منصة الوقف</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card rounded-xl border border-border px-6"
            >
              <AccordionTrigger className="text-right hover:no-underline py-6">
                <span className="text-foreground font-medium">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center space-y-4">
          <p className="text-muted-foreground">
            لم تجد إجابة لسؤالك؟
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
          >
            تواصل معنا
          </Link>
          <div className="pt-4">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground"
            >
              ← العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
