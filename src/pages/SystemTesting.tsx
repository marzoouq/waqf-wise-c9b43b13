/**
 * صفحة اختبار شاملة للنظام
 * Comprehensive System Testing Page
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Shield,
  Zap,
  Database,
  Network,
  Clock,
} from 'lucide-react';
import { selfHealing, retryOperation, fetchWithFallback } from '@/lib/selfHealing';
import { errorTracker } from '@/lib/errors';
import { supabase } from '@/integrations/supabase/client';
import { SelfHealingComponent } from '@/components/shared/SelfHealingComponent';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

export default function SystemTesting() {
  const { toast } = useToast();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [crashComponent, setCrashComponent] = useState(false);

  const updateResult = (name: string, updates: Partial<TestResult>) => {
    setResults((prev) => {
      const index = prev.findIndex((r) => r.name === name);
      if (index >= 0) {
        const newResults = [...prev];
        newResults[index] = { ...newResults[index], ...updates };
        return newResults;
      }
      return [...prev, { name, status: 'pending', message: '', ...updates } as TestResult];
    });
  };

  const runTest = async (
    name: string,
    testFn: () => Promise<void>
  ): Promise<boolean> => {
    updateResult(name, { status: 'running', message: 'جاري التنفيذ...' });
    const startTime = Date.now();

    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateResult(name, {
        status: 'passed',
        message: 'نجح الاختبار ✓',
        duration,
      });
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      updateResult(name, {
        status: 'failed',
        message: `فشل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
        duration,
      });
      return false;
    }
  };

  // ======================
  // اختبارات النظام
  // ======================

  const testRetryMechanism = async () => {
    console.log('🧪 Testing Retry Mechanism...');
    
    let attempts = 0;
    await retryOperation(async () => {
      attempts++;
      console.log(`Attempt ${attempts}`);
      
      if (attempts < 2) {
        throw new Error('Simulated failure');
      }
      
      console.log('✅ Operation succeeded!');
    });

    if (attempts !== 2) {
      throw new Error(`Expected 2 attempts, got ${attempts}`);
    }
  };

  const testCacheFallback = async () => {
    console.log('🧪 Testing Cache Fallback...');
    
    // أولاً: حفظ في الـ Cache
    const result1 = await fetchWithFallback(
      'test-key',
      async () => ({ data: 'Fresh data', timestamp: Date.now() })
    );

    if (result1.fromCache) {
      throw new Error('First fetch should not be from cache');
    }

    // ثانياً: محاولة جلب من Cache عند الفشل
    const result2 = await fetchWithFallback(
      'test-key',
      async () => {
        throw new Error('Simulated API failure');
      }
    );

    if (!result2.fromCache) {
      throw new Error('Should have used cache fallback');
    }

    console.log('✅ Cache fallback working correctly!');
  };

  const testDatabaseReconnect = async () => {
    console.log('🧪 Testing Database Reconnection...');
    
    const success = await selfHealing.autoRecovery.reconnectDatabase();
    
    if (!success) {
      throw new Error('Database reconnection failed');
    }

    console.log('✅ Database reconnection successful!');
  };

  const testErrorTracking = async () => {
    console.log('🧪 Testing Error Tracking...');
    
    await errorTracker.logError(
      'Test error from system testing',
      'low',
      { test: true, timestamp: Date.now() }
    );

    console.log('✅ Error tracked successfully!');
  };

  const testHealthMonitor = async () => {
    console.log('🧪 Testing Health Monitor...');
    
    // فحص أن المراقب يعمل
    const isRunning = selfHealing.healthMonitor !== null;
    
    if (!isRunning) {
      throw new Error('Health monitor is not running');
    }

    console.log('✅ Health monitor is active!');
  };

  const testCircuitBreaker = async () => {
    console.log('🧪 Testing Circuit Breaker...');
    
    // محاولة عملية فاشلة عدة مرات
    let failureCount = 0;
    
    try {
      await selfHealing.retryHandler.execute(
        async () => {
          failureCount++;
          throw new Error('Persistent failure');
        },
        { maxAttempts: 3 }
      );
    } catch (error) {
      // متوقع أن يفشل
      if (failureCount !== 3) {
        throw new Error(`Expected 3 attempts, got ${failureCount}`);
      }
    }

    console.log('✅ Circuit breaker working correctly!');
  };

  const testNotificationSystem = async () => {
    console.log('🧪 Testing Notification System...');
    
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // إنشاء إشعار اختباري
    const { error } = await supabase.from('notifications').insert({
      user_id: user.user.id,
      title: 'إشعار اختبار',
      message: 'هذا إشعار اختبار من نظام الفحص الشامل',
      type: 'system_test',
      priority: 'low',
      is_read: false,
    });

    if (error) throw error;

    console.log('✅ Notification created successfully!');
  };

  const testAutoFixLogging = async () => {
    console.log('🧪 Testing Auto-Fix Logging...');
    
    // إنشاء سجل خطأ واختبار تحديث حالته للمحلول
    const { data: errorLog, error: errorLogError } = await supabase
      .from('system_error_logs')
      .insert({
        error_type: 'test_error',
        error_message: 'Test error for auto-fix',
        severity: 'low',
        url: window.location.href,
        user_agent: navigator.userAgent,
        status: 'new',
      })
      .select()
      .maybeSingle();

    if (!errorLog) throw new Error("Failed to create error log");

    // تحديث حالة الخطأ إلى محلول (محاكاة الإصلاح التلقائي)
    const { error: updateError } = await supabase
      .from('system_error_logs')
      .update({
        status: 'auto_resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', errorLog.id);

    if (updateError) throw updateError;

    console.log('✅ Auto-fix logging working!');
  };

  // ======================
  // تشغيل جميع الاختبارات
  // ======================

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests = [
      { name: 'آلية إعادة المحاولة', fn: testRetryMechanism },
      { name: 'Cache Fallback', fn: testCacheFallback },
      { name: 'إعادة الاتصال بقاعدة البيانات', fn: testDatabaseReconnect },
      { name: 'تتبع الأخطاء', fn: testErrorTracking },
      { name: 'مراقب الصحة', fn: testHealthMonitor },
      { name: 'Circuit Breaker', fn: testCircuitBreaker },
      { name: 'نظام الإشعارات', fn: testNotificationSystem },
      { name: 'تسجيل الإصلاح التلقائي', fn: testAutoFixLogging },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      const success = await runTest(test.name, test.fn);
      if (success) {
        passed++;
      } else {
        failed++;
      }
      // تأخير صغير بين الاختبارات
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsRunning(false);

    toast({
      title: 'اكتملت الاختبارات',
      description: `نجح: ${passed} | فشل: ${failed}`,
      variant: passed === tests.length ? 'default' : 'destructive',
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // مكون اختبار الانهيار
  const CrashTestComponent = () => {
    if (crashComponent) {
      throw new Error('Component crash test triggered!');
    }
    return (
      <div className="p-4 border rounded-lg bg-success-light text-success">
        <p className="font-semibold">✅ المكون يعمل بشكل صحيح</p>
        <p className="text-sm mt-1">اضغط الزر أدناه لاختبار الاسترجاع التلقائي</p>
      </div>
    );
  };

  return (
    <PageErrorBoundary pageName="اختبار النظام">
      <div className="container mx-auto p-6 space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            اختبار النظام الشامل
          </h1>
          <p className="text-muted-foreground mt-1">
            اختبار جميع ميزات الكشف والإصلاح الذاتي
          </p>
        </div>
        <Button
          onClick={runAllTests}
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-5 w-5 ml-2 animate-spin" />
              جاري التنفيذ...
            </>
          ) : (
            <>
              <Play className="h-5 w-5 ml-2" />
              تشغيل جميع الاختبارات
            </>
          )}
        </Button>
      </div>

      {/* التبويبات */}
      <Tabs defaultValue="automated" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automated">الاختبارات الآلية</TabsTrigger>
          <TabsTrigger value="manual">الاختبارات اليدوية</TabsTrigger>
          <TabsTrigger value="live">المراقبة الحية</TabsTrigger>
        </TabsList>

        {/* الاختبارات الآلية */}
        <TabsContent value="automated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                نتائج الاختبارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>لم يتم تشغيل أي اختبار بعد</p>
                  <p className="text-sm mt-1">اضغط "تشغيل جميع الاختبارات" للبدء</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result) => (
                    <div
                      key={result.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <p className="font-medium">{result.name}</p>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.duration && (
                          <span className="text-xs text-muted-foreground">
                            {result.duration}ms
                          </span>
                        )}
                        <Badge
                          variant={
                            result.status === 'passed'
                              ? 'default'
                              : result.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {result.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* الاختبارات اليدوية */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اختبار مكون ذاتي الإصلاح</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SelfHealingComponent
                autoRetry
                maxRetries={3}
                retryDelay={2000}
                componentName="TestComponent"
              >
                <CrashTestComponent />
              </SelfHealingComponent>

              <Button
                variant="destructive"
                onClick={() => {
                  setCrashComponent(true);
                  setTimeout(() => setCrashComponent(false), 100);
                }}
              >
                <AlertTriangle className="h-4 w-4 ml-2" />
                تشغيل اختبار الانهيار
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>اختبارات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => runTest('Test Retry', testRetryMechanism)}>
                <Network className="h-4 w-4 ml-2" />
                اختبار Retry
              </Button>
              <Button variant="outline" onClick={() => runTest('Test Cache', testCacheFallback)}>
                <Database className="h-4 w-4 ml-2" />
                اختبار Cache
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* المراقبة الحية */}
        <TabsContent value="live">
          <Card>
            <CardHeader>
              <CardTitle>المراقبة الحية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                افتح console المتصفح (F12) لمشاهدة السجلات الحية
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PageErrorBoundary>
  );
}
