import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { seedTestData, clearTestData } from '@/__tests__/seed-test-data';

export default function TestDataManager() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const result = await seedTestData();
      setSeedResult(result);
      
      if (result.success) {
        toast({
          title: 'تم إضافة البيانات بنجاح',
          description: `تم إضافة ${Object.values(result.counts).reduce((a: number, b: number) => a + b, 0)} سجل`,
        });
      } else {
        toast({
          title: 'فشل إضافة البيانات',
          description: 'حدث خطأ أثناء إضافة البيانات',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع البيانات الوهمية؟')) {
      return;
    }

    setIsClearing(true);
    try {
      const result = await clearTestData();
      
      if (result.success) {
        setSeedResult(null);
        toast({
          title: 'تم حذف البيانات بنجاح',
          description: 'تم حذف جميع البيانات الوهمية من القاعدة',
        });
      } else {
        toast({
          title: 'فشل حذف البيانات',
          description: 'حدث خطأ أثناء حذف البيانات',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">إدارة البيانات الوهمية</h1>
        <p className="text-muted-foreground">
          أداة لإضافة وحذف البيانات الوهمية للاختبار والتطوير
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* إضافة البيانات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              إضافة بيانات وهمية
            </CardTitle>
            <CardDescription>
              إضافة مجموعة كاملة من البيانات الوهمية للاختبار
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm">
                <strong>البيانات التي سيتم إضافتها:</strong>
              </div>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>20 مستفيد + عائلة كاملة</li>
                <li>15 عقار</li>
                <li>12 توزيع شهري</li>
                <li>شجرة حسابات كاملة (17 حساب)</li>
                <li>20 قيد محاسبي</li>
                <li>5 أنواع طلبات + 10 طلبات</li>
                <li>10 قروض</li>
                <li>30 مستند</li>
              </ul>
            </div>

            <Button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="w-full"
              size="lg"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Database className="ml-2 h-4 w-4" />
                  إضافة البيانات
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* حذف البيانات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              حذف البيانات الوهمية
            </CardTitle>
            <CardDescription>
              حذف جميع البيانات الوهمية من القاعدة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex gap-2 items-start">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong>تحذير:</strong> هذا الإجراء سيحذف جميع البيانات الوهمية بشكل نهائي
                  ولا يمكن التراجع عنه.
                </div>
              </div>
            </div>

            <Button
              onClick={handleClearData}
              disabled={isClearing}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              {isClearing ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف جميع البيانات
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* نتائج الإضافة */}
      {seedResult?.success && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              تم إضافة البيانات بنجاح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {seedResult.counts.beneficiaries}
                </div>
                <div className="text-sm text-muted-foreground">مستفيد</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {seedResult.counts.properties}
                </div>
                <div className="text-sm text-muted-foreground">عقار</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {seedResult.counts.distributions}
                </div>
                <div className="text-sm text-muted-foreground">توزيع</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {seedResult.counts.accounts}
                </div>
                <div className="text-sm text-muted-foreground">حساب</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {seedResult.counts.journalEntries}
                </div>
                <div className="text-sm text-muted-foreground">قيد</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {seedResult.counts.requestTypes}
                </div>
                <div className="text-sm text-muted-foreground">نوع طلب</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {seedResult.counts.documents}
                </div>
                <div className="text-sm text-muted-foreground">مستند</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {String(Object.values(seedResult.counts).reduce((a, b) => Number(a) + Number(b), 0))}
                </div>
                <div className="text-sm text-muted-foreground">إجمالي</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle>ملاحظات مهمة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p>يمكن إعادة إضافة البيانات عدة مرات بدون مشاكل</p>
          </div>
          <div className="flex gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p>البيانات الوهمية تستخدم في الاختبارات والتطوير فقط</p>
          </div>
          <div className="flex gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p>يتم إنشاء أرقام عشوائية للهويات والهواتف</p>
          </div>
          <div className="flex gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p>جميع البيانات باللغة العربية ومناسبة للسياق السعودي</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
