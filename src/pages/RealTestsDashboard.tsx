/**
 * لوحة الاختبارات الحقيقية
 * Real Tests Dashboard
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Database,
  Server,
  Shield,
  Zap,
  Code,
  Layers,
  FileCode,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: number;
  error?: string;
  details?: string;
}

interface CategoryResults {
  category: string;
  icon: React.ReactNode;
  results: TestResult[];
  isRunning: boolean;
}

const RealTestsDashboard = () => {
  const [categories, setCategories] = useState<CategoryResults[]>([
    { category: 'Dashboards', icon: <LayoutDashboard className="h-4 w-4" />, results: [], isRunning: false },
    { category: 'Hooks', icon: <Code className="h-4 w-4" />, results: [], isRunning: false },
    { category: 'Components', icon: <Layers className="h-4 w-4" />, results: [], isRunning: false },
    { category: 'Services', icon: <Server className="h-4 w-4" />, results: [], isRunning: false },
    { category: 'Edge Functions', icon: <Zap className="h-4 w-4" />, results: [], isRunning: false },
    { category: 'Database', icon: <Database className="h-4 w-4" />, results: [], isRunning: false },
    { category: 'Security', icon: <Shield className="h-4 w-4" />, results: [], isRunning: false },
    { category: 'Performance', icon: <Clock className="h-4 w-4" />, results: [], isRunning: false },
    { category: 'Integration', icon: <Settings className="h-4 w-4" />, results: [], isRunning: false },
  ]);
  
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');

  const runCategoryTests = useCallback(async (categoryIndex: number) => {
    const categoryName = categories[categoryIndex].category.toLowerCase().replace(' ', '-');
    
    setCategories(prev => {
      const updated = [...prev];
      updated[categoryIndex].isRunning = true;
      updated[categoryIndex].results = [];
      return updated;
    });

    try {
      let runFunction: () => Promise<TestResult[]>;
      
      switch (categoryName) {
        case 'dashboards':
          const { runDashboardTests } = await import('@/tests/real/dashboards.real.tests');
          runFunction = async () => {
            const results = await runDashboardTests();
            return results.map(r => ({
              name: r.testName,
              status: r.passed ? 'passed' as const : 'failed' as const,
              duration: Math.round(r.executionTime),
              error: r.errors?.join(', '),
              details: r.details
            }));
          };
          break;
        case 'hooks':
          const { runRealHooksTests } = await import('@/tests/real/hooks.real.tests');
          runFunction = runRealHooksTests;
          break;
        case 'components':
          const { runRealComponentsTests } = await import('@/tests/real/components.real.tests');
          runFunction = runRealComponentsTests;
          break;
        case 'services':
          const { runRealServicesTests } = await import('@/tests/real/services.real.tests');
          runFunction = runRealServicesTests;
          break;
        case 'edge-functions':
          const { runRealEdgeFunctionsTests } = await import('@/tests/real/edge-functions.real.tests');
          runFunction = runRealEdgeFunctionsTests;
          break;
        case 'database':
          const { runRealDatabaseTests } = await import('@/tests/real/database.real.tests');
          runFunction = runRealDatabaseTests;
          break;
        case 'security':
          const { runRealSecurityTests } = await import('@/tests/real/security.real.tests');
          runFunction = runRealSecurityTests;
          break;
        case 'performance':
          const { runRealPerformanceTests } = await import('@/tests/real/performance.real.tests');
          runFunction = runRealPerformanceTests;
          break;
        case 'integration':
          const { runRealIntegrationTests } = await import('@/tests/real/integration.real.tests');
          runFunction = runRealIntegrationTests;
          break;
        default:
          throw new Error(`Unknown category: ${categoryName}`);
      }

      const results = await runFunction();
      
      setCategories(prev => {
        const updated = [...prev];
        updated[categoryIndex].results = results;
        updated[categoryIndex].isRunning = false;
        return updated;
      });
    } catch (error) {
      console.error(`Error running ${categoryName} tests:`, error);
      setCategories(prev => {
        const updated = [...prev];
        updated[categoryIndex].results = [{
          name: 'Error',
          status: 'failed',
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        }];
        updated[categoryIndex].isRunning = false;
        return updated;
      });
    }
  }, [categories]);

  const runAllTests = useCallback(async () => {
    setIsRunningAll(true);
    setProgress(0);

    for (let i = 0; i < categories.length; i++) {
      setCurrentTest(categories[i].category);
      await runCategoryTests(i);
      setProgress(((i + 1) / categories.length) * 100);
    }

    setIsRunningAll(false);
    setCurrentTest('');
  }, [categories, runCategoryTests]);

  const getStats = () => {
    let total = 0, passed = 0, failed = 0, skipped = 0;
    
    categories.forEach(cat => {
      cat.results.forEach(r => {
        total++;
        if (r.status === 'passed') passed++;
        else if (r.status === 'failed') failed++;
        else if (r.status === 'skipped') skipped++;
      });
    });

    return { total, passed, failed, skipped };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🧪 الاختبارات الحقيقية</h1>
          <p className="text-muted-foreground mt-1">
            اختبارات فعلية تتصل بقاعدة البيانات وتستدعي Edge Functions
          </p>
        </div>
        
        <Button 
          onClick={runAllTests} 
          disabled={isRunningAll}
          size="lg"
          className="gap-2"
        >
          {isRunningAll ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              جاري التشغيل...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              تشغيل جميع الاختبارات
            </>
          )}
        </Button>
      </div>

      {/* Progress */}
      {isRunningAll && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>جاري اختبار: {currentTest}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">إجمالي</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/50">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-500">{stats.passed}</div>
            <div className="text-sm text-muted-foreground">نجح</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/50">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-red-500">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">فشل</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/50">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-yellow-500">{stats.skipped}</div>
            <div className="text-sm text-muted-foreground">تم تخطيه</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Tabs defaultValue="hooks" className="space-y-4">
        <TabsList className="grid grid-cols-9 w-full">
          {categories.map((cat, index) => (
            <TabsTrigger 
              key={cat.category} 
              value={cat.category.toLowerCase().replace(' ', '-')}
              className="gap-2"
            >
              {cat.icon}
              <span className="hidden md:inline">{cat.category}</span>
              {cat.results.length > 0 && (
                <Badge variant={
                  cat.results.every(r => r.status === 'passed') ? 'default' :
                  cat.results.some(r => r.status === 'failed') ? 'destructive' : 'secondary'
                } className="mr-1">
                  {cat.results.filter(r => r.status === 'passed').length}/{cat.results.length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat, catIndex) => (
          <TabsContent 
            key={cat.category} 
            value={cat.category.toLowerCase().replace(' ', '-')}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {cat.icon}
                  اختبارات {cat.category}
                </CardTitle>
                <Button 
                  onClick={() => runCategoryTests(catIndex)}
                  disabled={cat.isRunning}
                  size="sm"
                >
                  {cat.isRunning ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {cat.results.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>اضغط على زر التشغيل لبدء الاختبارات</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {cat.results.map((result, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border flex items-center justify-between ${
                            result.status === 'passed' ? 'bg-green-500/10 border-green-500/30' :
                            result.status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                            result.status === 'skipped' ? 'bg-yellow-500/10 border-yellow-500/30' :
                            'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {result.status === 'passed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {result.status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
                            {result.status === 'skipped' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                            {result.status === 'running' && <RefreshCw className="h-5 w-5 animate-spin" />}
                            
                            <div>
                              <div className="font-medium">{result.name}</div>
                              {result.error && (
                                <div className="text-sm text-red-500 mt-1">{result.error}</div>
                              )}
                              {result.details && (
                                <div className="text-sm text-muted-foreground mt-1">{result.details}</div>
                              )}
                            </div>
                          </div>
                          
                          <Badge variant="outline">
                            {result.duration}ms
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RealTestsDashboard;
