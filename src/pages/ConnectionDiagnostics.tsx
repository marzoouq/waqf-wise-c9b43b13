/**
 * Connection Diagnostics Page
 * صفحة تشخيص الاتصال
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  Server,
  Database,
  Zap,
  Globe,
  Clock,
  Activity,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { useConnectionMonitor } from '@/hooks/system/useConnectionMonitor';
import { ConnectionStatusPanel } from '@/components/monitoring/ConnectionStatusPanel';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface DiagnosticTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  duration?: number;
  details?: string;
}

export default function ConnectionDiagnostics() {
  const { events, stats, isOnline } = useConnectionMonitor();
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const diagnosticTests: Omit<DiagnosticTest, 'status' | 'duration' | 'details'>[] = [
    { id: 'network', name: 'اتصال الإنترنت', description: 'فحص الاتصال بالشبكة' },
    { id: 'dns', name: 'خوادم DNS', description: 'فحص تحليل أسماء النطاقات' },
    { id: 'supabase_api', name: 'خادم API', description: 'فحص الاتصال بخادم Lovable Cloud' },
    { id: 'database', name: 'قاعدة البيانات', description: 'فحص الاستعلامات على قاعدة البيانات' },
    { id: 'auth', name: 'خدمة المصادقة', description: 'فحص خدمة تسجيل الدخول' },
    { id: 'realtime', name: 'الاتصال المباشر', description: 'فحص WebSocket للتحديثات الفورية' },
    { id: 'edge_functions', name: 'وظائف الخادم', description: 'فحص Edge Functions' },
    { id: 'latency', name: 'زمن الاستجابة', description: 'قياس سرعة الاستجابة' },
  ];

  const runDiagnostics = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const newTests: DiagnosticTest[] = diagnosticTests.map(t => ({
      ...t,
      status: 'pending'
    }));
    setTests(newTests);

    for (let i = 0; i < diagnosticTests.length; i++) {
      const test = diagnosticTests[i];
      
      // تحديث الحالة إلى "قيد التشغيل"
      setTests(prev => prev.map(t => 
        t.id === test.id ? { ...t, status: 'running' } : t
      ));

      const startTime = Date.now();
      let result: Partial<DiagnosticTest> = {};

      try {
        switch (test.id) {
          case 'network':
            result = await testNetworkConnection();
            break;
          case 'dns':
            result = await testDNS();
            break;
          case 'supabase_api':
            result = await testSupabaseAPI();
            break;
          case 'database':
            result = await testDatabase();
            break;
          case 'auth':
            result = await testAuth();
            break;
          case 'realtime':
            result = await testRealtime();
            break;
          case 'edge_functions':
            result = await testEdgeFunctions();
            break;
          case 'latency':
            result = await testLatency();
            break;
        }
      } catch (error) {
        result = {
          status: 'error',
          details: error instanceof Error ? error.message : 'خطأ غير معروف'
        };
      }

      const duration = Date.now() - startTime;

      setTests(prev => prev.map(t => 
        t.id === test.id ? { ...t, ...result, duration } : t
      ));

      setProgress(((i + 1) / diagnosticTests.length) * 100);
      
      // انتظار قصير بين الاختبارات
      await new Promise(r => setTimeout(r, 200));
    }

    setIsRunning(false);
  };

  const testNetworkConnection = async (): Promise<Partial<DiagnosticTest>> => {
    if (!navigator.onLine) {
      return { status: 'error', details: 'الجهاز غير متصل بالإنترنت' };
    }
    
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        return { 
          status: 'warning', 
          details: `اتصال بطيء: ${effectiveType} - ${connection.downlink} Mbps` 
        };
      }
      return { 
        status: 'success', 
        details: `نوع الاتصال: ${effectiveType} - ${connection.downlink} Mbps` 
      };
    }
    
    return { status: 'success', details: 'الاتصال متاح' };
  };

  const testDNS = async (): Promise<Partial<DiagnosticTest>> => {
    try {
      const response = await fetch('https://dns.google/resolve?name=supabase.co', {
        method: 'GET',
      });
      if (response.ok) {
        return { status: 'success', details: 'تحليل DNS يعمل بشكل طبيعي' };
      }
      return { status: 'warning', details: 'استجابة غير متوقعة من خادم DNS' };
    } catch {
      return { status: 'warning', details: 'تعذر التحقق من DNS - قد يكون محظوراً' };
    }
  };

  const testSupabaseAPI = async (): Promise<Partial<DiagnosticTest>> => {
    try {
      const start = Date.now();
      const { error } = await supabase.from('system_settings').select('id').limit(1);
      const latency = Date.now() - start;
      
      if (error) {
        return { status: 'error', details: error.message };
      }
      
      if (latency > 3000) {
        return { status: 'warning', details: `استجابة بطيئة: ${latency}ms` };
      }
      
      return { status: 'success', details: `الاتصال سريع: ${latency}ms` };
    } catch (error) {
      return { 
        status: 'error', 
        details: error instanceof Error ? error.message : 'فشل الاتصال بالخادم' 
      };
    }
  };

  const testDatabase = async (): Promise<Partial<DiagnosticTest>> => {
    try {
      const start = Date.now();
      const { count, error } = await supabase
        .from('system_settings')
        .select('*', { count: 'exact', head: true });
      const latency = Date.now() - start;
      
      if (error) {
        return { status: 'error', details: error.message };
      }
      
      return { status: 'success', details: `الاستعلام ناجح: ${latency}ms` };
    } catch (error) {
      return { 
        status: 'error', 
        details: error instanceof Error ? error.message : 'فشل الاستعلام' 
      };
    }
  };

  const testAuth = async (): Promise<Partial<DiagnosticTest>> => {
    try {
      const start = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const latency = Date.now() - start;
      
      if (error) {
        return { status: 'error', details: error.message };
      }
      
      return { 
        status: 'success', 
        details: data.session ? `جلسة نشطة: ${latency}ms` : `لا يوجد جلسة: ${latency}ms` 
      };
    } catch (error) {
      return { 
        status: 'error', 
        details: error instanceof Error ? error.message : 'فشل فحص المصادقة' 
      };
    }
  };

  const testRealtime = async (): Promise<Partial<DiagnosticTest>> => {
    return new Promise((resolve) => {
      const channel = supabase.channel('test-connection');
      const timeout = setTimeout(() => {
        channel.unsubscribe();
        resolve({ status: 'warning', details: 'انتهت مهلة الاتصال المباشر' });
      }, 5000);

      channel
        .on('system', { event: '*' }, () => {})
        .subscribe((status) => {
          clearTimeout(timeout);
          channel.unsubscribe();
          
          if (status === 'SUBSCRIBED') {
            resolve({ status: 'success', details: 'الاتصال المباشر يعمل' });
          } else if (status === 'CHANNEL_ERROR') {
            resolve({ status: 'error', details: 'فشل الاتصال المباشر' });
          } else {
            resolve({ status: 'warning', details: `حالة: ${status}` });
          }
        });
    });
  };

  const testEdgeFunctions = async (): Promise<Partial<DiagnosticTest>> => {
    try {
      const start = Date.now();
      const { error } = await supabase.functions.invoke('test-auth', {
        body: { test: true }
      });
      const latency = Date.now() - start;
      
      if (error) {
        return { status: 'warning', details: `تحذير: ${error.message}` };
      }
      
      return { status: 'success', details: `الوظائف تعمل: ${latency}ms` };
    } catch (error) {
      return { 
        status: 'warning', 
        details: error instanceof Error ? error.message : 'تعذر اختبار الوظائف' 
      };
    }
  };

  const testLatency = async (): Promise<Partial<DiagnosticTest>> => {
    const times: number[] = [];
    
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      try {
        await supabase.from('system_settings').select('id').limit(1);
        times.push(Date.now() - start);
      } catch {
        // تجاهل الأخطاء
      }
    }
    
    if (times.length === 0) {
      return { status: 'error', details: 'فشل قياس زمن الاستجابة' };
    }
    
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    
    if (avg > 3000) {
      return { status: 'error', details: `بطيء جداً: ${avg}ms` };
    } else if (avg > 1000) {
      return { status: 'warning', details: `بطيء: ${avg}ms` };
    }
    
    return { status: 'success', details: `ممتاز: ${avg}ms` };
  };

  const getStatusIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: DiagnosticTest['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      running: 'outline',
      pending: 'outline',
    };
    const labels: Record<string, string> = {
      success: 'ناجح',
      error: 'فشل',
      warning: 'تحذير',
      running: 'جاري',
      pending: 'في الانتظار',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* الرأس */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6" />
              تشخيص الاتصال
            </h1>
            <p className="text-muted-foreground">
              فحص شامل لحالة الاتصال وأسباب الانقطاع
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Badge className="bg-green-500">
              <Wifi className="h-4 w-4 ml-1" />
              متصل
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="h-4 w-4 ml-1" />
              غير متصل
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="diagnostics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="diagnostics">التشخيص</TabsTrigger>
          <TabsTrigger value="events">سجل الأحداث</TabsTrigger>
          <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="space-y-4">
          {/* زر بدء التشخيص */}
          <Card>
            <CardHeader>
              <CardTitle>فحص شامل للاتصال</CardTitle>
              <CardDescription>
                اختبار جميع مكونات الاتصال للكشف عن المشاكل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                className="w-full"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                    جاري الفحص...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 ml-2" />
                    بدء الفحص الشامل
                  </>
                )}
              </Button>

              {isRunning && (
                <Progress value={progress} className="h-2" />
              )}

              {tests.length > 0 && (
                <div className="space-y-2 mt-4">
                  {tests.map((test) => (
                    <div 
                      key={test.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium">{test.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {test.details || test.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.duration && (
                          <span className="text-xs text-muted-foreground">
                            {test.duration}ms
                          </span>
                        )}
                        {getStatusBadge(test.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ملخص النتائج */}
          {tests.length > 0 && !isRunning && (
            <Card>
              <CardHeader>
                <CardTitle>ملخص النتائج</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {tests.filter(t => t.status === 'success').length}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-400">ناجح</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {tests.filter(t => t.status === 'warning').length}
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-400">تحذير</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">
                      {tests.filter(t => t.status === 'error').length}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-400">فشل</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events">
          <ConnectionStatusPanel />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الانقطاعات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalDisconnections}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">آخر انقطاع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {stats.lastDisconnection 
                    ? formatDistanceToNow(stats.lastDisconnection, { addSuffix: true, locale: ar })
                    : 'لا يوجد'
                  }
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">أخطاء API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.eventsByType.api || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">أخطاء قاعدة البيانات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.eventsByType.database || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* توزيع الأخطاء */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع الأحداث حسب النوع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.eventsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {type === 'network' && <Wifi className="h-4 w-4" />}
                      {type === 'api' && <Server className="h-4 w-4" />}
                      {type === 'database' && <Database className="h-4 w-4" />}
                      {type === 'edge_function' && <Zap className="h-4 w-4" />}
                      {type === 'timeout' && <Clock className="h-4 w-4" />}
                      <span className="capitalize">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(count / Math.max(...Object.values(stats.eventsByType))) * 100} 
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(stats.eventsByType).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    لا توجد أحداث مسجلة
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
