import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoJournalTemplatesManager } from "@/components/accounting/AutoJournalTemplatesManager";
import { ApprovalWorkflowBuilder } from "@/components/accounting/ApprovalWorkflowBuilder";
import { FinancialAnalyticsDashboard } from "@/components/accounting/FinancialAnalyticsDashboard";
import { InvoiceManager } from "@/components/invoices/InvoiceManager";
import { ZATCASettings } from "@/components/zatca/ZATCASettings";
import { ZATCAComplianceChecker } from "@/components/zatca/ZATCAComplianceChecker";
import { ZATCAInvoicePreview } from "@/components/zatca/ZATCAInvoicePreview";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { useState } from "react";

export default function TestPhase3() {
  // بيانات تجريبية لفاتورة ZATCA
  const [testInvoice] = useState({
    id: "test-inv-001",
    invoice_number: "INV-2024-001",
    invoice_date: "2024-01-15",
    customer_name: "مؤسسة الاختبار",
    customer_email: "test@example.com",
    customer_phone: "+966500000000",
    subtotal: 10000,
    tax_amount: 1500,
    total_amount: 11500,
    status: "draft",
    notes: "فاتورة تجريبية لاختبار التوافق مع ZATCA"
  });

  const phase3Features = [
    {
      title: "القيود المحاسبية التلقائية",
      description: "إنشاء قيود محاسبية تلقائية بناءً على الأحداث",
      status: "completed",
      component: "AutoJournalTemplatesManager"
    },
    {
      title: "مسارات الموافقات",
      description: "نظام متعدد المستويات للموافقات",
      status: "completed",
      component: "ApprovalWorkflowsManager"
    },
    {
      title: "التسوية البنكية الذكية",
      description: "مطابقة تلقائية للمعاملات البنكية",
      status: "completed",
      component: "BankReconciliationDialog"
    },
    {
      title: "لوحة التحليلات المالية",
      description: "تحليلات متقدمة ومؤشرات أداء رئيسية",
      status: "completed",
      component: "FinancialAnalyticsDashboard"
    },
    {
      title: "إدارة الفواتير",
      description: "نظام الفواتير الإلكترونية",
      status: "completed",
      component: "InvoiceManager"
    },
    {
      title: "التوافق مع ZATCA",
      description: "إعدادات وفحص التوافق مع هيئة الزكاة والضريبة",
      status: "completed",
      component: "ZATCA Components"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">اختبار المرحلة الثالثة - النظام المحاسبي المتكامل</h1>
        <p className="text-muted-foreground">
          اختبار شامل لجميع مميزات المرحلة الثالثة مع بيانات تجريبية
        </p>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص المميزات المنجزة</CardTitle>
          <CardDescription>
            المرحلة الثالثة - 100% مكتملة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phase3Features.map((feature) => (
              <Card key={`feature-${feature.title}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium">
                      {feature.title}
                    </CardTitle>
                    {feature.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">
                    {feature.description}
                  </p>
                  <p className="text-xs font-mono text-primary">
                    {feature.component}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Testing */}
      <Tabs defaultValue="auto-journal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="auto-journal">القيود التلقائية</TabsTrigger>
          <TabsTrigger value="workflows">الموافقات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير</TabsTrigger>
          <TabsTrigger value="zatca">ZATCA</TabsTrigger>
        </TabsList>

        {/* 1. Auto Journal Templates */}
        <TabsContent value="auto-journal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إدارة قوالب القيود التلقائية</CardTitle>
              <CardDescription>
                إنشاء وإدارة القوالب التي تنشئ قيود محاسبية تلقائياً عند حدوث أحداث معينة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoJournalTemplatesManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Approval Workflows */}
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إدارة مسارات الموافقات</CardTitle>
              <CardDescription>
                تكوين مسارات موافقة متعددة المستويات للعمليات المالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApprovalWorkflowBuilder />
            </CardContent>
          </Card>
          
          <Card className="bg-muted/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">ملاحظة حول التسوية البنكية</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ميزة التسوية البنكية الذكية متوفرة في صفحة المحاسبة {'>'} التسوية البنكية. 
                تتطلب هذه الميزة وجود كشوف حساب بنكية محملة في النظام لإجراء المطابقة التلقائية.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Financial Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>لوحة التحليلات المالية</CardTitle>
              <CardDescription>
                مؤشرات الأداء الرئيسية والتحليلات المالية المتقدمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialAnalyticsDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Invoice Manager */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الفواتير الإلكترونية</CardTitle>
              <CardDescription>
                إنشاء وإدارة الفواتير الإلكترونية المتوافقة مع ZATCA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. ZATCA Integration */}
        <TabsContent value="zatca" className="space-y-4">
          {/* ZATCA Settings */}
          <Card>
            <CardHeader>
              <CardTitle>إعدادات ZATCA</CardTitle>
              <CardDescription>
                تكوين الاتصال مع منصة هيئة الزكاة والضريبة والجمارك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ZATCASettings />
            </CardContent>
          </Card>

          {/* ZATCA Compliance Checker */}
          <Card>
            <CardHeader>
              <CardTitle>فحص التوافق مع ZATCA</CardTitle>
              <CardDescription>
                التحقق من توافق النظام مع متطلبات هيئة الزكاة والضريبة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ZATCAComplianceChecker />
            </CardContent>
          </Card>

          {/* ZATCA Invoice Preview */}
          <Card>
            <CardHeader>
              <CardTitle>معاينة فاتورة ZATCA</CardTitle>
              <CardDescription>
                معاينة واختبار إرسال فاتورة تجريبية إلى ZATCA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ZATCAInvoicePreview invoice={testInvoice} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Testing Instructions */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle>إرشادات الاختبار</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">اختبار القيود التلقائية:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>أنشئ قالب قيد تلقائي جديد</li>
              <li>اختر حدث التشغيل (مثل: إنشاء دفعة)</li>
              <li>حدد حسابات المدين والدائن</li>
              <li>احفظ القالب وفعّله</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">اختبار مسارات الموافقات:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>أنشئ مسار موافقة جديد</li>
              <li>أضف مستويات موافقة (محاسب، مدير مالي، ناظر)</li>
              <li>حدد الشروط (مثل: المبلغ {">"} 10000)</li>
              <li>فعّل المسار واختبره على عملية مالية</li>
            </ul>
          </div>


          <div className="space-y-2">
            <h4 className="font-semibold">اختبار التحليلات المالية:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>راجع مؤشرات الأداء الرئيسية (KPIs)</li>
              <li>تحقق من الرسوم البيانية والاتجاهات</li>
              <li>حلل النسب المالية</li>
              <li>قارن الأداء عبر الفترات المختلفة</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">اختبار الفواتير و ZATCA:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>أنشئ فاتورة إلكترونية جديدة</li>
              <li>تأكد من صحة البيانات الضريبية</li>
              <li>راجع رمز QR للفاتورة</li>
              <li>اختبر إرسال الفاتورة إلى ZATCA</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
