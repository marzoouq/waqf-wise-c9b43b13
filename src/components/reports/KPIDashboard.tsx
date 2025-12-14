/**
 * لوحة مؤشرات الأداء الرئيسية
 */

import { useKPIs, type KPI } from '@/hooks/useKPIs';
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
  green: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  blue: 'text-blue-600 bg-blue-50 border-blue-200',
  emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  amber: 'text-amber-600 bg-amber-50 border-amber-200',
  pink: 'text-pink-600 bg-pink-50 border-pink-200',
  orange: 'text-orange-600 bg-orange-50 border-orange-200',
  red: 'text-red-600 bg-red-50 border-red-200',
  yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
};

const statusColors: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  warning: 'bg-amber-100 text-amber-800 border-amber-300',
  danger: 'bg-red-100 text-red-800 border-red-300',
  neutral: 'bg-gray-100 text-gray-800 border-gray-300',
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
        const trendColor = kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-500';

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
                  <span className="text-muted-foreground mr-1">من الفترة السابقة</span>
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
                        kpi.status === 'success' ? 'bg-emerald-500' :
                        kpi.status === 'warning' ? 'bg-amber-500' :
                        kpi.status === 'danger' ? 'bg-red-500' : 'bg-gray-400'
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
