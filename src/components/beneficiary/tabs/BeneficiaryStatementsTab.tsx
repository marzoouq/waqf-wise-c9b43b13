/**
 * تبويب كشف الحساب - الحركات المالية
 * يركز على: الرصيد الافتتاحي، الإيداعات، السحوبات، الرصيد الختامي
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, TrendingDown, Wallet, ArrowDownToLine, ArrowUpFromLine, Scale } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { useBeneficiaryStatements } from "@/hooks/beneficiary/useBeneficiaryTabsData";
import { useBeneficiaryDistributions } from "@/hooks/beneficiary/useBeneficiaryDistributions";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { toast } from "sonner";
import { productionLogger } from "@/lib/logger/production-logger";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useBeneficiaryExport } from "@/hooks/beneficiary/useBeneficiaryExport";
import { formatCurrency } from "@/lib/utils";

interface BeneficiaryStatementsTabProps {
  beneficiaryId: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
  reference?: string;
  source?: string;
}

export function BeneficiaryStatementsTab({ beneficiaryId }: BeneficiaryStatementsTabProps) {
  const { settings } = useVisibilitySettings();
  const isMobile = useIsMobile();
  const { data: payments = [], isLoading: paymentsLoading } = useBeneficiaryStatements(beneficiaryId);
  const { distributions, totalDistributed, isLoading: distributionsLoading } = useBeneficiaryDistributions(beneficiaryId);
  const { exportJournalEntries } = useBeneficiaryExport();

  const isLoading = paymentsLoading || distributionsLoading;
  const masked = settings?.mask_exact_amounts || false;

  // تحويل التوزيعات إلى معاملات
  const transactions: Transaction[] = distributions.map((dist, index) => {
    const previousTotal = distributions
      .slice(index + 1)
      .reduce((sum, d) => sum + (d.share_amount || 0), 0);
    
    return {
      id: dist.id,
      date: dist.distribution_date,
      description: `توزيع أرباح - ${dist.fiscal_years?.name || 'سنة مالية'}`,
      type: 'credit' as const,
      amount: dist.share_amount || 0,
      balance: previousTotal + (dist.share_amount || 0),
      reference: dist.fiscal_years?.name,
      source: 'distribution',
    };
  });

  // حساب الإحصائيات
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalCredits - totalDebits;

  const handleExport = async () => {
    try {
      const journalEntries = await exportJournalEntries();

      if ((!journalEntries || journalEntries.length === 0) && transactions.length === 0) {
        toast.warning('لا توجد معاملات لتصديرها');
        return;
      }

      // تصدير المعاملات
      const headers = ['التاريخ', 'الوصف', 'النوع', 'المبلغ', 'الرصيد'];
      const rows = transactions.map(t => [
        format(new Date(t.date), "dd/MM/yyyy", { locale: ar }),
        t.description,
        t.type === 'credit' ? 'إيداع' : 'سحب',
        t.amount.toFixed(2),
        t.balance.toFixed(2),
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `كشف_حساب_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success('تم تصدير كشف الحساب بنجاح');
    } catch (error) {
      productionLogger.error('Export failed', error);
      toast.error('فشل تصدير كشف الحساب');
    }
  };

  return (
    <div className="space-y-6">
      {/* ملخص الحساب */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-success/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <ArrowDownToLine className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي الإيداعات</p>
                <p className="text-lg font-bold text-success">
                  {masked ? (
                    <MaskedValue value={String(totalCredits)} type="amount" masked />
                  ) : (
                    formatCurrency(totalCredits)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <ArrowUpFromLine className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي السحوبات</p>
                <p className="text-lg font-bold text-destructive">
                  {masked ? (
                    <MaskedValue value={String(totalDebits)} type="amount" masked />
                  ) : (
                    formatCurrency(totalDebits)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الرصيد الحالي</p>
                <p className="text-lg font-bold text-primary">
                  {masked ? (
                    <MaskedValue value={String(currentBalance)} type="amount" masked />
                  ) : (
                    formatCurrency(currentBalance)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">عدد المعاملات</p>
                <p className="text-lg font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول المعاملات */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              كشف الحساب التفصيلي
            </CardTitle>
            <CardDescription>جميع الحركات المالية على حسابك</CardDescription>
          </div>
          {settings?.allow_export_pdf && transactions.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 ms-2" />
              تصدير
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">لا توجد معاملات مسجلة بعد</p>
            </div>
          ) : isMobile ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="bg-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {transaction.type === 'credit' ? (
                          <div className="p-1.5 rounded-full bg-success/10">
                            <TrendingUp className="h-4 w-4 text-success" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-full bg-destructive/10">
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ar })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={transaction.type === 'credit' ? 'default' : 'destructive'}>
                        {transaction.type === 'credit' ? 'إيداع' : 'سحب'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">المبلغ</span>
                      <span className={`font-bold ${transaction.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        {masked ? (
                          <MaskedValue value={String(transaction.amount)} type="amount" masked />
                        ) : (
                          formatCurrency(transaction.amount)
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الرصيد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-sm">
                          {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ar })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.type === 'credit' ? (
                              <TrendingUp className="h-4 w-4 text-success" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                            <span>{transaction.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'credit' ? 'default' : 'destructive'} className="gap-1">
                            {transaction.type === 'credit' ? (
                              <>
                                <ArrowDownToLine className="h-3 w-3" />
                                إيداع
                              </>
                            ) : (
                              <>
                                <ArrowUpFromLine className="h-3 w-3" />
                                سحب
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-semibold ${transaction.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {masked ? (
                            <MaskedValue value={String(transaction.amount)} type="amount" masked />
                          ) : (
                            formatCurrency(transaction.amount)
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {masked ? (
                            <MaskedValue value={String(transaction.balance)} type="amount" masked />
                          ) : (
                            formatCurrency(transaction.balance)
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* صف الإجمالي */}
                    <TableRow className="bg-primary/5 font-bold">
                      <TableCell colSpan={3}>الرصيد الختامي</TableCell>
                      <TableCell />
                      <TableCell className="text-primary">
                        {masked ? (
                          <MaskedValue value={String(currentBalance)} type="amount" masked />
                        ) : (
                          formatCurrency(currentBalance)
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
