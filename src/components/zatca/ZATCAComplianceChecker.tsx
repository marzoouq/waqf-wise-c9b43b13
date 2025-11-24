import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

interface ComplianceCheck {
  id: string;
  title: string;
  description: string;
  status: 'pass' | 'warning' | 'fail';
  category: string;
}

export function ZATCAComplianceChecker() {
  const [complianceScore, setComplianceScore] = useState(0);
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);

  useEffect(() => {
    // محاكاة فحص الامتثال
    const performChecks = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const checkResults: ComplianceCheck[] = [
        {
          id: '1',
          title: 'الرقم الضريبي',
          description: 'وجود رقم تسجيل ضريبي صحيح',
          status: 'pass',
          category: 'تسجيل',
        },
        {
          id: '2',
          title: 'شهادة التوقيع الرقمي',
          description: 'شهادة توقيع إلكتروني صالحة ومفعلة',
          status: 'pass',
          category: 'أمان',
        },
        {
          id: '3',
          title: 'تنسيق الفواتير',
          description: 'الفواتير متوافقة مع معايير الهيئة',
          status: 'warning',
          category: 'فواتير',
        },
        {
          id: '4',
          title: 'رمز الاستجابة السريع (QR)',
          description: 'وجود QR Code على جميع الفواتير',
          status: 'pass',
          category: 'فواتير',
        },
        {
          id: '5',
          title: 'ختم التشفير',
          description: 'ختم تشفير صحيح على الفواتير',
          status: 'pass',
          category: 'أمان',
        },
        {
          id: '6',
          title: 'أرشفة الفواتير',
          description: 'حفظ الفواتير لمدة لا تقل عن 6 سنوات',
          status: 'pass',
          category: 'أرشفة',
        },
        {
          id: '7',
          title: 'معلومات العميل',
          description: 'معلومات العميل كاملة ومطابقة للمعايير',
          status: 'warning',
          category: 'بيانات',
        },
        {
          id: '8',
          title: 'رقم تسلسلي للفواتير',
          description: 'ترقيم تسلسلي فريد لكل فاتورة',
          status: 'pass',
          category: 'فواتير',
        },
      ];

      setChecks(checkResults);

      // حساب نسبة الامتثال
      const passedChecks = checkResults.filter(c => c.status === 'pass').length;
      const score = (passedChecks / checkResults.length) * 100;
      setComplianceScore(score);
    };

    performChecks();
  }, []);

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
