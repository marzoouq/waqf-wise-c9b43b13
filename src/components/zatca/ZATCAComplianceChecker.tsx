import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationSettings } from "@/hooks/governance/useOrganizationSettings";
import { validateVATNumber } from "@/lib/zatca";
import { Button } from "@/components/ui/button";

interface ComplianceCheck {
  id: string;
  title: string;
  description: string;
  status: 'pass' | 'warning' | 'fail';
  category: string;
  details?: string;
}

export function ZATCAComplianceChecker() {
  const [complianceScore, setComplianceScore] = useState(0);
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { settings: orgSettings } = useOrganizationSettings();

  const performChecks = useCallback(async () => {
    setIsLoading(true);
    try {
      // جلب الفواتير من قاعدة البيانات
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, invoice_lines(*)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (invoicesError) throw invoicesError;

      const checkResults: ComplianceCheck[] = [];

      // 1. فحص الرقم الضريبي للمنظمة
      const vatNumber = orgSettings?.vat_registration_number;
      const isVatValid = vatNumber && validateVATNumber(vatNumber);
      checkResults.push({
        id: '1',
        title: 'الرقم الضريبي',
        description: 'وجود رقم تسجيل ضريبي صحيح',
        status: isVatValid ? 'pass' : vatNumber ? 'warning' : 'fail',
        category: 'تسجيل',
        details: isVatValid 
          ? `الرقم الضريبي: ${vatNumber}` 
          : vatNumber 
            ? 'الرقم الضريبي موجود لكن قد يكون غير صحيح'
            : 'لم يتم تسجيل رقم ضريبي',
      });

      // 2. فحص شهادة التوقيع الرقمي (نفحص الإعدادات)
      const { data: zatcaSettings } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .eq('category', 'zatca');

      const hasDigitalCert = zatcaSettings?.some(s => 
        s.setting_key === 'digital_certificate' && s.setting_value
      );
      checkResults.push({
        id: '2',
        title: 'شهادة التوقيع الرقمي',
        description: 'شهادة توقيع إلكتروني صالحة ومفعلة',
        status: hasDigitalCert ? 'pass' : 'warning',
        category: 'أمان',
        details: hasDigitalCert 
          ? 'شهادة التوقيع الرقمي مفعّلة' 
          : 'لم يتم تفعيل شهادة التوقيع الرقمي بعد',
      });

      // 3. فحص تنسيق الفواتير
      const invoicesWithQR = invoices?.filter(inv => inv.qr_code_data) || [];
      const qrRatio = invoices?.length ? (invoicesWithQR.length / invoices.length) * 100 : 0;
      
      checkResults.push({
        id: '3',
        title: 'تنسيق الفواتير',
        description: 'الفواتير متوافقة مع معايير الهيئة',
        status: qrRatio >= 95 ? 'pass' : qrRatio >= 70 ? 'warning' : 'fail',
        category: 'فواتير',
        details: `${invoicesWithQR.length} من ${invoices?.length || 0} فاتورة تحتوي على البيانات المطلوبة (${qrRatio.toFixed(0)}%)`,
      });

      // 4. فحص رمز QR
      checkResults.push({
        id: '4',
        title: 'رمز الاستجابة السريع (QR)',
        description: 'وجود QR Code على جميع الفواتير',
        status: qrRatio >= 95 ? 'pass' : qrRatio >= 70 ? 'warning' : 'fail',
        category: 'فواتير',
        details: `${qrRatio.toFixed(0)}% من الفواتير تحتوي على QR Code`,
      });

      // 5. فحص ختم التشفير
      const hasEncryption = zatcaSettings?.some(s => 
        s.setting_key === 'encryption_enabled' && s.setting_value === 'true'
      );
      checkResults.push({
        id: '5',
        title: 'ختم التشفير',
        description: 'ختم تشفير صحيح على الفواتير',
        status: hasEncryption ? 'pass' : 'warning',
        category: 'أمان',
        details: hasEncryption ? 'التشفير مفعّل' : 'التشفير غير مفعّل',
      });

      // 6. فحص الأرشفة (نفحص أقدم فاتورة)
      const { data: oldestInvoice } = await supabase
        .from('invoices')
        .select('invoice_date')
        .order('invoice_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      const archiveYears = oldestInvoice?.invoice_date
        ? Math.floor((Date.now() - new Date(oldestInvoice.invoice_date).getTime()) / (365 * 24 * 60 * 60 * 1000))
        : 0;

      checkResults.push({
        id: '6',
        title: 'أرشفة الفواتير',
        description: 'حفظ الفواتير لمدة لا تقل عن 6 سنوات',
        status: invoices?.length ? 'pass' : 'warning',
        category: 'أرشفة',
        details: oldestInvoice 
          ? `الفواتير محفوظة منذ ${archiveYears} سنة` 
          : 'لا توجد فواتير في النظام',
      });

      // 7. فحص معلومات العميل
      const invoicesWithFullCustomer = invoices?.filter(inv => 
        inv.customer_name && inv.customer_name.trim().length > 2
      ) || [];
      const customerRatio = invoices?.length 
        ? (invoicesWithFullCustomer.length / invoices.length) * 100 
        : 100;

      checkResults.push({
        id: '7',
        title: 'معلومات العميل',
        description: 'معلومات العميل كاملة ومطابقة للمعايير',
        status: customerRatio >= 95 ? 'pass' : customerRatio >= 70 ? 'warning' : 'fail',
        category: 'بيانات',
        details: `${customerRatio.toFixed(0)}% من الفواتير تحتوي على معلومات عميل كاملة`,
      });

      // 8. فحص الترقيم التسلسلي
      const invoiceNumbers = invoices?.map(i => i.invoice_number) || [];
      const uniqueNumbers = new Set(invoiceNumbers);
      const hasUniqueNumbers = invoiceNumbers.length === uniqueNumbers.size;

      checkResults.push({
        id: '8',
        title: 'رقم تسلسلي للفواتير',
        description: 'ترقيم تسلسلي فريد لكل فاتورة',
        status: hasUniqueNumbers ? 'pass' : 'fail',
        category: 'فواتير',
        details: hasUniqueNumbers 
          ? `${invoices?.length || 0} فاتورة بترقيم فريد` 
          : 'يوجد تكرار في أرقام الفواتير!',
      });

      setChecks(checkResults);

      // حساب نسبة الامتثال
      const passedChecks = checkResults.filter(c => c.status === 'pass').length;
      const warningChecks = checkResults.filter(c => c.status === 'warning').length;
      const score = ((passedChecks + warningChecks * 0.5) / checkResults.length) * 100;
      setComplianceScore(score);
    } catch (error) {
      console.error('Error performing compliance checks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orgSettings]);

  useEffect(() => {
    performChecks();
  }, [performChecks]);

  const getStatusIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-success">مستوفى</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">تحذير</Badge>;
      case 'fail':
        return <Badge variant="destructive">غير مستوفى</Badge>;
    }
  };

  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, ComplianceCheck[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="me-2">جارٍ فحص الامتثال...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Compliance Score */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle>مستوى الامتثال العام</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={performChecks}>
                <RefreshCw className="h-4 w-4 ms-1" />
                تحديث
              </Button>
              <Badge 
                variant={
                  complianceScore >= 90 ? 'default' : 
                  complianceScore >= 70 ? 'secondary' : 
                  'destructive'
                }
                className="text-lg px-4 py-2"
              >
                {complianceScore.toFixed(0)}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={complianceScore} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {complianceScore >= 90 
              ? 'ممتاز! نظامك متوافق بشكل كامل مع متطلبات هيئة الزكاة والضريبة'
              : complianceScore >= 70
              ? 'جيد. هناك بعض التحسينات المطلوبة لتحقيق الامتثال الكامل'
              : 'يحتاج نظامك إلى تحسينات لتحقيق الامتثال مع متطلبات الهيئة'}
          </p>
        </CardContent>
      </Card>

      {/* Detailed Checks by Category */}
      {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryChecks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(check.status)}
                    <div>
                      <h4 className="font-semibold">{check.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {check.description}
                      </p>
                      {check.details && (
                        <p className="text-xs text-muted-foreground mt-1 bg-muted/50 px-2 py-1 rounded">
                          {check.details}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(check.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {checks.filter(c => c.status === 'pass').length}
              </p>
              <p className="text-sm text-muted-foreground">مستوفى</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {checks.filter(c => c.status === 'warning').length}
              </p>
              <p className="text-sm text-muted-foreground">تحذيرات</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {checks.filter(c => c.status === 'fail').length}
              </p>
              <p className="text-sm text-muted-foreground">غير مستوفى</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
