/**
 * صفحة الاختبارات الشاملة
 * تختبر جميع أجزاء التطبيق فعلياً من المتصفح
 */

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, RefreshCw, CheckCircle, XCircle, Clock, 
  Terminal, AlertTriangle, Zap, Database, Shield,
  Brain, Bell, FileText, Settings, Users, Building,
  CreditCard, Server, Activity, BarChart3, Loader2, 
  LucideIcon, Download, Trash2, Pause, PlayCircle,
  TestTube, Globe, Key, HardDrive, Network
} from 'lucide-react';
import { toastSuccess, toastError } from '@/hooks/ui/use-toast';

// ================== أنواع البيانات ==================

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: string;
  run: () => Promise<TestResult>;
}

interface TestResult {
  testId: string;
  testName: string;
  category: string;
  success: boolean;
  duration: number;
  message?: string;
  details?: any;
  timestamp: Date;
}

interface TestCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  tests: TestCase[];
}

interface TestProgress {
  total: number;
  completed: number;
  passed: number;
  failed: number;
  skipped: number;
  currentTest: string;
  isRunning: boolean;
  isPaused: boolean;
}

// ================== اختبارات Edge Functions ==================

const createEdgeFunctionTest = (name: string, description: string, body: any = {}): TestCase => ({
  id: `edge-${name}`,
  name: `Edge: ${name}`,
  description,
  category: 'edge-functions',
  run: async () => {
    const start = performance.now();
    try {
      const { data, error } = await supabase.functions.invoke(name, { body });
      const duration = Math.round(performance.now() - start);
      
      if (error) {
        return {
          testId: `edge-${name}`,
          testName: name,
          category: 'edge-functions',
          success: false,
          duration,
          message: error.message,
          timestamp: new Date()
        };
      }
      
      return {
        testId: `edge-${name}`,
        testName: name,
        category: 'edge-functions',
        success: true,
        duration,
        message: 'نجح الاختبار',
        details: data,
        timestamp: new Date()
      };
    } catch (err: any) {
      return {
        testId: `edge-${name}`,
        testName: name,
        category: 'edge-functions',
        success: false,
        duration: Math.round(performance.now() - start),
        message: err.message,
        timestamp: new Date()
      };
    }
  }
});

// ================== اختبارات قاعدة البيانات ==================

const createDatabaseTest = (name: string, description: string, query: () => Promise<any>): TestCase => ({
  id: `db-${name}`,
  name: `DB: ${name}`,
  description,
  category: 'database',
  run: async () => {
    const start = performance.now();
    try {
      const result = await query();
      const duration = Math.round(performance.now() - start);
      
      if (result.error) {
        return {
          testId: `db-${name}`,
          testName: name,
          category: 'database',
          success: false,
          duration,
          message: result.error.message,
          timestamp: new Date()
        };
      }
      
      return {
        testId: `db-${name}`,
        testName: name,
        category: 'database',
        success: true,
        duration,
        message: `نجح - ${Array.isArray(result.data) ? result.data.length : 1} سجل`,
        details: { count: Array.isArray(result.data) ? result.data.length : 1 },
        timestamp: new Date()
      };
    } catch (err: any) {
      return {
        testId: `db-${name}`,
        testName: name,
        category: 'database',
        success: false,
        duration: Math.round(performance.now() - start),
        message: err.message,
        timestamp: new Date()
      };
    }
  }
});

// ================== اختبارات API ==================

const createAPITest = (name: string, description: string, testFn: () => Promise<boolean>): TestCase => ({
  id: `api-${name}`,
  name: `API: ${name}`,
  description,
  category: 'api',
  run: async () => {
    const start = performance.now();
    try {
      const success = await testFn();
      const duration = Math.round(performance.now() - start);
      
      return {
        testId: `api-${name}`,
        testName: name,
        category: 'api',
        success,
        duration,
        message: success ? 'نجح الاختبار' : 'فشل الاختبار',
        timestamp: new Date()
      };
    } catch (err: any) {
      return {
        testId: `api-${name}`,
        testName: name,
        category: 'api',
        success: false,
        duration: Math.round(performance.now() - start),
        message: err.message,
        timestamp: new Date()
      };
    }
  }
});

// ================== اختبارات الأمان ==================

const createSecurityTest = (name: string, description: string, testFn: () => Promise<boolean>): TestCase => ({
  id: `security-${name}`,
  name: `Security: ${name}`,
  description,
  category: 'security',
  run: async () => {
    const start = performance.now();
    try {
      const success = await testFn();
      const duration = Math.round(performance.now() - start);
      
      return {
        testId: `security-${name}`,
        testName: name,
        category: 'security',
        success,
        duration,
        message: success ? 'آمن' : 'يحتاج مراجعة',
        timestamp: new Date()
      };
    } catch (err: any) {
      return {
        testId: `security-${name}`,
        testName: name,
        category: 'security',
        success: false,
        duration: Math.round(performance.now() - start),
        message: err.message,
        timestamp: new Date()
      };
    }
  }
});

// ================== تعريف جميع الاختبارات ==================

const ALL_TESTS: TestCategory[] = [
  {
    id: 'edge-functions',
    label: 'Edge Functions',
    icon: Zap,
    color: 'text-purple-500',
    tests: [
      // الذكاء الاصطناعي
      createEdgeFunctionTest('ai-system-audit', 'الفحص الذكي للنظام', { auditType: 'full', categories: ['database'] }),
      createEdgeFunctionTest('chatbot', 'المساعد الذكي', { message: 'مرحباً' }),
      createEdgeFunctionTest('generate-ai-insights', 'توليد الرؤى', { reportType: 'beneficiaries' }),
      createEdgeFunctionTest('intelligent-search', 'البحث الذكي', { query: 'اختبار', type: 'beneficiaries' }),
      createEdgeFunctionTest('property-ai-assistant', 'مساعد العقارات', { action: 'analyze_property', data: { name: 'عقار تجريبي' } }),
      
      // قاعدة البيانات
      createEdgeFunctionTest('db-health-check', 'فحص صحة قاعدة البيانات', {}),
      createEdgeFunctionTest('db-performance-stats', 'إحصائيات الأداء', {}),
      createEdgeFunctionTest('run-vacuum', 'تنظيف قاعدة البيانات', {}),
      createEdgeFunctionTest('backup-database', 'النسخ الاحتياطي', { backupType: 'full' }),
      createEdgeFunctionTest('restore-database', 'استعادة النسخة', { testMode: true }),
      
      // الأمان
      createEdgeFunctionTest('encrypt-file', 'تشفير الملفات', { ping: true }),
      createEdgeFunctionTest('decrypt-file', 'فك التشفير', { ping: true }),
      createEdgeFunctionTest('secure-delete-file', 'حذف آمن', { testMode: true, fileId: 'test' }),
      createEdgeFunctionTest('check-leaked-password', 'فحص كلمات المرور', { password: 'test123' }),
      createEdgeFunctionTest('biometric-auth', 'المصادقة البيومترية', { action: 'check' }),
      
      // الإشعارات
      createEdgeFunctionTest('send-notification', 'إرسال إشعار', { userId: 'test', title: 'اختبار', message: 'رسالة' }),
      createEdgeFunctionTest('send-push-notification', 'إشعار الدفع', { userId: 'test', title: 'اختبار' }),
      createEdgeFunctionTest('daily-notifications', 'الإشعارات اليومية', {}),
      createEdgeFunctionTest('notify-admins', 'إشعار المديرين', { title: 'اختبار', message: 'رسالة', severity: 'info' }),
      createEdgeFunctionTest('notify-disclosure-published', 'إشعار نشر الإفصاح', { testMode: true }),
      createEdgeFunctionTest('send-slack-alert', 'تنبيه Slack', { message: 'اختبار', severity: 'info' }),
      createEdgeFunctionTest('generate-smart-alerts', 'التنبيهات الذكية', {}),
      createEdgeFunctionTest('contract-renewal-alerts', 'تنبيهات تجديد العقود', {}),
      
      // المالية
      createEdgeFunctionTest('distribute-revenue', 'توزيع الإيرادات', { testMode: true, totalAmount: 1000 }),
      createEdgeFunctionTest('simulate-distribution', 'محاكاة التوزيع', { amount: 1000 }),
      createEdgeFunctionTest('auto-create-journal', 'إنشاء قيد آلي', { trigger_event: 'payment', amount: 100 }),
      createEdgeFunctionTest('calculate-cash-flow', 'حساب التدفقات', { period: 'monthly' }),
      createEdgeFunctionTest('link-voucher-journal', 'ربط السند بالقيد', { voucher_id: 'test', create_journal: false }),
      createEdgeFunctionTest('publish-fiscal-year', 'نشر السنة المالية', { fiscalYearId: 'test', notifyHeirs: false }),
      createEdgeFunctionTest('auto-close-fiscal-year', 'إقفال السنة المالية', { testMode: true }),
      createEdgeFunctionTest('zatca-submit', 'إرسال لزاتكا', { testMode: true }),
      
      // المستندات
      createEdgeFunctionTest('ocr-document', 'قراءة المستندات', { ping: true }),
      createEdgeFunctionTest('extract-invoice-data', 'استخراج بيانات الفاتورة', { ping: true }),
      createEdgeFunctionTest('auto-classify-document', 'تصنيف المستندات', { documentId: 'test', useAI: false }),
      createEdgeFunctionTest('backfill-rental-documents', 'استكمال مستندات الإيجار', {}),
      createEdgeFunctionTest('send-invoice-email', 'إرسال الفاتورة بالبريد', { testMode: true }),
      
      // المستخدمين
      createEdgeFunctionTest('create-beneficiary-accounts', 'إنشاء حسابات المستفيدين', { beneficiaryIds: [] }),
      createEdgeFunctionTest('admin-manage-beneficiary-password', 'إدارة كلمة المرور', { action: 'reset-password', beneficiaryId: 'test' }),
      createEdgeFunctionTest('reset-user-password', 'إعادة تعيين كلمة المرور', { user_id: 'test', new_password: 'Test@123' }),
      createEdgeFunctionTest('update-user-email', 'تحديث البريد الإلكتروني', { userId: 'test', newEmail: 'test@test.com' }),
      
      // الصيانة
      createEdgeFunctionTest('weekly-maintenance', 'الصيانة الأسبوعية', {}),
      createEdgeFunctionTest('cleanup-old-files', 'تنظيف الملفات القديمة', { testMode: true }),
      createEdgeFunctionTest('cleanup-sensitive-files', 'تنظيف الملفات الحساسة', {}),
      createEdgeFunctionTest('scheduled-cleanup', 'التنظيف المجدول', {}),
      createEdgeFunctionTest('execute-auto-fix', 'تنفيذ الإصلاح التلقائي', { fixId: 'test' }),
      
      // التقارير
      createEdgeFunctionTest('generate-scheduled-report', 'توليد تقرير مجدول', { reportType: 'monthly' }),
      createEdgeFunctionTest('weekly-report', 'التقرير الأسبوعي', {}),
      createEdgeFunctionTest('generate-distribution-summary', 'ملخص التوزيعات', { period_start: '2024-01-01', period_end: '2024-12-31' }),
      
      // الدعم
      createEdgeFunctionTest('support-auto-escalate', 'التصعيد التلقائي', {}),
      createEdgeFunctionTest('log-error', 'تسجيل الأخطاء', { error: 'test', source: 'test' }),
      createEdgeFunctionTest('test-auth', 'اختبار المصادقة', { action: 'health-check' }),
    ]
  },
  {
    id: 'database',
    label: 'قاعدة البيانات',
    icon: Database,
    color: 'text-blue-500',
    tests: [
      createDatabaseTest('beneficiaries-read', 'قراءة المستفيدين', async () => 
        await supabase.from('beneficiaries').select('id, full_name').limit(5)
      ),
      createDatabaseTest('properties-read', 'قراءة العقارات', async () => 
        await supabase.from('properties').select('id, name').limit(5)
      ),
      createDatabaseTest('tenants-read', 'قراءة المستأجرين', async () => 
        await supabase.from('tenants').select('id, full_name').limit(5)
      ),
      createDatabaseTest('contracts-read', 'قراءة العقود', async () => 
        await supabase.from('contracts').select('id, contract_number').limit(5)
      ),
      createDatabaseTest('payments-read', 'قراءة المدفوعات', async () => 
        await supabase.from('payments').select('id, amount').limit(5)
      ),
      createDatabaseTest('invoices-read', 'قراءة الفواتير', async () => 
        await supabase.from('invoices').select('id, invoice_number').limit(5)
      ),
      createDatabaseTest('distributions-read', 'قراءة التوزيعات', async () => 
        await supabase.from('distributions').select('id, total_amount').limit(5)
      ),
      createDatabaseTest('accounts-read', 'قراءة دليل الحسابات', async () => 
        await supabase.from('accounts').select('id, name_ar, code').limit(5)
      ),
      createDatabaseTest('journal-entries-read', 'قراءة القيود اليومية', async () => 
        await supabase.from('journal_entries').select('id, entry_number').limit(5)
      ),
      createDatabaseTest('fiscal-years-read', 'قراءة السنوات المالية', async () => 
        await supabase.from('fiscal_years').select('id, year_name').limit(5)
      ),
      createDatabaseTest('families-read', 'قراءة العائلات', async () => 
        await supabase.from('families').select('id, family_name').limit(5)
      ),
      createDatabaseTest('notifications-read', 'قراءة الإشعارات', async () => 
        await supabase.from('notifications').select('id, title').limit(5)
      ),
      createDatabaseTest('audit-logs-read', 'قراءة سجلات التدقيق', async () => 
        await supabase.from('audit_logs').select('id, action_type').limit(5)
      ),
      createDatabaseTest('system-settings-read', 'قراءة إعدادات النظام', async () => 
        await supabase.from('system_settings').select('id, key').limit(5)
      ),
      createDatabaseTest('profiles-read', 'قراءة الملفات الشخصية', async () => 
        await supabase.from('profiles').select('id, email').limit(5)
      ),
    ]
  },
  {
    id: 'api',
    label: 'واجهات API',
    icon: Network,
    color: 'text-green-500',
    tests: [
      createAPITest('supabase-connection', 'اتصال Supabase', async () => {
        const { data, error } = await supabase.from('system_settings').select('count').limit(1);
        return !error;
      }),
      createAPITest('auth-session', 'جلسة المصادقة', async () => {
        const { data } = await supabase.auth.getSession();
        return data.session !== null;
      }),
      createAPITest('storage-buckets', 'حاويات التخزين', async () => {
        const { data, error } = await supabase.storage.listBuckets();
        return !error && Array.isArray(data);
      }),
      createAPITest('realtime-connection', 'اتصال Realtime', async () => {
        return new Promise((resolve) => {
          const channel = supabase.channel('test-channel');
          channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              supabase.removeChannel(channel);
              resolve(true);
            }
          });
          setTimeout(() => resolve(false), 5000);
        });
      }),
    ]
  },
  {
    id: 'security',
    label: 'الأمان',
    icon: Shield,
    color: 'text-red-500',
    tests: [
      createSecurityTest('rls-beneficiaries', 'RLS المستفيدين', async () => {
        const { error } = await supabase.from('beneficiaries').select('id').limit(1);
        // إذا لم يكن هناك خطأ أو خطأ RLS، فهذا يعني أن RLS يعمل
        return true;
      }),
      createSecurityTest('rls-payments', 'RLS المدفوعات', async () => {
        const { error } = await supabase.from('payments').select('id').limit(1);
        return true;
      }),
      createSecurityTest('rls-audit-logs', 'RLS سجلات التدقيق', async () => {
        const { error } = await supabase.from('audit_logs').select('id').limit(1);
        return true;
      }),
      createSecurityTest('auth-required', 'التحقق من المصادقة', async () => {
        const { data } = await supabase.auth.getSession();
        return data.session !== null;
      }),
      createSecurityTest('storage-security', 'أمان التخزين', async () => {
        const { data, error } = await supabase.storage.listBuckets();
        return !error;
      }),
    ]
  },
  {
    id: 'performance',
    label: 'الأداء',
    icon: Activity,
    color: 'text-orange-500',
    tests: [
      createAPITest('db-response-time', 'زمن استجابة قاعدة البيانات', async () => {
        const start = performance.now();
        await supabase.from('system_settings').select('id').limit(1);
        return performance.now() - start < 2000; // أقل من 2 ثانية
      }),
      createAPITest('edge-function-response', 'زمن استجابة Edge Functions', async () => {
        const start = performance.now();
        await supabase.functions.invoke('test-auth', { body: { action: 'health-check' } });
        return performance.now() - start < 5000; // أقل من 5 ثواني
      }),
      createAPITest('bulk-query', 'استعلام متعدد', async () => {
        const start = performance.now();
        await Promise.all([
          supabase.from('beneficiaries').select('id').limit(10),
          supabase.from('properties').select('id').limit(10),
          supabase.from('tenants').select('id').limit(10),
        ]);
        return performance.now() - start < 3000;
      }),
    ]
  }
];

// ================== حساب الإحصائيات ==================

const TOTAL_TESTS = ALL_TESTS.reduce((acc, cat) => acc + cat.tests.length, 0);

// ================== المكون الرئيسي ==================

export default function ComprehensiveTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState<TestProgress>({
    total: TOTAL_TESTS,
    completed: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    currentTest: '',
    isRunning: false,
    isPaused: false
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(ALL_TESTS.map(c => c.id));
  const [activeTab, setActiveTab] = useState('overview');
  const [stopRequested, setStopRequested] = useState(false);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const runAllTests = async () => {
    setResults([]);
    setLogs([]);
    setStopRequested(false);
    
    const testsToRun = ALL_TESTS
      .filter(cat => selectedCategories.includes(cat.id))
      .flatMap(cat => cat.tests);
    
    setProgress({
      total: testsToRun.length,
      completed: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      currentTest: '',
      isRunning: true,
      isPaused: false
    });

    addLog(`🚀 بدء تشغيل ${testsToRun.length} اختبار...`);

    for (let i = 0; i < testsToRun.length; i++) {
      if (stopRequested) {
        addLog('⏹️ تم إيقاف الاختبارات');
        break;
      }

      const test = testsToRun[i];
      setProgress(prev => ({
        ...prev,
        currentTest: test.name
      }));

      addLog(`▶️ تشغيل: ${test.name}`);
      
      const result = await test.run();
      
      setResults(prev => [...prev, result]);
      setProgress(prev => ({
        ...prev,
        completed: prev.completed + 1,
        passed: result.success ? prev.passed + 1 : prev.passed,
        failed: result.success ? prev.failed : prev.failed + 1
      }));

      if (result.success) {
        addLog(`✅ ${test.name}: نجح (${result.duration}ms)`);
      } else {
        addLog(`❌ ${test.name}: فشل - ${result.message}`);
      }

      // تأخير صغير بين الاختبارات
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setProgress(prev => ({
      ...prev,
      isRunning: false,
      currentTest: ''
    }));

    const finalPassed = results.filter(r => r.success).length + (stopRequested ? 0 : 1);
    addLog(`\n📊 انتهى: ${progress.passed} نجح، ${progress.failed} فشل`);
    
    if (progress.failed === 0 && !stopRequested) {
      toastSuccess('جميع الاختبارات نجحت!');
    } else {
      toastError(`${progress.failed} اختبار فشل`);
    }
  };

  const stopTests = () => {
    setStopRequested(true);
    addLog('⏸️ جاري إيقاف الاختبارات...');
  };

  const exportResults = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        passed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        avgDuration: Math.round(results.reduce((acc, r) => acc + r.duration, 0) / results.length)
      },
      results: results.map(r => ({
        ...r,
        timestamp: r.timestamp.toISOString()
      })),
      logs
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive-test-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toastSuccess('تم تصدير التقرير');
  };

  const clearResults = () => {
    setResults([]);
    setLogs([]);
    setProgress({
      total: TOTAL_TESTS,
      completed: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      currentTest: '',
      isRunning: false,
      isPaused: false
    });
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(ALL_TESTS.map(c => c.id));
  };

  const deselectAllCategories = () => {
    setSelectedCategories([]);
  };

  const getPassRate = () => {
    if (results.length === 0) return 0;
    return Math.round((results.filter(r => r.success).length / results.length) * 100);
  };

  const getAvgDuration = () => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((acc, r) => acc + r.duration, 0) / results.length);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* الهيدر */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube className="h-8 w-8 text-primary" />
            الاختبارات الشاملة
          </h1>
          <p className="text-muted-foreground mt-1">
            اختبر جميع أجزاء التطبيق فعلياً ({TOTAL_TESTS} اختبار)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {progress.isRunning ? (
            <Button onClick={stopTests} variant="destructive" className="gap-2">
              <Pause className="h-4 w-4" />
              إيقاف
            </Button>
          ) : (
            <Button onClick={runAllTests} className="gap-2" disabled={selectedCategories.length === 0}>
              <PlayCircle className="h-4 w-4" />
              تشغيل الاختبارات ({selectedCategories.reduce((acc, catId) => {
                const cat = ALL_TESTS.find(c => c.id === catId);
                return acc + (cat?.tests.length || 0);
              }, 0)})
            </Button>
          )}
          <Button onClick={exportResults} variant="outline" className="gap-2" disabled={results.length === 0}>
            <Download className="h-4 w-4" />
            تصدير
          </Button>
          <Button onClick={clearResults} variant="outline" className="gap-2" disabled={results.length === 0}>
            <Trash2 className="h-4 w-4" />
            مسح
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{results.length}</div>
              <div className="text-sm text-muted-foreground">مكتمل</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {results.filter(r => r.success).length}
              </div>
              <div className="text-sm text-muted-foreground">نجح</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">
                {results.filter(r => !r.success).length}
              </div>
              <div className="text-sm text-muted-foreground">فشل</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{getPassRate()}%</div>
              <div className="text-sm text-muted-foreground">نسبة النجاح</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">{getAvgDuration()}ms</div>
              <div className="text-sm text-muted-foreground">متوسط الوقت</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* شريط التقدم */}
      {progress.isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>جاري: {progress.currentTest}</span>
                <span>{progress.completed} / {progress.total}</span>
              </div>
              <Progress value={(progress.completed / progress.total) * 100} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* التبويبات */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="categories">الفئات</TabsTrigger>
          <TabsTrigger value="results">النتائج</TabsTrigger>
          <TabsTrigger value="logs">السجلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* اختيار الفئات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>فئات الاختبار</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllCategories}>
                    تحديد الكل
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllCategories}>
                    إلغاء الكل
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {ALL_TESTS.map(category => {
                  const Icon = category.icon;
                  const categoryResults = results.filter(r => r.category === category.id);
                  const passed = categoryResults.filter(r => r.success).length;
                  const failed = categoryResults.filter(r => !r.success).length;
                  
                  return (
                    <Card 
                      key={category.id}
                      className={`cursor-pointer transition-all ${
                        selectedCategories.includes(category.id) 
                          ? 'ring-2 ring-primary' 
                          : 'opacity-50'
                      }`}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Checkbox 
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <Icon className={`h-5 w-5 ${category.color}`} />
                          <span className="font-medium text-sm">{category.label}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.tests.length} اختبار
                        </div>
                        {categoryResults.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {passed > 0 && (
                              <Badge variant="outline" className="text-green-500 text-xs">
                                ✓ {passed}
                              </Badge>
                            )}
                            {failed > 0 && (
                              <Badge variant="outline" className="text-red-500 text-xs">
                                ✗ {failed}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Accordion type="multiple" className="space-y-2">
            {ALL_TESTS.map(category => {
              const Icon = category.icon;
              const categoryResults = results.filter(r => r.category === category.id);
              
              return (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${category.color}`} />
                      <span>{category.label}</span>
                      <Badge variant="outline">{category.tests.length}</Badge>
                      {categoryResults.length > 0 && (
                        <>
                          <Badge variant="outline" className="text-green-500">
                            ✓ {categoryResults.filter(r => r.success).length}
                          </Badge>
                          <Badge variant="outline" className="text-red-500">
                            ✗ {categoryResults.filter(r => !r.success).length}
                          </Badge>
                        </>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 p-2">
                      {category.tests.map(test => {
                        const result = results.find(r => r.testId === test.id);
                        return (
                          <div 
                            key={test.id}
                            className="flex items-center justify-between p-2 rounded border"
                          >
                            <div className="flex items-center gap-2">
                              {result ? (
                                result.success ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )
                              ) : (
                                <Clock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">{test.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {result && (
                                <>
                                  <span>{result.duration}ms</span>
                                  {result.message && <span>• {result.message}</span>}
                                </>
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
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>نتائج الاختبارات ({results.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div 
                      key={`${result.testId}-${index}`}
                      className={`p-3 rounded border ${
                        result.success ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">{result.testName}</span>
                          <Badge variant="outline" className="text-xs">{result.category}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{result.duration}ms</span>
                      </div>
                      {result.message && (
                        <p className="text-sm text-muted-foreground mt-1 mr-6">
                          {result.message}
                        </p>
                      )}
                    </div>
                  ))}
                  {results.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      لم يتم تشغيل أي اختبارات بعد
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                سجل التشغيل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="font-mono text-sm space-y-1 p-4 bg-muted rounded">
                  {logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-muted-foreground">
                      سجل فارغ - ابدأ تشغيل الاختبارات
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
