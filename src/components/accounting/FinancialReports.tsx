import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { Badge } from '@/components/ui/badge';
import type { TrialBalanceItem, AccountWithBalance } from '@/types/accounting';

/**
 * مكون التقارير المالية
 * يعرض ميزان المراجعة، قائمة الدخل، والميزانية العمومية
 */
export function FinancialReports() {
  const [selectedReport, setSelectedReport] = useState('trial-balance');

  // ميزان المراجعة
  const { data: trialBalance = [], isLoading: loadingTrial } = useQuery({
    queryKey: ['trial-balance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trial_balance')
        .select('*');
      if (error) throw error;
      return (data || []) as TrialBalanceItem[];
    },
  });

  // قائمة الدخل - حساب يدوي
  const { data: accounts = [], isLoading: loadingIncome } = useQuery({
    queryKey: ['accounts-with-balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, code, name_ar, account_type, account_nature, current_balance')
        .in('account_type', ['revenue', 'expense'])
        .eq('is_active', true);
      
      if (error) throw error;
      return (data || []) as AccountWithBalance[];
    },
  });

  const totalRevenue = accounts
    .filter(acc => acc.account_type === 'revenue')
    .reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

  const totalExpense = accounts
    .filter(acc => acc.account_type === 'expense')
    .reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

  const netIncome = totalRevenue - totalExpense;

  if (loadingTrial || loadingIncome) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          التقارير المالية
        </h2>
        <Button variant="outline">
          <Download className="h-4 w-4 ml-2" />
          تصدير PDF
        </Button>
      </div>

      <Tabs value={selectedReport} onValueChange={setSelectedReport}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trial-balance">ميزان المراجعة</TabsTrigger>
          <TabsTrigger value="income-statement">قائمة الدخل</TabsTrigger>
          <TabsTrigger value="balance-sheet">الميزانية العمومية</TabsTrigger>
        </TabsList>

        {/* ميزان المراجعة */}
        <TabsContent value="trial-balance">
          <Card>
            <CardHeader>
              <CardTitle>ميزان المراجعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-right">رمز الحساب</th>
                      <th className="p-3 text-right">اسم الحساب</th>
                      <th className="p-3 text-left">مدين</th>
                      <th className="p-3 text-left">دائن</th>
                      <th className="p-3 text-left">الرصيد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trialBalance.map((item, index) => (
                      <tr key={index} className="border-t hover:bg-muted/50">
                        <td className="p-3 font-mono">{item.code}</td>
                        <td className="p-3">{item.name_ar}</td>
                        <td className="p-3 text-left font-mono">
                          {(item.total_debit || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-left font-mono">
                          {(item.total_credit || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-left font-mono font-medium">
                          {(item.balance || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted font-bold">
                    <tr>
                      <td colSpan={2} className="p-3">الإجمالي</td>
                      <td className="p-3 text-left font-mono">
                        {trialBalance
                          .reduce((sum, item) => sum + (item.total_debit || 0), 0)
                          .toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-left font-mono">
                        {trialBalance
                          .reduce((sum, item) => sum + (item.total_credit || 0), 0)
                          .toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* قائمة الدخل */}
        <TabsContent value="income-statement">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الدخل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* الإيرادات */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  الإيرادات
                </h3>
                <div className="space-y-2">
                  {accounts
                    .filter(acc => acc.account_type === 'revenue')
                    .map((acc: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted"
                      >
                        <span className="text-sm">
                          {acc.code} - {acc.name_ar}
                        </span>
                        <span className="font-mono text-green-600">
                          {(acc.current_balance || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-950 rounded font-semibold">
                    <span>إجمالي الإيرادات</span>
                    <span className="font-mono">
                      {totalRevenue.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                    </span>
                  </div>
                </div>
              </div>

              {/* المصروفات */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  المصروفات
                </h3>
                <div className="space-y-2">
                  {accounts
                    .filter(acc => acc.account_type === 'expense')
                    .map((acc: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted"
                      >
                        <span className="text-sm">
                          {acc.code} - {acc.name_ar}
                        </span>
                        <span className="font-mono text-red-600">
                          {(acc.current_balance || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  <div className="flex items-center justify-between p-3 bg-red-100 dark:bg-red-950 rounded font-semibold">
                    <span>إجمالي المصروفات</span>
                    <span className="font-mono">
                      {totalExpense.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                    </span>
                  </div>
                </div>
              </div>

              {/* صافي الدخل */}
              <div
                className={`p-4 rounded-lg ${
                  netIncome >= 0
                    ? 'bg-green-100 dark:bg-green-950'
                    : 'bg-red-100 dark:bg-red-950'
                }`}
              >
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>صافي الدخل</span>
                  <span className="font-mono">
                    {netIncome.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                  </span>
                </div>
                <Badge
                  variant={netIncome >= 0 ? 'default' : 'destructive'}
                  className="mt-2"
                >
                  {netIncome >= 0 ? 'ربح' : 'خسارة'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الميزانية العمومية */}
        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader>
              <CardTitle>الميزانية العمومية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                قريباً: عرض الأصول والخصوم وحقوق الملكية
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
