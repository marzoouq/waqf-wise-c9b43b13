import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Database } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TestDataSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const setupTestData = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-test-beneficiaries');

      if (error) throw error;

      setResults(data);
      toast({
        title: 'نجح الإعداد',
        description: 'تم إنشاء جميع حسابات المستفيدين التجريبية بنجاح',
      });
    } catch (error: any) {
      toast({
        title: 'فشل الإعداد',
        description: error.message || 'حدث خطأ أثناء إنشاء البيانات التجريبية',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            إعداد البيانات التجريبية
          </CardTitle>
          <CardDescription>
            إنشاء حسابات مصادقة للمستفيدين التجريبيين للاختبار
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTitle>ملاحظة مهمة</AlertTitle>
            <AlertDescription>
              هذه الأداة تقوم بإنشاء حسابات مصادقة لخمسة مستفيدين تجريبيين بكلمة المرور: <code className="bg-muted px-2 py-1 rounded">Test@123456</code>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold">المستفيدون التجريبيون (5 مستفيدين):</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>عبدالرحمن مرزوق علي الثبيتي</span>
                <code className="font-mono">1014548273</code>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>فاطمه محمد سعد الشهراني</span>
                <code className="font-mono">1014548257</code>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>امل السيد ابراهيم ابوالريش</span>
                <code className="font-mono">1050953866</code>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>حنان مرزوق علي الثبيتي</span>
                <code className="font-mono">1014548265</code>
              </div>
              <div className="flex justify-between p-2 bg-muted rounded">
                <span>منى مرزوق علي الثبيتي</span>
                <code className="font-mono">1048839425</code>
              </div>
            </div>
          </div>

          <Button
            onClick={setupTestData} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الإعداد...
              </>
            ) : (
              <>
                <Database className="ml-2 h-4 w-4" />
                إنشاء البيانات التجريبية
              </>
            )}
          </Button>

          {results && (
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold">نتائج الإعداد:</h3>
              <div className="space-y-2">
                {results.results?.map((result: any, index: number) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded border ${
                      result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-mono">{result.national_id}</span>
                    </div>
                    {result.success ? (
                      <span className="text-xs text-green-700">{result.email}</span>
                    ) : (
                      <span className="text-xs text-red-700">{result.error}</span>
                    )}
                  </div>
                ))}
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle>جاهز للاختبار!</AlertTitle>
                <AlertDescription>
                  يمكنك الآن تسجيل الدخول كأي مستفيد باستخدام رقم الهوية وكلمة المرور: Test@123456
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
