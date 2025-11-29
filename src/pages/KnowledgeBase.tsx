import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, FileText, HelpCircle, Video, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const articles = [
    {
      id: 1,
      category: "البداية",
      title: "كيفية استخدام النظام",
      description: "دليل شامل للبدء في استخدام نظام إدارة الوقف",
      content: "يوفر النظام مجموعة شاملة من الأدوات لإدارة الوقف بكفاءة..."
    },
    {
      id: 2,
      category: "المستفيدون",
      title: "إضافة مستفيد جديد",
      description: "خطوات إضافة وإدارة المستفيدين",
      content: "لإضافة مستفيد جديد، اذهب إلى قسم المستفيدين..."
    },
    {
      id: 3,
      category: "المالية",
      title: "إنشاء توزيع جديد",
      description: "كيفية إنشاء وإدارة التوزيعات المالية",
      content: "التوزيعات المالية تمر بعدة مراحل موافقات..."
    },
    {
      id: 4,
      category: "التقارير",
      title: "إنشاء تقرير مخصص",
      description: "استخدام منشئ التقارير المخصصة",
      content: "يمكنك إنشاء تقارير مخصصة من خلال منشئ التقارير..."
    },
    {
      id: 5,
      category: "العقارات",
      title: "إدارة العقود",
      description: "كيفية إنشاء وتجديد عقود الإيجار",
      content: "يمكن إدارة العقود من قسم العقارات..."
    },
    {
      id: 6,
      category: "القروض",
      title: "إدارة القروض والأقساط",
      description: "كيفية متابعة القروض والأقساط",
      content: "نظام القروض يدعم جداول السداد التلقائية..."
    },
    {
      id: 7,
      category: "الأمان",
      title: "إدارة الصلاحيات",
      description: "كيفية تعيين الأدوار والصلاحيات",
      content: "يوفر النظام نظام صلاحيات متقدم RBAC..."
    },
    {
      id: 8,
      category: "المحاسبة",
      title: "شجرة الحسابات",
      description: "فهم وإدارة شجرة الحسابات",
      content: "شجرة الحسابات هي الأساس المحاسبي للنظام..."
    },
    {
      id: 9,
      category: "الإشعارات",
      title: "تفعيل الإشعارات",
      description: "كيفية استلام الإشعارات الفورية",
      content: "يمكنك تخصيص تفضيلات الإشعارات من الإعدادات..."
    },
    {
      id: 10,
      category: "النسخ الاحتياطي",
      title: "النسخ الاحتياطي للبيانات",
      description: "كيفية عمل نسخ احتياطي واستعادته",
      content: "يتم النسخ الاحتياطي تلقائياً بشكل يومي..."
    }
  ];

  const faqs = [
    {
      question: "كيف أقوم بتسجيل مستفيد جديد؟",
      answer: "اذهب إلى قسم 'المستفيدون' ثم اضغط على 'إضافة مستفيد'. قم بملء جميع الحقول المطلوبة وأرفق المستندات الداعمة."
    },
    {
      question: "كيف يتم اعتماد التوزيعات المالية؟",
      answer: "التوزيعات تمر بـ 3 مراحل موافقة: المحاسب للمراجعة، الناظر للاعتماد، وأمين الصندوق للتنفيذ."
    },
    {
      question: "ما هي أنواع التقارير المتاحة؟",
      answer: "النظام يوفر 15+ تقرير مالي وإداري بالإضافة إلى منشئ تقارير مخصصة."
    },
    {
      question: "كيف أقوم بتجديد عقد إيجار؟",
      answer: "من قسم 'العقارات' > 'العقود'، اختر العقد المطلوب ثم اضغط 'تجديد'. سيتم إنشاء عقد جديد تلقائياً."
    },
    {
      question: "كيف أستطيع تتبع القروض والأقساط؟",
      answer: "قسم 'القروض' يعرض جميع القروض مع جداول السداد وحالة كل قسط."
    },
    {
      question: "هل يدعم النظام التحويلات البنكية؟",
      answer: "نعم، النظام يولد ملفات تحويل بنكي بصيغة CSV وExcel وMT940."
    },
    {
      question: "كيف أقوم بعمل نسخة احتياطية؟",
      answer: "من 'إعدادات النظام' > 'صيانة النظام' > 'نسخ احتياطي'. النسخ التلقائي مفعّل افتراضياً."
    },
    {
      question: "ما هي الأدوار المتاحة في النظام؟",
      answer: "النظام يدعم 7 أدوار: ناظر، مشرف، محاسب، أمين صندوق، أرشيفي، مستفيد، مستخدم عادي."
    },
    {
      question: "كيف أتلقى الإشعارات؟",
      answer: "يمكنك تفعيل الإشعارات داخل النظام، عبر البريد الإلكتروني، أو الرسائل القصيرة من الإعدادات."
    },
    {
      question: "هل يمكن تخصيص التقارير؟",
      answer: "نعم، استخدم 'منشئ التقارير' لإنشاء تقارير مخصصة حسب احتياجاتك."
    },
    {
      question: "كيف أقوم برفع المستندات؟",
      answer: "من قسم 'الأرشيف'، اضغط 'رفع مستند' واختر الملف. النظام يدعم OCR تلقائي."
    },
    {
      question: "ما هي مراحل معالجة الطلبات؟",
      answer: "الطلبات تمر بمراحل: استلام > معالجة > موافقة > تنفيذ. مع تتبع SLA تلقائي."
    },
    {
      question: "كيف أضيف عقار جديد؟",
      answer: "من 'العقارات' > 'إضافة عقار'، أدخل التفاصيل والموقع والوحدات."
    },
    {
      question: "هل يدعم النظام العمل أوفلاين؟",
      answer: "النظام يتطلب اتصال بالإنترنت للعمليات الحية، لكن بعض الصفحات تعمل أوفلاين."
    },
    {
      question: "كيف أتواصل مع الدعم الفني؟",
      answer: "من قسم 'الدعم'، يمكنك إنشاء تذكرة دعم أو استخدام الرسائل الداخلية."
    }
  ];

  const filteredArticles = articles.filter(article =>
    article.title.includes(searchQuery) || 
    article.description.includes(searchQuery) ||
    article.category.includes(searchQuery)
  );

  const filteredFAQs = faqs.filter(faq =>
    faq.question.includes(searchQuery) || 
    faq.answer.includes(searchQuery)
  );

  return (
    <PageErrorBoundary pageName="قاعدة المعرفة">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="قاعدة المعرفة"
          description="دليل شامل ومقالات مساعدة لاستخدام النظام"
          icon={<BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث في قاعدة المعرفة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="ابحث عن مقالات، أسئلة شائعة، أو إرشادات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-lg"
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="articles" className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-full min-w-max h-auto p-1">
            <TabsTrigger value="articles" className="text-xs sm:text-sm min-h-[44px]">
              <FileText className="h-4 w-4 ml-1" />
              <span className="hidden sm:inline">المقالات</span> ({filteredArticles.length})
            </TabsTrigger>
            <TabsTrigger value="faqs" className="text-xs sm:text-sm min-h-[44px]">
              <HelpCircle className="h-4 w-4 ml-1" />
              <span className="hidden sm:inline">الأسئلة الشائعة</span> ({filteredFAQs.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="text-xs sm:text-sm min-h-[44px]">
              <Video className="h-4 w-4 ml-1" />
              <span className="hidden sm:inline">شروحات فيديو</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="text-xs sm:text-sm min-h-[44px]">
              <Download className="h-4 w-4 ml-1" />
              <span className="hidden sm:inline">التنزيلات</span>
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="articles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {article.category}
                    </span>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.content}
                  </p>
                  <Button variant="link" className="mt-2 p-0">
                    اقرأ المزيد ←
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>الأسئلة الأكثر شيوعاً</CardTitle>
              <CardDescription>
                إجابات سريعة على الأسئلة الأكثر تكراراً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.question} value={faq.question}>
                    <AccordionTrigger className="text-right">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>شروحات الفيديو</CardTitle>
              <CardDescription>
                دروس مرئية لاستخدام النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <Card key={n} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold">درس {n}: مقدمة للنظام</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        المدة: {5 + n} دقائق
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads">
          <Card>
            <CardHeader>
              <CardTitle>ملفات قابلة للتنزيل</CardTitle>
              <CardDescription>
                أدلة PDF ونماذج وقوالب مفيدة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "دليل المستخدم الكامل (PDF)",
                  "نموذج طلب مستفيد جديد",
                  "قالب تقرير مالي",
                  "نموذج عقد إيجار",
                  "دليل المحاسب السريع"
                ].map((item) => (
                  <div 
                    key={`download-${item}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-primary" />
                      <span>{item}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      تنزيل
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default KnowledgeBase;
