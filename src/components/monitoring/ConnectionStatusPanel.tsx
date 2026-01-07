/**
 * Connection Status Panel
 * لوحة حالة الاتصال
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Clock, 
  Server, 
  Database, 
  Zap,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useConnectionMonitor, ConnectionEvent } from '@/hooks/system/useConnectionMonitor';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const typeIcons: Record<string, React.ReactNode> = {
  network: <Wifi className="h-4 w-4" />,
  api: <Server className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  edge_function: <Zap className="h-4 w-4" />,
  websocket: <Wifi className="h-4 w-4" />,
  timeout: <Clock className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  network: 'الشبكة',
  api: 'واجهة برمجية',
  database: 'قاعدة البيانات',
  edge_function: 'وظيفة خادم',
  websocket: 'اتصال مباشر',
  timeout: 'انتهاء المهلة',
};

const statusColors: Record<string, string> = {
  disconnected: 'bg-red-500',
  reconnected: 'bg-green-500',
  slow: 'bg-yellow-500',
  error: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  disconnected: 'منقطع',
  reconnected: 'متصل',
  slow: 'بطيء',
  error: 'خطأ',
};

interface ConnectionStatusPanelProps {
  compact?: boolean;
}

export function ConnectionStatusPanel({ compact = false }: ConnectionStatusPanelProps) {
  const { events, stats, isOnline, clearEvents } = useConnectionMonitor();
  const [expanded, setExpanded] = useState(!compact);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-5 w-5 text-red-500" />;
    if (stats.currentStatus === 'degraded') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <Wifi className="h-5 w-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'غير متصل';
    if (stats.currentStatus === 'degraded') return 'اتصال بطيء';
    return 'متصل';
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)} مللي ثانية`;
    if (ms < 60000) return `${Math.round(ms / 1000)} ثانية`;
    return `${Math.round(ms / 60000)} دقيقة`;
  };

  if (compact && !expanded) {
    return (
      <Card className="cursor-pointer" onClick={() => setExpanded(true)}>
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
            {events.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {events.length} حدث
              </Badge>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card key={refreshKey}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            حالة الاتصال: {getStatusText()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {events.length > 0 && (
              <Button variant="ghost" size="icon" onClick={clearEvents}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {compact && (
              <Button variant="ghost" size="icon" onClick={() => setExpanded(false)}>
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{stats.totalDisconnections}</div>
            <div className="text-xs text-muted-foreground">انقطاعات</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {stats.averageDowntime > 0 ? formatDuration(stats.averageDowntime) : '-'}
            </div>
            <div className="text-xs text-muted-foreground">متوسط الانقطاع</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{stats.eventsByType.api || 0}</div>
            <div className="text-xs text-muted-foreground">أخطاء API</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{stats.eventsByType.database || 0}</div>
            <div className="text-xs text-muted-foreground">أخطاء DB</div>
          </div>
        </div>

        {/* قائمة الأحداث */}
        <div>
          <h4 className="text-sm font-medium mb-2">سجل الأحداث</h4>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wifi className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد أحداث اتصال مسجلة</p>
              <p className="text-xs">الاتصال مستقر</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EventCard({ event }: { event: ConnectionEvent }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      <div className={`p-2 rounded-full ${statusColors[event.status]} text-white`}>
        {typeIcons[event.type] || <AlertTriangle className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm">{event.message}</span>
          <Badge variant="outline" className="text-xs shrink-0">
            {statusLabels[event.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{typeLabels[event.type]}</span>
          <span>•</span>
          <span>
            {formatDistanceToNow(event.timestamp, { addSuffix: true, locale: ar })}
          </span>
        </div>
        {event.details && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {event.details}
          </p>
        )}
        {event.duration && (
          <p className="text-xs text-muted-foreground">
            المدة: {Math.round(event.duration / 1000)} ثانية
          </p>
        )}
      </div>
    </div>
  );
}

export default ConnectionStatusPanel;
