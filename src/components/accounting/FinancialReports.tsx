import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Download, TrendingUp, TrendingDown, Building, Wallet, Scale } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Badge } from '@/components/ui/badge';
import { useFinancialReportsData } from '@/hooks/accounting/useFinancialReportsData';
import { AccountingService } from '@/services/accounting.service';

/**
 * مكون التقارير المالية
 * يعرض ميزان المراجعة، قائمة الدخل، والميزانية العمومية
 */
export function FinancialReports() {
  const [selectedReport, setSelectedReport] = useState('trial-balance');
  const { 
    trialBalance, 
    accounts, 
    totalRevenue, 
    totalExpense, 
    netIncome, 
    isLoading,
    error,
    refetch
  } = useFinancialReportsData();

  // جلب الميزانية العمومية
  const { data: balanceSheet, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['balance-sheet'],
    queryFn: () => AccountingService.getBalanceSheet(),
  });

  if (isLoading) {
    return <LoadingState message="جاري تحميل التقارير المالية..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل التقارير المالية" onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
          التقارير المالية
        </h2>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Download className="h-4 w-4 ms-2" />
          <span className="hidden sm:inline">تصدير PDF</span>
          <span className="sm:hidden">تصدير</span>
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
                    {trialBalance.map((item) => (
                      <tr key={item.code} className="border-t hover:bg-muted/50">
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
                  <TrendingUp className="h-5 w-5 text-success" />
                  الإيرادات
                </h3>
                <div className="space-y-2">
                  {accounts
                    .filter(acc => acc.account_type === 'revenue')
                    .map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted"
                      >
                        <span className="text-sm">
                          {acc.code} - {acc.name_ar}
                        </span>
                        <span className="font-mono text-success">
                          {(acc.current_balance || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded font-semibold">
                    <span>إيرادات الفترة</span>
                    <span className="font-mono">
                      {totalRevenue.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                    </span>
                  </div>
                </div>
              </div>

              {/* المصروفات */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  المصروفات
                </h3>
                <div className="space-y-2">
                  {accounts
                    .filter(acc => acc.account_type === 'expense')
                    .map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted"
                      >
                        <span className="text-sm">
                          {acc.code} - {acc.name_ar}
                        </span>
                        <span className="font-mono text-destructive">
                          {(acc.current_balance || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded font-semibold">
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
                    ? 'bg-success/10'
                    : 'bg-destructive/10'
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
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                الميزانية العمومية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="text-center py-8 text-muted-foreground">جاري تحميل الميزانية...</div>
              ) : balanceSheet ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* الأصول */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
                      <Building className="h-5 w-5" />
                      الأصول
                    </h3>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">الأصول المتداولة</span>
                          <span className="font-mono font-medium">
                            {balanceSheet.assets.current.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">الأصول الثابتة</span>
                          <span className="font-mono font-medium">
                            {balanceSheet.assets.fixed.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                          </span>
                        </div>
                        <div className="border-t pt-3 flex justify-between items-center font-bold">
                          <span>إجمالي الأصول</span>
                          <span className="font-mono text-primary">
                            {balanceSheet.assets.total.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* الخصوم وحقوق الملكية */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-destructive">
                      <Wallet className="h-5 w-5" />
                      الخصوم وحقوق الملكية
                    </h3>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">الخصوم المتداولة</span>
                          <span className="font-mono font-medium">
                            {balanceSheet.liabilities.current.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">الخصوم طويلة الأجل</span>
                          <span className="font-mono font-medium">
                            {balanceSheet.liabilities.longTerm.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-3">
                          <span className="font-medium">إجمالي الخصوم</span>
                          <span className="font-mono">
                            {balanceSheet.liabilities.total.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                          </span>
                        </div>
                        
                        <div className="border-t pt-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">رأس المال</span>
                            <span className="font-mono font-medium">
                              {balanceSheet.equity.capital.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">الاحتياطيات</span>
                            <span className="font-mono font-medium">
                              {balanceSheet.equity.reserves.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                            </span>
                          </div>
                          {balanceSheet.retainedEarnings !== 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">الأرباح المحتجزة</span>
                              <span className={`font-mono font-medium ${balanceSheet.retainedEarnings >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {balanceSheet.retainedEarnings.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="border-t pt-3 flex justify-between items-center font-bold">
                          <span>إجمالي الخصوم وحقوق الملكية</span>
                          <span className="font-mono text-primary">
                            {(balanceSheet.liabilities.total + balanceSheet.equity.total + balanceSheet.retainedEarnings).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بيانات متاحة
                </div>
              )}
              
              {/* ملخص التوازن */}
              {balanceSheet && (
                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">التحقق من التوازن</span>
                    {Math.abs(balanceSheet.assets.total - (balanceSheet.liabilities.total + balanceSheet.equity.total + balanceSheet.retainedEarnings)) < 0.01 ? (
                      <Badge className="bg-success text-success-foreground">
                        الميزانية متوازنة ✓
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        هناك فرق: {(balanceSheet.assets.total - (balanceSheet.liabilities.total + balanceSheet.equity.total + balanceSheet.retainedEarnings)).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
