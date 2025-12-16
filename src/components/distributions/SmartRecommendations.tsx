import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimulationResult } from '@/hooks/distributions/useDistributionEngine';
import { Lightbulb, TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SmartRecommendationsProps {
  scenarios: SimulationResult[];
  onSelectScenario?: (pattern: string) => void;
}

export function SmartRecommendations({ scenarios, onSelectScenario }: SmartRecommendationsProps) {
  if (scenarios.length === 0) {
    return null;
  }

  // تحليل السيناريوهات
  const analysis = {
    mostEquitable: analyzeMostEquitable(scenarios),
    mostEfficient: analyzeMostEfficient(scenarios),
    balancedOption: analyzeBalancedOption(scenarios),
    warnings: generateWarnings(scenarios),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle>التوصيات الذكية</CardTitle>
            <CardDescription>تحليل تلقائي للسيناريوهات واقتراح الأنسب</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* التوصية الرئيسية */}
        <Alert className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                التوصية الرئيسية: {getPatternName(analysis.balancedOption.pattern)}
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                {analysis.balancedOption.reason}
              </p>
            </div>
            {onSelectScenario && (
              <Button
                onClick={() => onSelectScenario(analysis.balancedOption.pattern)}
                size="sm"
                variant="outline"
                className="me-4"
              >
                اختيار
              </Button>
            )}
          </AlertDescription>
        </Alert>

        {/* تحليلات إضافية */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* الأكثر عدالة */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">الأكثر عدالة</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="outline" className="mb-2">
                {getPatternName(analysis.mostEquitable.pattern)}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {analysis.mostEquitable.reason}
              </p>
              {onSelectScenario && (
                <Button
                  onClick={() => onSelectScenario(analysis.mostEquitable.pattern)}
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2"
                >
                  اختيار
                </Button>
              )}
            </CardContent>
          </Card>

          {/* الأكثر كفاءة */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <CardTitle className="text-base">الأكثر كفاءة</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="outline" className="mb-2">
                {getPatternName(analysis.mostEfficient.pattern)}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {analysis.mostEfficient.reason}
              </p>
              {onSelectScenario && (
                <Button
                  onClick={() => onSelectScenario(analysis.mostEfficient.pattern)}
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2"
                >
                  اختيار
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* التحذيرات */}
        {analysis.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              ملاحظات مهمة
            </h4>
            {analysis.warnings.map((warning, index) => (
              <Alert key={`warning-${index}`} variant="destructive">
                <AlertDescription className="text-sm">{warning}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// دوال مساعدة للتحليل
function analyzeMostEquitable(scenarios: SimulationResult[]) {
  // حساب الانحراف المعياري لكل سيناريو
  const deviations = scenarios.map(scenario => {
    const amounts = scenario.results.map(r => r.allocated_amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      pattern: scenario.pattern,
      stdDev,
      coefficient: (stdDev / mean) * 100, // معامل التباين
    };
  });

  const mostEquitable = deviations.reduce((min, curr) => 
    curr.coefficient < min.coefficient ? curr : min
  );

  return {
    pattern: mostEquitable.pattern,
    reason: `أقل تباين في المبالغ (${mostEquitable.coefficient.toFixed(1)}%)، مما يضمن توزيع أكثر عدالة`,
  };
}

function analyzeMostEfficient(scenarios: SimulationResult[]) {
  // التوزيع حسب الحاجة هو الأكثر كفاءة عادةً
  const needBased = scenarios.find(s => s.pattern === 'need_based');
  if (needBased) {
    return {
      pattern: 'need_based',
      reason: 'يوجه الموارد للأكثر احتياجاً، مما يحقق أقصى تأثير اجتماعي',
    };
  }

  // إذا لم يكن موجوداً، اختر الشرعي
  return {
    pattern: scenarios[0].pattern,
    reason: 'يحقق توازن جيد بين العدالة والكفاءة',
  };
}

function analyzeBalancedOption(scenarios: SimulationResult[]) {
  // المختلط هو الأفضل إذا كان موجوداً
  const hybrid = scenarios.find(s => s.pattern === 'hybrid');
  if (hybrid) {
    return {
      pattern: 'hybrid',
      reason: 'يجمع بين مزايا التوزيع الشرعي والتوزيع حسب الحاجة، مما يحقق توازن مثالي',
    };
  }

  // الشرعي هو الخيار الآمن
  const shariah = scenarios.find(s => s.pattern === 'shariah');
  if (shariah) {
    return {
      pattern: 'shariah',
      reason: 'يتبع الأنصبة الشرعية المعتمدة، وهو الأنسب للأوقاف الشرعية',
    };
  }

  // افتراضي
  return {
    pattern: scenarios[0].pattern,
    reason: 'خيار متوازن بين مختلف المعايير',
  };
}

function generateWarnings(scenarios: SimulationResult[]): string[] {
  const warnings: string[] = [];

  // تحقق من وجود فروقات كبيرة
  scenarios.forEach(scenario => {
    const amounts = scenario.results.map(r => r.allocated_amount);
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);
    const ratio = max / min;

    if (ratio > 5) {
      warnings.push(
        `${getPatternName(scenario.pattern)}: فرق كبير بين أعلى وأدنى مبلغ (${ratio.toFixed(1)}x)`
      );
    }
  });

  // تحقق من عدم توافق المبلغ الكامل
  scenarios.forEach(scenario => {
    const diff = Math.abs(
      scenario.summary.distributable_amount - scenario.summary.total_distributed
    );
    if (diff > 10) {
      warnings.push(
        `${getPatternName(scenario.pattern)}: فرق ${diff.toFixed(2)} ر.س بين المبلغ القابل للتوزيع والموزع فعلياً`
      );
    }
  });

  return warnings;
}

function getPatternName(pattern: string): string {
  const names: Record<string, string> = {
    shariah: 'التوزيع الشرعي',
    equal: 'التوزيع المتساوي',
    need_based: 'التوزيع حسب الحاجة',
    custom: 'التوزيع المخصص',
    hybrid: 'التوزيع المختلط',
  };
  return names[pattern] || pattern;
}
