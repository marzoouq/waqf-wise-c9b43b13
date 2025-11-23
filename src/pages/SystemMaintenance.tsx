import { useState } from "react";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SystemMaintenance() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleBackfillDocuments = async () => {
    try {
      setIsProcessing(true);
      setResult(null);

      toast({
        title: "⏳ جاري المعالجة...",
        description: "يتم الآن معالجة الدفعات المدفوعة وإنشاء المستندات المفقودة",
      });

      const { data, error } = await supabase.functions.invoke('backfill-rental-documents');

      if (error) {
        throw error;
      }

      setResult(data);

      if (data.success) {
        toast({
          title: "✅ تمت المعالجة بنجاح",
          description: data.message,
        });
      } else {
        toast({
          title: "⚠️ تحذير",
          description: data.message || "حدثت بعض المشاكل أثناء المعالجة",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error('Error calling backfill function:', error);
      const errorMessage = error instanceof Error ? error.message : "فشل في معالجة المستندات";
      toast({
        title: "❌ خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MobileOptimizedLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">صيانة النظام</h1>
        <p className="text-muted-foreground mt-2">أدوات صيانة وإصلاح البيانات</p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              معالجة المستندات المفقودة
            </CardTitle>
            <CardDescription>
              إنشاء الفواتير وسندات القبض والقيود المحاسبية للدفعات المدفوعة التي لا تحتوي على مستندات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>تنبيه:</strong> هذه العملية ستقوم بـ:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>إنشاء فواتير ZATCA للدفعات المدفوعة بدون فواتير</li>
                  <li>إنشاء سندات قبض رسمية</li>
                  <li>إنشاء قيود محاسبية تلقائية</li>
                  <li>حذف القيود الخاطئة (المرتبطة بدفعات معلقة)</li>
                  <li>أرشفة جميع المستندات</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleBackfillDocuments}
              disabled={isProcessing}
              size="lg"
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <FileText className="ml-2 h-4 w-4" />
                  بدء معالجة المستندات
                </>
              )}
            </Button>

            {result && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{result.processed || 0}</div>
                        <div className="text-sm text-muted-foreground">تمت معالجتها</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{result.failed || 0}</div>
                        <div className="text-sm text-muted-foreground">فشلت</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {result.cleaned_entries > 0 && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      تم تنظيف <strong>{result.cleaned_entries}</strong> قيد محاسبي خاطئ
                    </AlertDescription>
                  </Alert>
                )}

                {result.processed_payments && result.processed_payments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">الدفعات المعالجة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(result.processed_payments as Array<{ payment_number: string }>).map((payment, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <span className="font-medium">{payment.payment_number}</span>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>✓ فاتورة</span>
                              <span>✓ سند</span>
                              <span>✓ قيد</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {result.errors && result.errors.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>أخطاء:</strong>
                      <ul className="list-disc list-inside mt-2">
                        {result.errors.map((error: string, index: number) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات إضافية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• يمكن تشغيل هذه العملية عدة مرات بأمان</p>
            <p>• لن يتم إنشاء مستندات مكررة</p>
            <p>• يتم تسجيل جميع العمليات في سجل النظام</p>
            <p>• يُنصح بإجراء نسخة احتياطية قبل التشغيل</p>
          </CardContent>
        </Card>
      </div>
    </MobileOptimizedLayout>
  );
}
