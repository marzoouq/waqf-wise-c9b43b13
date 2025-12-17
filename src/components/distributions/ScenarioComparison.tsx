import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimulationResult } from '@/hooks/distributions/useDistributionEngine';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ScenarioComparisonProps {
  scenarios: SimulationResult[];
  onExport?: () => void;
}

const patternNames: Record<string, string> = {
  shariah: 'التوزيع الشرعي',
  equal: 'التوزيع المتساوي',
  need_based: 'التوزيع حسب الحاجة',
  custom: 'التوزيع المخصص',
  hybrid: 'التوزيع المختلط',
};

const patternColors: Record<string, string> = {
  shariah: 'bg-success',
  equal: 'bg-info',
  need_based: 'bg-warning',
  custom: 'bg-primary',
  hybrid: 'bg-accent',
};

export function ScenarioComparison({ scenarios, onExport }: ScenarioComparisonProps) {
  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">لا توجد سيناريوهات للمقارنة</p>
        </CardContent>
      </Card>
    );
  }

  // حساب الإحصائيات المقارنة
  const beneficiaryComparison = scenarios[0].results.map((result, index) => {
    const amounts = scenarios.map(s => s.results[index]?.allocated_amount || 0);
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = max - min;
    const variancePercent = ((variance / avg) * 100).toFixed(1);

    return {
      beneficiary: result.beneficiary_name,
      amounts,
      max,
      min,
      avg,
      variance,
      variancePercent,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>مقارنة السيناريوهات</CardTitle>
              <CardDescription>
                مقارنة {scenarios.length} نمط توزيع مختلف
              </CardDescription>
            </div>
            {onExport && (
              <Button onClick={onExport} variant="outline" size="sm">
                <Download className="h-4 w-4 ms-2" />
                تصدير التقرير
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* ملخص السيناريوهات */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <Card key={scenario.pattern}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className={patternColors[scenario.pattern]}>
                  {patternNames[scenario.pattern] || scenario.pattern}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">إجمالي الموزع:</span>
                <span className="font-semibold">
                  {scenario.summary.total_distributed.toLocaleString()} ر.س
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المستفيدون:</span>
                <span className="font-semibold">
                  {scenario.summary.beneficiaries_count}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">متوسط/مستفيد:</span>
                <span className="font-semibold">
                  {Math.round(
                    scenario.summary.total_distributed / scenario.summary.beneficiaries_count
                  ).toLocaleString()}{' '}
                  ر.س
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* مقارنة تفصيلية للمستفيدين */}
      <Card>
        <CardHeader>
          <CardTitle>المقارنة التفصيلية</CardTitle>
          <CardDescription>الفروقات في المبالغ المخصصة لكل مستفيد</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {beneficiaryComparison.map((comparison, index) => (
                <div key={comparison.beneficiary}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{comparison.beneficiary}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>التباين: {comparison.variancePercent}%</span>
                        {parseFloat(comparison.variancePercent) > 20 && (
                          <TrendingUp className="h-4 w-4 text-warning" />
                        )}
                        {parseFloat(comparison.variancePercent) < 5 && (
                          <Minus className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      {scenarios.map((scenario, sIndex) => {
                        const amount = comparison.amounts[sIndex];
                        const isMax = amount === comparison.max;
                        const isMin = amount === comparison.min;

                        return (
                          <div
                            key={`${scenario.pattern}-${comparison.beneficiary}-${sIndex}`}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              isMax ? 'bg-success/10 dark:bg-success/20' : 
                              isMin ? 'bg-destructive/10 dark:bg-destructive/20' : 
                              'bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${patternColors[scenario.pattern]}`}
                              />
                              <span className="text-sm">
                                {patternNames[scenario.pattern]}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {amount.toLocaleString()} ر.س
                              </span>
                              {isMax && <TrendingUp className="h-3 w-3 text-success" />}
                              {isMin && <TrendingDown className="h-3 w-3 text-destructive" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">الأعلى:</span>{' '}
                        {comparison.max.toLocaleString()} ر.س
                      </div>
                      <div>
                        <span className="font-medium">المتوسط:</span>{' '}
                        {Math.round(comparison.avg).toLocaleString()} ر.س
                      </div>
                      <div>
                        <span className="font-medium">الأدنى:</span>{' '}
                        {comparison.min.toLocaleString()} ر.س
                      </div>
                    </div>
                  </div>
                  {index < beneficiaryComparison.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ملخص الفروقات */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الفروقات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">أعلى تباين</p>
              <p className="text-2xl font-bold">
                {Math.max(...beneficiaryComparison.map(b => parseFloat(b.variancePercent)))}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">متوسط التباين</p>
              <p className="text-2xl font-bold">
                {(
                  beneficiaryComparison.reduce((sum, b) => sum + parseFloat(b.variancePercent), 0) /
                  beneficiaryComparison.length
                ).toFixed(1)}
                %
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">مستفيدون متأثرون بشدة</p>
              <p className="text-2xl font-bold">
                {beneficiaryComparison.filter(b => parseFloat(b.variancePercent) > 20).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
