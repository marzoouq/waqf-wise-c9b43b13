import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEdgeFunctionsHealth, CATEGORY_LABELS, CATEGORY_ICONS } from '@/hooks/system/useEdgeFunctionsHealth';
import { CheckType } from '@/services/edge-functions-health.service';
import { 
  Activity, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Clock, Zap, Server, FileJson, Upload, Radio
} from 'lucide-react';

const statusConfig = {
  healthy: { color: 'bg-green-500', label: 'صحية', icon: CheckCircle },
  degraded: { color: 'bg-yellow-500', label: 'بطيئة', icon: AlertTriangle },
  unhealthy: { color: 'bg-destructive', label: 'معطلة', icon: XCircle },
  unknown: { color: 'bg-muted', label: 'غير معروف', icon: Clock }
};

const checkTypeConfig: Record<CheckType, { color: string; label: string; icon: React.ElementType; labelAr: string }> = {
  ping: { 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 
    label: 'Ping', 
    icon: Radio,
    labelAr: 'فحص سريع'
  },
  'json-required': { 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', 
    label: 'JSON', 
    icon: FileJson,
    labelAr: 'يحتاج بيانات'
  },
  formdata: { 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', 
    label: 'FormData', 
    icon: Upload,
    labelAr: 'ملفات'
  }
};

export default function EdgeFunctionsMonitor() {
  const {
    functions, functionsByCategory, functionsByCheckType, healthStatuses, healthSummary,
    isChecking, checkProgress, checkAllFunctions, checkCategory, checkSingleFunction
  } = useEdgeFunctionsHealth();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [checkTypeFilter, setCheckTypeFilter] = useState<CheckType | 'all'>('all');

  const getHealthStatus = (funcName: string) => {
    return healthStatuses.find(h => h.name === funcName);
  };

  let displayFunctions = activeCategory === 'all' 
    ? functions 
    : functionsByCategory[activeCategory as keyof typeof functionsByCategory] || [];

  // تطبيق فلتر نوع الفحص
  if (checkTypeFilter !== 'all') {
    displayFunctions = displayFunctions.filter(f => f.checkType === checkTypeFilter);
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            مراقبة Edge Functions
          </h1>
          <p className="text-muted-foreground mt-1">{functions.length} وظيفة خادم</p>
        </div>
        <Button onClick={checkAllFunctions} disabled={isChecking} size="lg">
          {isChecking ? <RefreshCw className="ml-2 h-5 w-5 animate-spin" /> : <Zap className="ml-2 h-5 w-5" />}
          {isChecking ? 'جاري الفحص...' : 'فحص الكل'}
        </Button>
      </div>

      {isChecking && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>جاري فحص الوظائف...</span>
              <span>{checkProgress}%</span>
            </div>
            <Progress value={checkProgress} />
          </CardContent>
        </Card>
      )}

      {/* ملخص نوع الفحص */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              🎯 تصنيف حسب نوع الفحص
            </h3>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(functionsByCheckType) as [CheckType, typeof functions][]).map(([type, funcs]) => {
                const config = checkTypeConfig[type];
                const Icon = config.icon;
                return (
                  <Badge 
                    key={type} 
                    className={`${config.color} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => setCheckTypeFilter(checkTypeFilter === type ? 'all' : type)}
                  >
                    <Icon className="h-3 w-3 ml-1" />
                    {config.labelAr} ({funcs.length})
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ملخص الصحة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Server className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{healthSummary.total || functions.length}</p>
            <p className="text-sm text-muted-foreground">إجمالي</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{healthSummary.healthy}</p>
            <p className="text-sm text-muted-foreground">صحية</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{healthSummary.degraded}</p>
            <p className="text-sm text-muted-foreground">بطيئة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <XCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
            <p className="text-2xl font-bold">{healthSummary.unhealthy}</p>
            <p className="text-sm text-muted-foreground">معطلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{healthSummary.avgResponseTime}ms</p>
            <p className="text-sm text-muted-foreground">متوسط الاستجابة</p>
          </CardContent>
        </Card>
      </div>

      {/* فلتر نوع الفحص */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={checkTypeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCheckTypeFilter('all')}
        >
          الكل ({functions.length})
        </Button>
        {(Object.entries(functionsByCheckType) as [CheckType, typeof functions][]).map(([type, funcs]) => {
          const config = checkTypeConfig[type];
          const Icon = config.icon;
          return (
            <Button 
              key={type}
              variant={checkTypeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCheckTypeFilter(type)}
              className="gap-1"
            >
              <Icon className="h-4 w-4" />
              {config.labelAr} ({funcs.length})
            </Button>
          );
        })}
      </div>

      {/* فلتر الفئات */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">الكل ({functions.length})</TabsTrigger>
          {Object.entries(functionsByCategory).map(([cat, funcs]) => (
            <TabsTrigger key={cat} value={cat}>
              {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]} {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]} ({funcs.length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>الوظائف ({displayFunctions.length})</CardTitle>
              {activeCategory !== 'all' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => checkCategory(activeCategory as any)}
                  disabled={isChecking}
                >
                  <RefreshCw className={`h-4 w-4 ml-1 ${isChecking ? 'animate-spin' : ''}`} />
                  فحص الفئة
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {displayFunctions.map(func => {
                    const health = getHealthStatus(func.name);
                    const config = health ? statusConfig[health.status] : statusConfig.unknown;
                    const Icon = config.icon;
                    const checkConfig = checkTypeConfig[func.checkType];
                    const CheckIcon = checkConfig.icon;

                    return (
                      <div 
                        key={func.name}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${config.color}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{func.name}</p>
                              {/* Badge نوع الفحص */}
                              <Badge variant="outline" className={`text-xs ${checkConfig.color}`}>
                                <CheckIcon className="h-3 w-3 ml-1" />
                                {checkConfig.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">{func.description}</p>
                              {func.checkType === 'json-required' && func.requiredFields && (
                                <span className="text-xs text-muted-foreground">
                                  ({func.requiredFields.join(', ')})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {health?.responseTime && (
                            <Badge variant="outline">{health.responseTime}ms</Badge>
                          )}
                          <Badge className={`${config.color} text-white`}>
                            <Icon className="h-3 w-3 ml-1" />
                            {config.label}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => checkSingleFunction(func.name)}
                            disabled={isChecking}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
