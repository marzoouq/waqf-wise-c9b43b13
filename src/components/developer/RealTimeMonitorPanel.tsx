/**
 * لوحة المراقبة في الوقت الحقيقي
 * تعرض جميع الأحداث والتفاعلات مباشرة
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  Trash2,
  Download,
  MousePointer,
  Edit3,
  Navigation,
  AlertCircle,
  Globe,
  RefreshCw,
  Layers,
  Activity,
  Clock,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useRealTimeMonitor, type RealTimeEvent } from "@/hooks/developer/useRealTimeMonitor";

export function RealTimeMonitorPanel() {
  const {
    events,
    stats,
    isRecording,
    startRecording,
    stopRecording,
    clearEvents,
    exportEvents,
  } = useRealTimeMonitor(true);
  
  const [filter, setFilter] = useState<RealTimeEvent['type'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  // تصفية الأحداث
  const filteredEvents = events.filter(event => {
    if (filter !== 'all' && event.type !== filter) return false;
    if (searchQuery && !event.target.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // الحصول على أيقونة نوع الحدث
  const getEventIcon = (type: RealTimeEvent['type']) => {
    switch (type) {
      case 'click': return <MousePointer className="h-4 w-4 text-blue-500" />;
      case 'input': return <Edit3 className="h-4 w-4 text-green-500" />;
      case 'navigation': return <Navigation className="h-4 w-4 text-purple-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'network': return <Globe className="h-4 w-4 text-orange-500" />;
      case 'state': return <RefreshCw className="h-4 w-4 text-cyan-500" />;
      case 'render': return <Layers className="h-4 w-4 text-pink-500" />;
      case 'mutation': return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  // الحصول على شارة النوع
  const getEventBadge = (type: RealTimeEvent['type']) => {
    const colors: Record<RealTimeEvent['type'], string> = {
      click: 'bg-blue-500',
      input: 'bg-green-500',
      navigation: 'bg-purple-500',
      error: 'bg-red-500',
      network: 'bg-orange-500',
      state: 'bg-cyan-500',
      render: 'bg-pink-500',
      mutation: 'bg-yellow-500 text-black',
    };
    
    const labels: Record<RealTimeEvent['type'], string> = {
      click: 'نقرة',
      input: 'إدخال',
      navigation: 'تنقل',
      error: 'خطأ',
      network: 'شبكة',
      state: 'حالة',
      render: 'رسم',
      mutation: 'تغيير',
    };
    
    return <Badge className={colors[type]}>{labels[type]}</Badge>;
  };

  // حساب إحصائيات الأنواع
  const eventTypeCounts = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* الإحصائيات */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats?.totalEvents ?? 0}</div>
                <p className="text-sm text-muted-foreground">إجمالي الأحداث</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats?.eventsPerMinute ?? 0}</div>
                <p className="text-sm text-muted-foreground">أحداث/دقيقة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{stats?.errorRate?.toFixed(1) ?? 0}%</div>
                <p className="text-sm text-muted-foreground">معدل الأخطاء</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats?.avgResponseTime?.toFixed(0) ?? 0}ms</div>
                <p className="text-sm text-muted-foreground">متوسط الاستجابة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className={`h-5 w-5 ${isRecording ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
              <div>
                <div className="text-2xl font-bold">{isRecording ? 'نشط' : 'متوقف'}</div>
                <p className="text-sm text-muted-foreground">حالة التسجيل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أزرار التحكم */}
      <div className="flex flex-wrap gap-2">
        {isRecording ? (
          <Button onClick={stopRecording} variant="destructive" className="gap-2">
            <Pause className="h-4 w-4" />
            إيقاف التسجيل
          </Button>
        ) : (
          <Button onClick={startRecording} className="gap-2">
            <Play className="h-4 w-4" />
            بدء التسجيل
          </Button>
        )}
        <Button variant="outline" onClick={clearEvents} className="gap-2">
          <Trash2 className="h-4 w-4" />
          مسح الأحداث
        </Button>
        <Button variant="outline" onClick={exportEvents} className="gap-2">
          <Download className="h-4 w-4" />
          تصدير
        </Button>
      </div>

      {/* فلاتر الأنواع */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter('all')}
        >
          الكل ({events.length})
        </Button>
        {Object.entries(eventTypeCounts).map(([type, count]) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type as RealTimeEvent['type'])}
            className="gap-1"
          >
            {getEventIcon(type as RealTimeEvent['type'])}
            {type} ({count})
          </Button>
        ))}
      </div>

      {/* البحث */}
      <Input
        placeholder="بحث في الأحداث..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {/* قائمة الأحداث */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            الأحداث المباشرة ({filteredEvents.length})
          </CardTitle>
          <CardDescription>
            يتم تحديث القائمة تلقائياً
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد أحداث مسجلة</p>
                  <p className="text-sm">ابدأ التسجيل لرؤية الأحداث</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {getEventIcon(event.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getEventBadge(event.type)}
                        {event.duration && (
                          <Badge variant="outline" className="text-xs">
                            {event.duration.toFixed(0)}ms
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-mono truncate" dir="ltr">
                        {event.target}
                      </p>
                      {event.metadata && (
                        <p className="text-xs text-muted-foreground mt-1 truncate" dir="ltr">
                          {JSON.stringify(event.metadata)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.timestamp.toLocaleTimeString('ar-SA')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* الأهداف الأكثر نشاطاً */}
      {stats?.topTargets && stats.topTargets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الأهداف الأكثر نشاطاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topTargets.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <code className="text-sm truncate max-w-[70%]" dir="ltr">{item.target}</code>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
