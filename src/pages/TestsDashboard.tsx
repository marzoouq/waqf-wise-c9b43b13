/**
 * لوحة تحكم الاختبارات الشاملة
 * تعرض الأعداد الفعلية للاختبارات من كل ملف
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, CheckCircle, XCircle, Clock, 
  AlertTriangle, Database, Shield,
  FileText, Server, Activity, Loader2, RefreshCw,
  TestTube, Package, Layers, Code2, Boxes
} from 'lucide-react';
import { toastSuccess, toastError } from '@/hooks/ui/use-toast';

interface TestModuleInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  estimatedCount: number;
  actualCount: number;
  loader: () => Promise<{ runTests: () => Promise<any[]>; count?: number } | null>;
  status: 'idle' | 'running' | 'completed' | 'error';
  results: any[];
  passed: number;
  failed: number;
  duration: number;
}

// دوال تحميل الاختبارات
const createLoader = (modulePath: string, runFnName: string) => async () => {
  try {
    const module = await import(/* @vite-ignore */ modulePath);
    return {
      runTests: module[runFnName],
      count: module.allHooksTests?.length || module.allComponentsTests?.length || undefined
    };
  } catch {
    return null;
  }
};

export default function TestsDashboard() {
  const [modules, setModules] = useState<TestModuleInfo[]>([
    {
      id: 'hooks',
      name: 'اختبارات Hooks',
      icon: <Code2 className="h-5 w-5" />,
      color: 'text-blue-500',
      estimatedCount: 200,
      actualCount: 0,
      loader: async () => {
        try {
          const m = await import('@/tests/hooks.tests');
          return { runTests: m.runHooksTests, count: m.allHooksTests?.length };
        } catch { return null; }
      },
      status: 'idle',
      results: [],
      passed: 0,
      failed: 0,
      duration: 0
    },
    {
      id: 'components',
      name: 'اختبارات المكونات',
      icon: <Boxes className="h-5 w-5" />,
      color: 'text-purple-500',
      estimatedCount: 150,
      actualCount: 0,
      loader: async () => {
        try {
          const m = await import('@/tests/components.tests');
          return { runTests: m.runComponentsTests, count: m.allComponentsTests?.length };
        } catch { return null; }
      },
      status: 'idle',
      results: [],
      passed: 0,
      failed: 0,
      duration: 0
    },
    {
      id: 'services',
      name: 'اختبارات الخدمات',
      icon: <Server className="h-5 w-5" />,
      color: 'text-green-500',
      estimatedCount: 300,
      actualCount: 0,
      loader: async () => {
        try {
          const m = await import('@/tests/services.tests');
          return { runTests: m.runServicesTests };
        } catch { return null; }
      },
      status: 'idle',
      results: [],
      passed: 0,
      failed: 0,
      duration: 0
    },
    {
      id: 'edge-functions',
      name: 'اختبارات Edge Functions',
      icon: <Activity className="h-5 w-5" />,
      color: 'text-orange-500',
      estimatedCount: 260,
      actualCount: 0,
      loader: async () => {
        try {
          const m = await import('@/tests/edge-functions.tests');
          return { runTests: m.runEdgeFunctionsTests };
        } catch { return null; }
      },
      status: 'idle',
      results: [],
      passed: 0,
      failed: 0,
      duration: 0
    },
    {
      id: 'contexts',
      name: 'اختبارات السياقات',
      icon: <Layers className="h-5 w-5" />,
      color: 'text-cyan-500',
      estimatedCount: 100,
      actualCount: 0,
      loader: async () => {
        try {
          const m = await import('@/tests/contexts.tests');
          return { runTests: m.runContextsTests };
        } catch { return null; }
      },
      status: 'idle',
      results: [],
      passed: 0,
      failed: 0,
      duration: 0
    },
    {
      id: 'libraries',
      name: 'اختبارات المكتبات',
      icon: <Package className="h-5 w-5" />,
      color: 'text-pink-500',
      estimatedCount: 200,
      actualCount: 0,
      loader: async () => {
        try {
          const m = await import('@/tests/libraries.tests');
          return { runTests: m.runLibrariesTests };
        } catch { return null; }
      },
      status: 'idle',
      results: [],
      passed: 0,
      failed: 0,
      duration: 0
    },
    {
      id: 'pages',
      name: 'اختبارات الصفحات',
      icon: <FileText className="h-5 w-5" />,
      color: 'text-indigo-500',
      estimatedCount: 400,
      actualCount: 0,
      loader: async () => {
        try {
          const m = await import('@/tests/pages.tests');
          return { runTests: m.runPagesTests };
        } catch { return null; }
      },
      status: 'idle',
      results: [],
      passed: 0,
      failed: 0,
      duration: 0
    },
    {
      id: 'types',
      name: 'اختبارات الأنواع',
      icon: <Shield className="h-5 w-5" />,
      color: 'text-yellow-500',
      estimatedCount: 250,
      actualCount: 0,
      loader: async () => {
        try {
          const m = await import('@/tests/types.tests');
          return { runTests: m.runTypesTests };
        } catch { return null; }
      },
      status: 'idle',
      results: [],
      passed: 0,
      failed: 0,
      duration: 0
    },
    {
      id: 'integration',
      name: 'اختبارات التكامل',
      icon: <Database className="h-5 w-5" />,
      color: 'text-red-500',
      estimatedCount: 30,
      actualCount: 0,
      loader: async () => {
        try {
          const m = await import('@/tests/integration.tests');
          return { runTests: m.runIntegrationTests };
        } catch { return null; }
      },
      status: 'idle',
      results: [],
      passed: 0,
      failed: 0,
      duration: 0
    },
  ]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // تحليل الأعداد الفعلية للاختبارات
  const analyzeTestCounts = useCallback(async () => {
    setIsAnalyzing(true);
    
    const updatedModules = await Promise.all(modules.map(async (module) => {
      try {
        const loaded = await module.loader();
        if (loaded) {
          // تشغيل الاختبارات للحصول على العدد الفعلي
          const results = await loaded.runTests();
          return {
            ...module,
            actualCount: loaded.count || results.length
          };
        }
      } catch (e) {
        console.error(`Error loading ${module.id}:`, e);
      }
      return module;
    }));
    
    setModules(updatedModules);
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  }, []);

  // تشغيل اختبارات وحدة معينة
  const runModuleTests = async (moduleId: string) => {
    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, status: 'running', results: [], passed: 0, failed: 0 } : m
    ));

    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const startTime = performance.now();
    try {
      const loaded = await module.loader();
      if (!loaded) throw new Error('Failed to load module');
      
      const results = await loaded.runTests();
      const passed = results.filter((r: any) => r.status === 'passed' || r.success === true).length;
      const failed = results.filter((r: any) => r.status === 'failed' || r.success === false).length;
      
      setModules(prev => prev.map(m => 
        m.id === moduleId ? { 
          ...m, 
          status: 'completed', 
          results,
          actualCount: results.length,
          passed,
          failed,
          duration: Math.round(performance.now() - startTime)
        } : m
      ));

      if (failed === 0) {
        toastSuccess(`${module.name}: جميع ${passed} اختبار نجحت`);
      } else {
        toastError(`${module.name}: ${failed} اختبار فشل من ${results.length}`);
      }
    } catch (error) {
      setModules(prev => prev.map(m => 
        m.id === moduleId ? { ...m, status: 'error' } : m
      ));
      toastError(`خطأ في تشغيل ${module.name}`);
    }
  };

  // تشغيل جميع الاختبارات
  const runAllTests = async () => {
    setIsRunningAll(true);
    
    for (const module of modules) {
      await runModuleTests(module.id);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunningAll(false);
  };

  // حساب الإحصائيات الإجمالية
  const totalStats = modules.reduce((acc, m) => ({
    estimated: acc.estimated + m.estimatedCount,
    actual: acc.actual + (m.actualCount || m.estimatedCount),
    passed: acc.passed + m.passed,
    failed: acc.failed + m.failed,
    completed: acc.completed + (m.status === 'completed' ? 1 : 0)
  }), { estimated: 0, actual: 0, passed: 0, failed: 0, completed: 0 });

  const successRate = totalStats.passed + totalStats.failed > 0
    ? Math.round((totalStats.passed / (totalStats.passed + totalStats.failed)) * 100)
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TestTube className="h-8 w-8 text-primary" />
            لوحة تحكم الاختبارات
          </h1>
          <p className="text-muted-foreground mt-1">
            تحليل وتشغيل جميع اختبارات التطبيق - الأعداد الفعلية
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={analyzeTestCounts}
            disabled={isAnalyzing}
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            تحليل الأعداد
          </Button>
          <Button 
            onClick={runAllTests}
            disabled={isRunningAll}
          >
            {isRunningAll ? (
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 ml-2" />
            )}
            تشغيل الكل
          </Button>
        </div>
      </div>

      {/* إحصائيات عامة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{totalStats.actual}</div>
            <div className="text-sm text-muted-foreground">إجمالي الاختبارات</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{totalStats.passed}</div>
            <div className="text-sm text-muted-foreground">نجح</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{totalStats.failed}</div>
            <div className="text-sm text-muted-foreground">فشل</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{totalStats.completed}/{modules.length}</div>
            <div className="text-sm text-muted-foreground">وحدات مكتملة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-500">{successRate}%</div>
            <div className="text-sm text-muted-foreground">نسبة النجاح</div>
          </CardContent>
        </Card>
      </div>

      {/* تحليل الفرق */}
      {analysisComplete && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              سبب الفرق في الأرقام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>المشكلة:</strong> الأرقام المقدرة سابقاً (2452) كانت مبالغ فيها لأنها:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>تقديرات تخمينية وليست عد فعلي للاختبارات</li>
                <li>افتراض أن كل خدمة تحتوي 5+ اختبارات</li>
                <li>عدم التحقق من محتوى ملفات الاختبارات الفعلية</li>
              </ul>
              <p className="mt-3"><strong>الحل:</strong> هذه الصفحة تعرض الأعداد الفعلية من تشغيل الاختبارات مباشرة</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة الوحدات */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="details">التفاصيل</TabsTrigger>
          <TabsTrigger value="results">النتائج</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map(module => (
              <Card key={module.id} className="relative overflow-hidden">
                {module.status === 'running' && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className={`flex items-center gap-2 ${module.color}`}>
                      {module.icon}
                      {module.name}
                    </span>
                    <Badge variant={
                      module.status === 'completed' ? (module.failed === 0 ? 'default' : 'destructive') :
                      module.status === 'running' ? 'secondary' :
                      module.status === 'error' ? 'destructive' : 'outline'
                    }>
                      {module.status === 'idle' && 'جاهز'}
                      {module.status === 'running' && 'قيد التشغيل'}
                      {module.status === 'completed' && 'مكتمل'}
                      {module.status === 'error' && 'خطأ'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">عدد الاختبارات:</span>
                    <span className="font-bold">{module.actualCount || module.estimatedCount}</span>
                  </div>
                  
                  {module.status === 'completed' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-500 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> نجح
                        </span>
                        <span>{module.passed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-500 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> فشل
                        </span>
                        <span>{module.failed}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> المدة
                        </span>
                        <span>{module.duration}ms</span>
                      </div>
                      <Progress 
                        value={module.passed + module.failed > 0 ? (module.passed / (module.passed + module.failed)) * 100 : 0} 
                        className="h-2"
                      />
                    </>
                  )}
                  
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => runModuleTests(module.id)}
                    disabled={module.status === 'running' || isRunningAll}
                  >
                    <Play className="h-3 w-3 ml-1" />
                    تشغيل
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>مقارنة التقديرات بالأعداد الفعلية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.map(module => (
                  <div key={module.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium flex items-center gap-2 ${module.color}`}>
                        {module.icon}
                        {module.name}
                      </span>
                      <Badge variant={module.actualCount > 0 ? 'default' : 'outline'}>
                        {module.actualCount || module.estimatedCount} اختبار
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="bg-amber-500/10 p-2 rounded">
                        <span className="text-amber-600">المقدر: </span>
                        <span className="font-medium">{module.estimatedCount}</span>
                      </div>
                      <div className="bg-green-500/10 p-2 rounded">
                        <span className="text-green-600">الفعلي: </span>
                        <span className="font-medium">{module.actualCount || '-'}</span>
                      </div>
                      <div className="bg-blue-500/10 p-2 rounded">
                        <span className="text-blue-600">نجح: </span>
                        <span className="font-medium">{module.passed}</span>
                      </div>
                      <div className="bg-red-500/10 p-2 rounded">
                        <span className="text-red-600">فشل: </span>
                        <span className="font-medium">{module.failed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>نتائج الاختبارات</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {modules.filter(m => m.results.length > 0).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    لم يتم تشغيل أي اختبارات بعد - اضغط "تشغيل الكل" للبدء
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.filter(m => m.results.length > 0).map(module => (
                      <div key={module.id}>
                        <h3 className={`font-medium mb-2 flex items-center gap-2 ${module.color}`}>
                          {module.icon}
                          {module.name}
                          <Badge variant="outline" className="mr-2">
                            {module.results.length} نتيجة
                          </Badge>
                        </h3>
                        <div className="space-y-1 pr-4">
                          {module.results.slice(0, 10).map((result: any, idx: number) => (
                            <div 
                              key={idx}
                              className={`p-2 rounded text-sm flex items-center justify-between ${
                                result.status === 'passed' || result.success 
                                  ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                                  : 'bg-red-500/10 text-red-700 dark:text-red-400'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {result.status === 'passed' || result.success ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                {result.name || result.testName}
                              </span>
                              <span className="text-xs opacity-70">{Math.round(result.duration || 0)}ms</span>
                            </div>
                          ))}
                          {module.results.length > 10 && (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              +{module.results.length - 10} نتيجة أخرى
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
