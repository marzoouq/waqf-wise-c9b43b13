import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { useFinancialAnalytics } from '@/hooks/accounting/useFinancialAnalytics';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { FinancialKPI, KPIsByName, KPIsByCategory } from '@/types/financial';
import { productionLogger } from '@/lib/logger/production-logger';

const kpiLabels: Record<string, string> = {
  current_ratio: 'نسبة السيولة الجارية',
  quick_ratio: 'نسبة السيولة السريعة',
  debt_to_assets: 'نسبة الدين إلى الأصول',
  debt_to_equity: 'نسبة الدين إلى حقوق الملكية',
  profit_margin: 'هامش الربح',
  roa: 'العائد على الأصول',
  roe: 'العائد على حقوق الملكية',
  expense_ratio: 'نسبة المصروفات',
};

const kpiCategories: Record<string, string> = {
  liquidity: 'السيولة',
  leverage: 'الرافعة المالية',
  profitability: 'الربحية',
  efficiency: 'الكفاءة',
};

export function FinancialAnalyticsDashboard() {
  const [isCalculating, setIsCalculating] = useState(false);
  const { kpis, calculateKPIs } = useFinancialAnalytics();

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      await calculateKPIs({
        periodStart: startDate.toISOString().split('T')[0],
        periodEnd: endDate.toISOString().split('T')[0],
      });
    } catch (error) {
      productionLogger.error('Error calculating KPIs', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getKPIStatus = (kpi: FinancialKPI) => {
    if (!kpi.kpi_target) return 'neutral';
    
    const isGoodAbove = ['current_ratio', 'quick_ratio', 'profit_margin', 'roa', 'roe'].includes(kpi.kpi_name);
    const isGoodBelow = ['debt_to_assets', 'debt_to_equity', 'expense_ratio'].includes(kpi.kpi_name);

    if (isGoodAbove) {
      return kpi.kpi_value >= kpi.kpi_target ? 'good' : 'warning';
    } else if (isGoodBelow) {
      return kpi.kpi_value <= kpi.kpi_target ? 'good' : 'warning';
    }
    return 'neutral';
  };

  const latestKPIs = kpis.reduce<KPIsByName>((acc, kpi) => {
    if (!acc[kpi.kpi_name] || new Date(kpi.created_at) > new Date(acc[kpi.kpi_name].created_at)) {
      acc[kpi.kpi_name] = kpi as FinancialKPI;
    }
    return acc;
  }, {});

  const groupedKPIs = Object.values(latestKPIs).reduce<KPIsByCategory>((acc, kpi) => {
    const category = kpi.kpi_category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(kpi);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                مؤشرات الأداء المالي
              </CardTitle>
              <CardDescription>
                تحليلات شاملة للوضع المالي ومؤشرات الأداء الرئيسية
              </CardDescription>
            </div>
            <Button onClick={handleCalculate} disabled={isCalculating}>
              <RefreshCw className={`h-4 w-4 ms-2 ${isCalculating ? 'animate-spin' : ''}`} />
              حساب المؤشرات
            </Button>
          </div>
        </CardHeader>
      </Card>

      {Object.entries(groupedKPIs).map(([category, categoryKPIs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">
              {kpiCategories[category] || category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryKPIs.map((kpi) => {
                const status = getKPIStatus(kpi);
                return (
                  <Card key={kpi.id} className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardDescription className="text-sm">
                          {kpiLabels[kpi.kpi_name] || kpi.kpi_name}
                        </CardDescription>
                        {status === 'good' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {status === 'warning' && <TrendingDown className="h-4 w-4 text-yellow-500" />}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-end gap-2">
                          <div className="text-3xl font-bold">
                            {kpi.kpi_value.toFixed(2)}
                          </div>
                          {kpi.kpi_name.includes('ratio') || kpi.kpi_name.includes('margin') ? (
                            <div className="text-sm text-muted-foreground mb-1">
                              {kpi.kpi_name.includes('margin') ? '%' : 'x'}
                            </div>
                          ) : null}
                        </div>
                        {kpi.kpi_target && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>الهدف: {kpi.kpi_target.toFixed(2)}</span>
                              <span>
                                {((kpi.kpi_value / kpi.kpi_target) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <Progress
                              value={Math.min((kpi.kpi_value / kpi.kpi_target) * 100, 100)}
                              className="h-2"
                            />
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          آخر تحديث: {new Date(kpi.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(groupedKPIs).length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              لا توجد مؤشرات أداء محسوبة. انقر على "حساب المؤشرات" للبدء.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
