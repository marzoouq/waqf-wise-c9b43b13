import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function BudgetVarianceReport() {
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('');

  const { data: fiscalYears } = useQuery({
    queryKey: ['fiscal_years'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiscal_years')
        .select('*')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets_variance', selectedFiscalYear],
    queryFn: async () => {
      if (!selectedFiscalYear) return [];

      const { data, error } = await supabase
        .from('budgets')
        .select('*, accounts(code, name_ar)')
        .eq('fiscal_year_id', selectedFiscalYear)
        .order('variance_amount', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedFiscalYear,
  });

  const getVarianceStatus = (variance: number, budgeted: number) => {
    const percentage = (variance / budgeted) * 100;
    if (Math.abs(percentage) <= 5) return 'good';
    if (Math.abs(percentage) <= 15) return 'warning';
    return 'critical';
  };

  const getVarianceBadge = (variance: number) => {
    if (variance > 0) {
      return <Badge className="bg-green-600">فائض</Badge>;
    } else if (variance < 0) {
      return <Badge variant="destructive">عجز</Badge>;
    }
    return <Badge variant="secondary">متطابق</Badge>;
  };

  const summary = budgets?.reduce(
    (acc, budget) => ({
      totalBudgeted: acc.totalBudgeted + budget.budgeted_amount,
      totalActual: acc.totalActual + (budget.actual_amount || 0),
      totalVariance: acc.totalVariance + (budget.variance_amount || 0),
    }),
    { totalBudgeted: 0, totalActual: 0, totalVariance: 0 }
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                تقرير مقارنة الميزانيات
              </CardTitle>
              <CardDescription>
                مقارنة الموازنة المخططة مع الفعلية وتحليل الانحرافات
              </CardDescription>
            </div>
            <Select value={selectedFiscalYear} onValueChange={setSelectedFiscalYear}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر السنة المالية" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears?.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        {selectedFiscalYear && summary && (
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">إجمالي المخطط</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(summary.totalBudgeted)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">إجمالي الفعلي</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(summary.totalActual)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">إجمالي الانحراف</div>
                  <div className={`text-2xl font-bold ${summary.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(summary.totalVariance))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {selectedFiscalYear && (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الحساب</TableHead>
                    <TableHead>الفترة</TableHead>
                    <TableHead className="text-right">المخطط</TableHead>
                    <TableHead className="text-right">الفعلي</TableHead>
                    <TableHead className="text-right">الانحراف</TableHead>
                    <TableHead>نسبة التنفيذ</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : !budgets || budgets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        لا توجد بيانات ميزانيات للسنة المحددة
                      </TableCell>
                    </TableRow>
                  ) : (
                    budgets.map((budget) => {
                      const variance = budget.variance_amount || 0;
                      const utilization = budget.budgeted_amount > 0
                        ? ((budget.actual_amount || 0) / budget.budgeted_amount) * 100
                        : 0;
                      const status = getVarianceStatus(variance, budget.budgeted_amount);

                      return (
                        <TableRow key={budget.id}>
                          <TableCell>
                            <div className="font-medium">{budget.accounts?.name_ar}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {budget.accounts?.code}
                            </div>
                          </TableCell>
                          <TableCell>
                            {budget.period_type === 'annual' ? 'سنوي' : `الفترة ${budget.period_number}`}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(budget.budgeted_amount)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(budget.actual_amount || 0)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {variance >= 0 ? '+' : ''}{formatCurrency(Math.abs(variance))}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{utilization.toFixed(1)}%</div>
                              <Progress value={Math.min(utilization, 100)} className="h-1.5" />
                            </div>
                          </TableCell>
                          <TableCell>
                            {getVarianceBadge(variance)}
                            {status === 'critical' && (
                              <AlertTriangle className="h-4 w-4 text-red-600 inline mr-1" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
