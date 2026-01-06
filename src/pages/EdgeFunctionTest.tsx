import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, RefreshCw, CheckCircle, XCircle, Clock, 
  Terminal, Copy, AlertTriangle, Zap, Database, Shield,
  Brain, Bell, FileText, Settings, Users, Building,
  CreditCard, Lock, Server, Activity, ChevronDown,
  PlayCircle, StopCircle, BarChart3, Loader2, LucideIcon
} from 'lucide-react';
import { toastSuccess, toastError } from '@/hooks/ui/use-toast';

// تعريف أنواع البيانات
interface EdgeFunctionDef {
  name: string;
  description: string;
  defaultBody: Record<string, unknown>;
}

interface EdgeFunctionCategory {
  label: string;
  icon: LucideIcon;
  color: string;
  functions: EdgeFunctionDef[];
}

// تصنيف جميع Edge Functions حسب الفئة
const EDGE_FUNCTIONS_BY_CATEGORY: Record<string, EdgeFunctionCategory> = {
  ai: {
    label: 'الذكاء الاصطناعي',
    icon: Brain,
    color: 'text-purple-500',
    functions: [
      { name: 'ai-system-audit', description: 'الفحص الذكي للنظام', defaultBody: { auditType: 'full', categories: ['database', 'tables', 'roles'] } },
      { name: 'chatbot', description: 'المساعد الذكي', defaultBody: { message: 'مرحباً، كيف يمكنني المساعدة؟' } },
      { name: 'generate-ai-insights', description: 'توليد الرؤى الذكية', defaultBody: { reportType: 'beneficiaries' } },
      { name: 'intelligent-search', description: 'البحث الذكي', defaultBody: { query: 'بحث تجريبي', type: 'beneficiaries' } },
      { name: 'property-ai-assistant', description: 'مساعد العقارات الذكي', defaultBody: { action: 'analyze_property', data: { name: 'عقار تجريبي', type: 'سكني', location: 'الرياض', monthly_rent: 5000, occupancy_rate: 90 } } },
    ]
  },
  database: {
    label: 'قاعدة البيانات',
    icon: Database,
    color: 'text-blue-500',
    functions: [
      { name: 'db-health-check', description: 'فحص صحة قاعدة البيانات', defaultBody: {} },
      { name: 'db-performance-stats', description: 'إحصائيات أداء قاعدة البيانات', defaultBody: {} },
      { name: 'run-vacuum', description: 'تنظيف قاعدة البيانات', defaultBody: {} },
      { name: 'backup-database', description: 'النسخ الاحتياطي', defaultBody: { backupType: 'full' } },
      { name: 'restore-database', description: 'استعادة النسخة الاحتياطية', defaultBody: { testMode: true } },
    ]
  },
  security: {
    label: 'الأمان',
    icon: Shield,
    color: 'text-red-500',
    functions: [
      { name: 'encrypt-file', description: 'تشفير الملفات', defaultBody: { ping: true } },
      { name: 'decrypt-file', description: 'فك تشفير الملفات', defaultBody: { ping: true } },
      { name: 'secure-delete-file', description: 'حذف آمن للملفات', defaultBody: { testMode: true, fileId: 'test-file-id' } },
      { name: 'check-leaked-password', description: 'فحص كلمات المرور المسربة', defaultBody: { password: 'test123' } },
      { name: 'biometric-auth', description: 'المصادقة البيومترية', defaultBody: { action: 'check', credentialId: 'test-credential-id', userId: 'test-user-id', challenge: 'test-challenge' } },
    ]
  },
  notifications: {
    label: 'الإشعارات',
    icon: Bell,
    color: 'text-yellow-500',
    functions: [
      { name: 'send-notification', description: 'إرسال إشعار', defaultBody: { userId: 'test', title: 'اختبار', message: 'رسالة اختبار' } },
      { name: 'send-push-notification', description: 'إشعار الدفع', defaultBody: { userId: 'test', title: 'اختبار', body: 'رسالة اختبار للإشعارات' } },
      { name: 'daily-notifications', description: 'الإشعارات اليومية', defaultBody: {} },
      { name: 'notify-admins', description: 'إشعار المديرين', defaultBody: { title: 'تنبيه اختباري', message: 'رسالة اختبار للمديرين', severity: 'info' } },
      { name: 'notify-disclosure-published', description: 'إشعار نشر الإفصاح', defaultBody: { testMode: true } },
      { name: 'send-slack-alert', description: 'تنبيه Slack', defaultBody: { message: 'اختبار', severity: 'info' } },
      { name: 'generate-smart-alerts', description: 'التنبيهات الذكية', defaultBody: {} },
      { name: 'contract-renewal-alerts', description: 'تنبيهات تجديد العقود', defaultBody: {} },
    ]
  },
  finance: {
    label: 'المالية',
    icon: CreditCard,
    color: 'text-green-500',
    functions: [
      { name: 'distribute-revenue', description: 'توزيع الإيرادات', defaultBody: { testMode: true, totalAmount: 1000, fiscalYearId: 'test-fiscal-year', distributionDate: new Date().toISOString().split('T')[0] } },
      { name: 'simulate-distribution', description: 'محاكاة التوزيع', defaultBody: { amount: 1000 } },
      { name: 'auto-create-journal', description: 'إنشاء قيد آلي', defaultBody: { trigger_event: 'payment', reference_id: 'test-ref', reference_type: 'payment', amount: 100 } },
      { name: 'calculate-cash-flow', description: 'حساب التدفقات النقدية', defaultBody: { period: 'monthly' } },
      { name: 'link-voucher-journal', description: 'ربط السند بالقيد', defaultBody: { voucher_id: 'test-voucher-id', create_journal: false } },
      { name: 'publish-fiscal-year', description: 'نشر السنة المالية', defaultBody: { fiscalYearId: 'test-fiscal-year-id', notifyHeirs: false } },
      { name: 'auto-close-fiscal-year', description: 'إقفال السنة المالية', defaultBody: { fiscal_year_id: 'test-fiscal-year-id', preview_only: true } },
      { name: 'zatca-submit', description: 'إرسال لزاتكا', defaultBody: { testMode: true, invoice_id: 'test-invoice-id', submission_type: 'reporting' } },
    ]
  },
  documents: {
    label: 'المستندات',
    icon: FileText,
    color: 'text-orange-500',
    functions: [
      { name: 'ocr-document', description: 'قراءة المستندات OCR', defaultBody: { ping: true } },
      { name: 'extract-invoice-data', description: 'استخراج بيانات الفاتورة', defaultBody: { ping: true } },
      { name: 'auto-classify-document', description: 'تصنيف المستندات', defaultBody: { documentId: 'test-document-id', useAI: false } },
      { name: 'backfill-rental-documents', description: 'استكمال مستندات الإيجار', defaultBody: {} },
      { name: 'send-invoice-email', description: 'إرسال الفاتورة بالبريد', defaultBody: { testMode: true, invoiceId: 'test', customerEmail: 'test@test.com', customerName: 'اختبار', invoiceNumber: 'INV-001', totalAmount: 100 } },
    ]
  },
  users: {
    label: 'المستخدمين',
    icon: Users,
    color: 'text-indigo-500',
    functions: [
      { name: 'create-beneficiary-accounts', description: 'إنشاء حسابات المستفيدين', defaultBody: { beneficiaryIds: [] } },
      { name: 'admin-manage-beneficiary-password', description: 'إدارة كلمة مرور المستفيد', defaultBody: { action: 'reset-password', beneficiaryId: 'test-beneficiary-id', newPassword: 'Test@123456' } },
      { name: 'reset-user-password', description: 'إعادة تعيين كلمة المرور', defaultBody: { user_id: 'test-user-id', new_password: 'Test@123456' } },
      { name: 'update-user-email', description: 'تحديث البريد الإلكتروني', defaultBody: { userId: 'test-user-id', newEmail: 'test@test.com' } },
    ]
  },
  maintenance: {
    label: 'الصيانة',
    icon: Settings,
    color: 'text-gray-500',
    functions: [
      { name: 'weekly-maintenance', description: 'الصيانة الأسبوعية', defaultBody: {} },
      { name: 'cleanup-old-files', description: 'تنظيف الملفات القديمة', defaultBody: { testMode: true } },
      { name: 'cleanup-sensitive-files', description: 'تنظيف الملفات الحساسة', defaultBody: {} },
      { name: 'scheduled-cleanup', description: 'التنظيف المجدول', defaultBody: {} },
      { name: 'execute-auto-fix', description: 'تنفيذ الإصلاح التلقائي', defaultBody: { fixId: 'test' } },
    ]
  },
  reports: {
    label: 'التقارير',
    icon: BarChart3,
    color: 'text-cyan-500',
    functions: [
      { name: 'generate-scheduled-report', description: 'توليد تقرير مجدول', defaultBody: { reportType: 'monthly' } },
      { name: 'weekly-report', description: 'التقرير الأسبوعي', defaultBody: {} },
      { name: 'generate-distribution-summary', description: 'ملخص التوزيعات', defaultBody: { period_start: '2024-01-01', period_end: '2024-12-31', distribution_type: 'سنوي' } },
    ]
  },
  support: {
    label: 'الدعم والسجلات',
    icon: Server,
    color: 'text-pink-500',
    functions: [
      { name: 'support-auto-escalate', description: 'التصعيد التلقائي للدعم', defaultBody: {} },
      { name: 'log-error', description: 'تسجيل الأخطاء', defaultBody: { error: 'test error', source: 'test' } },
      { name: 'test-auth', description: 'اختبار المصادقة', defaultBody: { action: 'health-check' } },
    ]
  },
};

// حساب إجمالي الوظائف
const ALL_FUNCTIONS: EdgeFunctionDef[] = Object.values(EDGE_FUNCTIONS_BY_CATEGORY).flatMap(cat => cat.functions);
const TOTAL_FUNCTIONS = ALL_FUNCTIONS.length;

interface TestResult {
  functionName: string;
  success: boolean;
  statusCode?: number;
  responseTime: number;
  response?: any;
  error?: string;
  timestamp: Date;
}

interface BatchTestProgress {
  total: number;
  completed: number;
  passed: number;
  failed: number;
  currentFunction: string;
}

export default function EdgeFunctionTest() {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [requestBody, setRequestBody] = useState<string>('{}');
  const [isLoading, setIsLoading] = useState(false);
  const [isBatchTesting, setIsBatchTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [batchResults, setBatchResults] = useState<TestResult[]>([]);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState<BatchTestProgress | null>(null);
  const [activeTab, setActiveTab] = useState<string>('single');

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    setTestLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const testSingleFunction = async (funcName: string, body: any): Promise<TestResult> => {
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase.functions.invoke(funcName, { body });
      const responseTime = Math.round(performance.now() - startTime);

      if (error) {
        return {
          functionName: funcName,
          success: false,
          responseTime,
          error: error.message,
          timestamp: new Date()
        };
      }

      return {
        functionName: funcName,
        success: true,
        responseTime,
        response: data,
        timestamp: new Date()
      };
    } catch (err: any) {
      return {
        functionName: funcName,
        success: false,
        responseTime: Math.round(performance.now() - startTime),
        error: err.message,
        timestamp: new Date()
      };
    }
  };

  const handleSingleTest = async () => {
    if (!selectedFunction) {
      toastError('اختر Edge Function للاختبار');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setTestLogs([]);
    addLog(`بدء اختبار: ${selectedFunction}`);

    let body = {};
    try {
      body = JSON.parse(requestBody);
      addLog('تم تحليل Request Body بنجاح');
    } catch {
      addLog('⚠️ Request Body غير صالح، استخدام كائن فارغ');
    }

    addLog('إرسال الطلب...');
    const testResult = await testSingleFunction(selectedFunction, body);
    
    if (testResult.success) {
      addLog(`✅ نجاح! زمن الاستجابة: ${testResult.responseTime}ms`);
      toastSuccess(`تم الاختبار بنجاح في ${testResult.responseTime}ms`);
    } else {
      addLog(`❌ فشل: ${testResult.error}`);
      toastError(`فشل الاختبار: ${testResult.error}`);
    }

    setResult(testResult);
    setIsLoading(false);
  };

  const handleBatchTest = async () => {
    const functionsToTest = selectedCategory === 'all' 
      ? ALL_FUNCTIONS 
      : EDGE_FUNCTIONS_BY_CATEGORY[selectedCategory as keyof typeof EDGE_FUNCTIONS_BY_CATEGORY]?.functions || [];

    if (functionsToTest.length === 0) {
      toastError('لا توجد وظائف للاختبار');
      return;
    }

    setIsBatchTesting(true);
    setBatchResults([]);
    setTestLogs([]);
    
    const progress: BatchTestProgress = {
      total: functionsToTest.length,
      completed: 0,
      passed: 0,
      failed: 0,
      currentFunction: ''
    };
    setBatchProgress(progress);

    addLog(`🚀 بدء اختبار ${functionsToTest.length} وظيفة...`);

    const results: TestResult[] = [];

    for (const func of functionsToTest) {
      progress.currentFunction = func.name;
      setBatchProgress({ ...progress });
      addLog(`اختبار: ${func.name}...`);

      const testResult = await testSingleFunction(func.name, func.defaultBody || {});
      results.push(testResult);

      progress.completed++;
      if (testResult.success) {
        progress.passed++;
        addLog(`✅ ${func.name}: نجح (${testResult.responseTime}ms)`);
      } else {
        progress.failed++;
        addLog(`❌ ${func.name}: فشل - ${testResult.error}`);
      }
      setBatchProgress({ ...progress });
      setBatchResults([...results]);

      // تأخير صغير بين الاختبارات لتجنب الإرهاق
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    addLog(`\n📊 انتهى الاختبار: ${progress.passed} نجح، ${progress.failed} فشل`);
    
    if (progress.failed === 0) {
      toastSuccess(`جميع الاختبارات نجحت (${progress.passed}/${progress.total})`);
    } else {
      toastError(`${progress.failed} اختبار فشل من ${progress.total}`);
    }

    setIsBatchTesting(false);
  };

  const stopBatchTest = () => {
    setIsBatchTesting(false);
    addLog('⏹️ تم إيقاف الاختبار');
  };

  const getDefaultBody = (funcName: string): string => {
    const func = ALL_FUNCTIONS.find(f => f.name === funcName);
    return JSON.stringify(func?.defaultBody || {}, null, 2);
  };

  const copyResponse = () => {
    if (result?.response) {
      navigator.clipboard.writeText(JSON.stringify(result.response, null, 2));
      toastSuccess('تم نسخ الاستجابة');
    }
  };

  const exportResults = () => {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: batchResults.length,
      passed: batchResults.filter(r => r.success).length,
      failed: batchResults.filter(r => !r.success).length,
      avgResponseTime: Math.round(batchResults.reduce((acc, r) => acc + r.responseTime, 0) / batchResults.length),
      results: batchResults
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edge-functions-test-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toastSuccess('تم تصدير التقرير');
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            اختبار Edge Functions الشامل
          </h1>
          <p className="text-muted-foreground mt-1">
            اختبر جميع وظائف الخادم ({TOTAL_FUNCTIONS} وظيفة) قبل النشر
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {TOTAL_FUNCTIONS} وظيفة
          </Badge>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(EDGE_FUNCTIONS_BY_CATEGORY).map(([key, cat]) => {
          const Icon = cat.icon;
          const categoryResults = batchResults.filter(r => 
            cat.functions.some(f => f.name === r.functionName)
          );
          const passed = categoryResults.filter(r => r.success).length;
          const failed = categoryResults.filter(r => !r.success).length;
          
          return (
            <Card key={key} className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => {
                setSelectedCategory(key);
                setActiveTab('batch');
              }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-5 w-5 ${cat.color}`} />
                  <span className="font-medium text-sm">{cat.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{cat.functions.length}</span>
                  {categoryResults.length > 0 && (
                    <div className="flex gap-1">
                      {passed > 0 && <Badge variant="default" className="bg-green-500">{passed}</Badge>}
                      {failed > 0 && <Badge variant="destructive">{failed}</Badge>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* التبويبات */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            اختبار فردي
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            اختبار شامل
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            النتائج ({batchResults.length})
          </TabsTrigger>
        </TabsList>

        {/* اختبار فردي */}
        <TabsContent value="single">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <label className="text-sm font-medium">الفئة</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الفئات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الفئات</SelectItem>
                      {Object.entries(EDGE_FUNCTIONS_BY_CATEGORY).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <cat.icon className={`h-4 w-4 ${cat.color}`} />
                            {cat.label} ({cat.functions.length})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                      {(selectedCategory === 'all' ? ALL_FUNCTIONS : 
                        EDGE_FUNCTIONS_BY_CATEGORY[selectedCategory as keyof typeof EDGE_FUNCTIONS_BY_CATEGORY]?.functions || []
                      ).map(func => (
                        <SelectItem key={func.name} value={func.name}>
                          {func.description} ({func.name})
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
                  onClick={handleSingleTest} 
                  disabled={isLoading || !selectedFunction}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ms-2 h-5 w-5 animate-spin" />
                      جاري الاختبار...
                    </>
                  ) : (
                    <>
                      <Play className="ms-2 h-5 w-5" />
                      تشغيل الاختبار
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

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

                    {result.response && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Response</label>
                          <Button size="sm" variant="ghost" onClick={copyResponse}>
                            <Copy className="h-4 w-4 ms-1" />
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
        </TabsContent>

        {/* اختبار شامل */}
        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                اختبار شامل للوظائف
              </CardTitle>
              <CardDescription>
                اختبر جميع وظائف فئة معينة أو جميع الفئات دفعة واحدة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      جميع الفئات ({TOTAL_FUNCTIONS} وظيفة)
                    </SelectItem>
                    {Object.entries(EDGE_FUNCTIONS_BY_CATEGORY).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <cat.icon className={`h-4 w-4 ${cat.color}`} />
                          {cat.label} ({cat.functions.length})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isBatchTesting ? (
                  <Button variant="destructive" onClick={stopBatchTest}>
                    <StopCircle className="ms-2 h-5 w-5" />
                    إيقاف الاختبار
                  </Button>
                ) : (
                  <Button onClick={handleBatchTest} size="lg">
                    <PlayCircle className="ms-2 h-5 w-5" />
                    بدء الاختبار الشامل
                  </Button>
                )}

                {batchResults.length > 0 && (
                  <Button variant="outline" onClick={exportResults}>
                    <FileText className="ms-2 h-4 w-4" />
                    تصدير التقرير
                  </Button>
                )}
              </div>

              {/* شريط التقدم */}
              {batchProgress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>التقدم: {batchProgress.completed}/{batchProgress.total}</span>
                    <span className="text-muted-foreground">
                      {batchProgress.currentFunction && `جاري: ${batchProgress.currentFunction}`}
                    </span>
                  </div>
                  <Progress value={(batchProgress.completed / batchProgress.total) * 100} />
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-500">✅ نجح: {batchProgress.passed}</span>
                    <span className="text-destructive">❌ فشل: {batchProgress.failed}</span>
                  </div>
                </div>
              )}

              {/* قائمة الوظائف للاختبار */}
              <Accordion type="multiple" className="w-full">
                {Object.entries(EDGE_FUNCTIONS_BY_CATEGORY)
                  .filter(([key]) => selectedCategory === 'all' || key === selectedCategory)
                  .map(([key, cat]) => {
                    const Icon = cat.icon;
                    const categoryResults = batchResults.filter(r => 
                      cat.functions.some(f => f.name === r.functionName)
                    );
                    
                    return (
                      <AccordionItem key={key} value={key}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${cat.color}`} />
                            <span className="font-medium">{cat.label}</span>
                            <Badge variant="outline">{cat.functions.length}</Badge>
                            {categoryResults.length > 0 && (
                              <div className="flex gap-1 mr-4">
                                <Badge variant="default" className="bg-green-500">
                                  {categoryResults.filter(r => r.success).length}
                                </Badge>
                                {categoryResults.some(r => !r.success) && (
                                  <Badge variant="destructive">
                                    {categoryResults.filter(r => !r.success).length}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                            {cat.functions.map(func => {
                              const funcResult = batchResults.find(r => r.functionName === func.name);
                              return (
                                <div 
                                  key={func.name}
                                  className={`p-3 rounded-lg border flex items-center justify-between ${
                                    funcResult?.success ? 'bg-green-500/10 border-green-500/30' :
                                    funcResult?.error ? 'bg-destructive/10 border-destructive/30' :
                                    'bg-muted/50'
                                  }`}
                                >
                                  <div>
                                    <div className="font-medium text-sm">{func.description}</div>
                                    <div className="text-xs text-muted-foreground">{func.name}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {funcResult ? (
                                      <>
                                        {funcResult.success ? (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <XCircle className="h-4 w-4 text-destructive" />
                                        )}
                                        <Badge variant="outline">{funcResult.responseTime}ms</Badge>
                                      </>
                                    ) : isBatchTesting && batchProgress?.currentFunction === func.name ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* النتائج */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  نتائج الاختبار
                </span>
                {batchResults.length > 0 && (
                  <Button variant="outline" size="sm" onClick={exportResults}>
                    <FileText className="ms-2 h-4 w-4" />
                    تصدير
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {batchResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد نتائج بعد. قم بتشغيل اختبار شامل لرؤية النتائج.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* ملخص */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="bg-muted/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold">{batchResults.length}</div>
                        <div className="text-sm text-muted-foreground">إجمالي</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-500/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-500">
                          {batchResults.filter(r => r.success).length}
                        </div>
                        <div className="text-sm text-muted-foreground">نجح</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-destructive/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-destructive">
                          {batchResults.filter(r => !r.success).length}
                        </div>
                        <div className="text-sm text-muted-foreground">فشل</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-500">
                          {Math.round(batchResults.reduce((acc, r) => acc + r.responseTime, 0) / batchResults.length)}ms
                        </div>
                        <div className="text-sm text-muted-foreground">متوسط الزمن</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* قائمة النتائج */}
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {batchResults.map((r, i) => (
                        <div 
                          key={i}
                          className={`p-3 rounded-lg border flex items-center justify-between ${
                            r.success ? 'bg-green-500/5 border-green-500/20' : 'bg-destructive/5 border-destructive/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {r.success ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            <div>
                              <div className="font-medium">{r.functionName}</div>
                              {r.error && (
                                <div className="text-xs text-destructive">{r.error}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{r.responseTime}ms</Badge>
                            <span className="text-xs text-muted-foreground">
                              {r.timestamp.toLocaleTimeString('ar-SA')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* سجل الاختبار */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            سجل الاختبار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48 rounded border bg-muted/30">
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
                      log.includes('🚀') ? 'text-blue-500' :
                      log.includes('📊') ? 'text-purple-500' :
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
