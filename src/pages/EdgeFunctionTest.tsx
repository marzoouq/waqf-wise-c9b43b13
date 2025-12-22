import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, RefreshCw, CheckCircle, XCircle, Clock, 
  Terminal, Copy, AlertTriangle, Zap
} from 'lucide-react';
import { toastSuccess, toastError } from '@/hooks/ui/use-toast';

// قائمة Edge Functions المتاحة للاختبار
const EDGE_FUNCTIONS = [
  { name: 'ai-system-audit', description: 'الفحص الذكي للنظام', requiresAuth: true },
  { name: 'db-health-check', description: 'فحص صحة قاعدة البيانات', requiresAuth: true },
  { name: 'db-performance-stats', description: 'إحصائيات أداء قاعدة البيانات', requiresAuth: true },
  { name: 'chatbot', description: 'المساعد الذكي', requiresAuth: true },
  { name: 'generate-ai-insights', description: 'توليد الرؤى الذكية', requiresAuth: true },
  { name: 'generate-smart-alerts', description: 'توليد التنبيهات الذكية', requiresAuth: true },
  { name: 'intelligent-search', description: 'البحث الذكي', requiresAuth: true },
];

interface TestResult {
  success: boolean;
  statusCode?: number;
  responseTime: number;
  response?: any;
  error?: string;
  logs: string[];
}

export default function EdgeFunctionTest() {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>('{}');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [testLogs, setTestLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    setTestLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleTest = async () => {
    if (!selectedFunction) {
      toastError('اختر Edge Function للاختبار');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setTestLogs([]);

    addLog(`بدء اختبار: ${selectedFunction}`);

    try {
      // تحليل الـ body
      let body = {};
      try {
        body = JSON.parse(requestBody);
        addLog('تم تحليل الـ Request Body بنجاح');
      } catch {
        addLog('⚠️ Request Body غير صالح، استخدام كائن فارغ');
      }

      const startTime = performance.now();
      addLog('إرسال الطلب إلى Edge Function...');

      const { data, error } = await supabase.functions.invoke(selectedFunction, {
        body
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (error) {
        addLog(`❌ خطأ: ${error.message}`);
        setResult({
          success: false,
          responseTime,
          error: error.message,
          logs: testLogs
        });
        toastError(`فشل الاختبار: ${error.message}`);
      } else {
        addLog(`✅ نجاح! زمن الاستجابة: ${responseTime}ms`);
        addLog(`حجم الاستجابة: ${JSON.stringify(data).length} حرف`);
        setResult({
          success: true,
          responseTime,
          response: data,
          logs: testLogs
        });
        toastSuccess(`تم الاختبار بنجاح في ${responseTime}ms`);
      }
    } catch (err: any) {
      addLog(`❌ خطأ غير متوقع: ${err.message}`);
      setResult({
        success: false,
        responseTime: 0,
        error: err.message,
        logs: testLogs
      });
      toastError('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    if (result?.response) {
      navigator.clipboard.writeText(JSON.stringify(result.response, null, 2));
      toastSuccess('تم نسخ الاستجابة');
    }
  };

  const getDefaultBody = (funcName: string): string => {
    switch (funcName) {
      case 'ai-system-audit':
        return JSON.stringify({ auditType: 'full', categories: ['database', 'tables', 'roles'] }, null, 2);
      case 'chatbot':
        return JSON.stringify({ message: 'مرحباً، كيف يمكنني المساعدة؟' }, null, 2);
      case 'generate-ai-insights':
        return JSON.stringify({ reportType: 'beneficiaries' }, null, 2);
      case 'intelligent-search':
        return JSON.stringify({ query: 'بحث تجريبي', type: 'beneficiaries' }, null, 2);
      default:
        return '{}';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            اختبار Edge Functions
          </h1>
          <p className="text-muted-foreground mt-1">اختبر وظائف الخادم مباشرة وشاهد النتائج</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* قسم الإعدادات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              إعدادات الاختبار
            </CardTitle>
            <CardDescription>اختر الوظيفة وحدد البيانات المطلوبة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Edge Function</label>
              <Select 
                value={selectedFunction} 
                onValueChange={(val) => {
                  setSelectedFunction(val);
                  setRequestBody(getDefaultBody(val));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر Edge Function" />
                </SelectTrigger>
                <SelectContent>
                  {EDGE_FUNCTIONS.map(func => (
                    <SelectItem key={func.name} value={func.name}>
                      <div className="flex items-center gap-2">
                        <span>{func.description}</span>
                        {func.requiresAuth && (
                          <Badge variant="outline" className="text-xs">يتطلب مصادقة</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Request Body (JSON)</label>
              <Textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="font-mono text-sm h-40"
                dir="ltr"
                placeholder="{}"
              />
            </div>

            <Button 
              onClick={handleTest} 
              disabled={isLoading || !selectedFunction}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="ml-2 h-5 w-5 animate-spin" />
                  جاري الاختبار...
                </>
              ) : (
                <>
                  <Play className="ml-2 h-5 w-5" />
                  تشغيل الاختبار
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* قسم النتائج */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {result?.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : result?.error ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground" />
                )}
                نتيجة الاختبار
              </span>
              {result && (
                <Badge variant={result.success ? 'default' : 'destructive'}>
                  {result.responseTime}ms
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-12 text-muted-foreground">
                <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>اختر Edge Function واضغط على "تشغيل الاختبار"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* ملخص النتيجة */}
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className="font-medium">
                      {result.success ? 'نجح الاختبار' : 'فشل الاختبار'}
                    </span>
                  </div>
                  {result.error && (
                    <p className="text-sm text-destructive mt-2">{result.error}</p>
                  )}
                </div>

                {/* الاستجابة */}
                {result.response && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Response</label>
                      <Button size="sm" variant="ghost" onClick={copyResponse}>
                        <Copy className="h-4 w-4 ml-1" />
                        نسخ
                      </Button>
                    </div>
                    <ScrollArea className="h-60 rounded border bg-muted/50">
                      <pre className="p-4 text-xs font-mono whitespace-pre-wrap" dir="ltr">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* سجل الاختبار */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            سجل الاختبار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-40 rounded border bg-muted/30">
            <div className="p-4 space-y-1 font-mono text-sm" dir="ltr">
              {testLogs.length === 0 ? (
                <p className="text-muted-foreground">لا توجد سجلات بعد...</p>
              ) : (
                testLogs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`${
                      log.includes('❌') ? 'text-destructive' : 
                      log.includes('✅') ? 'text-green-500' :
                      log.includes('⚠️') ? 'text-yellow-500' :
                      'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
