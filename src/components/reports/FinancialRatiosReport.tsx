import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialAnalytics } from '@/hooks/useFinancialAnalytics';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { FinancialRatioKPI } from '@/types/reports/index';

const ratioInfo: Record<string, { label: string; description: string; goodAbove?: boolean }> = {
  current_ratio: {
    label: 'نسبة السيولة الجارية',
    description: 'القدرة على سداد الالتزامات قصيرة الأجل',
    goodAbove: true,
  },
  quick_ratio: {
    label: 'نسبة السيولة السريعة',
    description: 'السيولة باستثناء المخزون',
    goodAbove: true,
  },
  debt_to_assets: {
    label: 'نسبة الدين إلى الأصول',
    description: 'مدى اعتماد الوقف على الديون',
    goodAbove: false,
  },
  debt_to_equity: {
    label: 'نسبة الدين إلى حقوق الملكية',
    description: 'الهيكل التمويلي للوقف',
    goodAbove: false,
  },
  profit_margin: {
    label: 'هامش الربح',
    description: 'نسبة الربح من الإيرادات',
    goodAbove: true,
  },
  roa: {
    label: 'العائد على الأصول',
    description: 'كفاءة استخدام الأصول',
    goodAbove: true,
  },
  roe: {
    label: 'العائد على حقوق الملكية',
    description: 'عائد المساهمين',
    goodAbove: true,
  },
  expense_ratio: {
    label: 'نسبة المصروفات',
    description: 'نسبة المصروفات من الإيرادات',
    goodAbove: false,
  },
};

export function FinancialRatiosReport() {
  const { kpis, isLoading } = useFinancialAnalytics();

  const latestKPIs = kpis.reduce((acc: Record<string, FinancialRatioKPI>, kpi) => {
    if (!acc[kpi.kpi_name] || new Date(kpi.created_at) > new Date(acc[kpi.kpi_name].created_at)) {
      acc[kpi.kpi_name] = kpi;
    }
    return acc;
  }, {} as Record<string, FinancialRatioKPI>);

  const getStatus = (kpi: FinancialRatioKPI) => {
    if (!kpi.kpi_target) return 'neutral';
    const info = ratioInfo[kpi.kpi_name];
    if (!info) return 'neutral';

    if (info.goodAbove) {
      return kpi.kpi_value >= kpi.kpi_target ? 'good' : 'warning';
    } else {
      return kpi.kpi_value <= kpi.kpi_target ? 'good' : 'warning';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">جاري التحميل...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          تقرير النسب والمؤشرات المالية
        </CardTitle>
        <CardDescription>
          تحليل النسب المالية الرئيسية ومؤشرات الأداء
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(latestKPIs).map(([name, kpi]) => {
            const info = ratioInfo[name];
            if (!info) return null;

            const status = getStatus(kpi);
            const achievement = kpi.kpi_target 
              ? Math.min((kpi.kpi_value / kpi.kpi_target) * 100, 150)
              : 0;

            return (
              <Card key={kpi.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{info.label}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {info.description}
                      </CardDescription>
                    </div>
                    {status === 'good' && (
                      <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                    {status === 'warning' && (
                      <TrendingDown className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold">
                      {kpi.kpi_value.toFixed(2)}
                    </div>
                    {name.includes('margin') || name.includes('expense') ? (
                      <span className="text-muted-foreground mb-1">%</span>
                    ) : name.includes('ratio') ? (
                      <span className="text-muted-foreground mb-1">x</span>
                    ) : null}
                  </div>

                  {kpi.kpi_target && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          الهدف: {kpi.kpi_target.toFixed(2)}
                        </span>
                        <Badge
                          variant={status === 'good' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {achievement.toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress
                        value={achievement}
                        className="h-2"
                      />
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    آخر تحديث: {new Date(kpi.created_at).toLocaleDateString('ar-SA')}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {Object.keys(latestKPIs).length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد نسب مالية محسوبة</p>
              <p className="text-sm mt-2">انتقل إلى تبويب "التحليلات المالية" لحساب المؤشرات</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
