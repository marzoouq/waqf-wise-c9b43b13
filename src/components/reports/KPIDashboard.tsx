/**
 * لوحة مؤشرات الأداء الرئيسية
 */

import { useKPIs, type KPI } from '@/hooks/dashboard/useKPIs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  PieChart,
  Building,
  Banknote,
  Clock,
  Heart,
  FileText,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReportRefreshIndicator } from './ReportRefreshIndicator';
import { ErrorState } from '@/components/shared/ErrorState';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  PieChart,
  Building,
  Banknote,
  Clock,
  Heart,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
};

const colorMap: Record<string, string> = {
  green: 'text-success bg-success/10 border-success/30',
  blue: 'text-info bg-info/10 border-info/30',
  emerald: 'text-success bg-success/10 border-success/30',
  amber: 'text-warning bg-warning/10 border-warning/30',
  pink: 'text-accent-foreground bg-accent/10 border-accent/30',
  orange: 'text-warning bg-warning/10 border-warning/30',
  red: 'text-destructive bg-destructive/10 border-destructive/30',
  yellow: 'text-warning bg-warning/10 border-warning/30',
};

const statusColors: Record<string, string> = {
  success: 'bg-success/20 text-success border-success/30',
  warning: 'bg-warning/20 text-warning border-warning/30',
  danger: 'bg-destructive/20 text-destructive border-destructive/30',
  neutral: 'bg-muted text-muted-foreground border-border',
};

interface KPIDashboardProps {
  category?: string;
  limit?: number;
  className?: string;
}

export function KPIDashboard({ category, limit, className }: KPIDashboardProps) {
  const { kpis, isLoading, isRefetching, lastUpdated, refresh, error } = useKPIs(category);

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4', className)}>
        {Array.from({ length: limit || 10 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل مؤشرات الأداء" onRetry={refresh} />;
  }

  const filteredKPIs = limit ? kpis.slice(0, limit) : kpis;

  if (filteredKPIs.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          لا توجد مؤشرات أداء متاحة
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ReportRefreshIndicator
          lastUpdated={lastUpdated}
          isRefetching={isRefetching}
          onRefresh={refresh}
        />
      </div>
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4', className)}>
      {filteredKPIs.map((kpi: KPI) => {
        const IconComponent = iconMap[kpi.icon || 'PieChart'] || PieChart;
        const cardColor = colorMap[kpi.color || 'blue'] || colorMap.blue;
        const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
        const trendColor = kpi.trend === 'up' ? 'text-success' : kpi.trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

        const formattedValue = kpi.unit === 'ر.س' 
          ? `${(kpi.current_value || 0).toLocaleString('ar-SA')} ${kpi.unit}`
          : kpi.unit === '%'
          ? `${(kpi.current_value || 0).toFixed(1)}${kpi.unit}`
          : `${kpi.current_value || 0} ${kpi.unit || ''}`.trim();

        return (
          <Card 
            key={kpi.id} 
            className={cn(
              'border transition-all hover:shadow-md',
              cardColor
            )}
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                {kpi.kpi_name_ar || kpi.kpi_name}
              </CardTitle>
              <div className={cn('p-2 rounded-lg', cardColor)}>
                <IconComponent className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {formattedValue}
                </span>
                {kpi.target_value !== null && kpi.target_value !== undefined && kpi.status && (
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', statusColors[kpi.status])}
                  >
                    {kpi.status === 'success' ? 'جيد' : kpi.status === 'warning' ? 'تحذير' : kpi.status === 'danger' ? 'خطر' : '-'}
                  </Badge>
                )}
              </div>
              
              {kpi.change_percentage !== undefined && (
                <div className="flex items-center gap-1 mt-2 text-xs">
                  <TrendIcon className={cn('h-3 w-3', trendColor)} />
                  <span className={trendColor}>
                    {kpi.change_percentage > 0 ? '+' : ''}{kpi.change_percentage.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground me-1">من الفترة السابقة</span>
                </div>
              )}

              {kpi.target_value !== null && kpi.target_value !== undefined && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>الهدف: {kpi.target_value}{kpi.unit}</span>
                    <span>{((kpi.current_value || 0) / kpi.target_value * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all',
                        kpi.status === 'success' ? 'bg-success' :
                        kpi.status === 'warning' ? 'bg-warning' :
                        kpi.status === 'danger' ? 'bg-destructive' : 'bg-muted-foreground'
                      )}
                      style={{ 
                        width: `${Math.min(100, ((kpi.current_value || 0) / kpi.target_value * 100))}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
}
