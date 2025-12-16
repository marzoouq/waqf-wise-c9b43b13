import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Download, FileText } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { useBeneficiaryStatements } from "@/hooks/beneficiary/useBeneficiaryTabsData";
import { useBeneficiaryDistributions } from "@/hooks/beneficiary/useBeneficiaryDistributions";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { toast } from "sonner";
import { productionLogger } from "@/lib/logger/production-logger";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { MobileStatementCard } from "../cards/MobileStatementCard";
import { useBeneficiaryExport } from "@/hooks/beneficiary/useBeneficiaryExport";
import { formatCurrency } from "@/lib/utils";

interface BeneficiaryStatementsTabProps {
  beneficiaryId: string;
}

export function BeneficiaryStatementsTab({ beneficiaryId }: BeneficiaryStatementsTabProps) {
  const { settings } = useVisibilitySettings();
  const isMobile = useIsMobile();
  const { data: payments = [], isLoading: paymentsLoading } = useBeneficiaryStatements(beneficiaryId);
  const { distributions, isLoading: distributionsLoading } = useBeneficiaryDistributions(beneficiaryId);
  const { exportJournalEntries } = useBeneficiaryExport();

  const isLoading = paymentsLoading || distributionsLoading;
  
  // حساب إجمالي التوزيعات
  const totalDistributed = distributions?.reduce((sum, d) => sum + (d.share_amount || 0), 0) || 0;

  const handleExport = async () => {
    try {
      const transactions = await exportJournalEntries();

      if (!transactions || transactions.length === 0) {
        toast.warning('لا توجد معاملات لتصديرها');
        return;
      }

      const headers = ['التاريخ', 'الوصف', 'المدين', 'الدائن', 'الرصيد'];
      const rows = transactions.map(entry => {
        const lines = entry.journal_entry_lines || [];
        const debit = lines.reduce((sum: number, line: { debit_amount?: number }) => 
          sum + (line.debit_amount || 0), 0
        );
        const credit = lines.reduce((sum: number, line: { credit_amount?: number }) => 
          sum + (line.credit_amount || 0), 0
        );
        
        return [
          new Date(entry.entry_date).toLocaleDateString('ar-SA'),
          entry.description || '',
          debit.toFixed(2),
          credit.toFixed(2),
          (debit - credit).toFixed(2),
        ].join(',');
      });

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>كشف الحساب</CardTitle>
            <CardDescription>جميع المدفوعات المستلمة</CardDescription>
          </div>
          {settings?.allow_export_pdf && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 ms-2" />
              تصدير PDF
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : distributions && distributions.length > 0 ? (
            <div className="space-y-4">
              {/* ملخص الحساب */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="text-sm text-muted-foreground">إجمالي المستلم</div>
                  <div className="text-2xl font-bold text-success">
                    {settings?.mask_exact_amounts ? (
                      <MaskedValue value={String(totalDistributed)} type="amount" masked />
                    ) : (
                      formatCurrency(totalDistributed)
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-sm text-muted-foreground">عدد التوزيعات</div>
                  <div className="text-2xl font-bold text-primary">{distributions.length}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted border">
                  <div className="text-sm text-muted-foreground">آخر توزيع</div>
                  <div className="text-lg font-semibold">
                    {distributions[0]?.distribution_date 
                      ? format(new Date(distributions[0].distribution_date), "dd/MM/yyyy", { locale: ar })
                      : "—"}
                  </div>
                </div>
              </div>

              {/* جدول التوزيعات */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">السنة المالية</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">نوع الوريث</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map((dist) => (
                      <TableRow key={dist.id}>
                        <TableCell>
                          {dist.distribution_date && format(new Date(dist.distribution_date), "dd/MM/yyyy", { locale: ar })}
                        </TableCell>
                        <TableCell>{dist.fiscal_years?.name || "—"}</TableCell>
                        <TableCell className="font-semibold text-success">
                          {settings?.mask_exact_amounts ? (
                            <MaskedValue value={String(dist.share_amount || 0)} type="amount" masked />
                          ) : (
                            formatCurrency(dist.share_amount || 0)
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            dist.heir_type === 'ابن' ? 'bg-heir-son/10 text-heir-son' :
                            dist.heir_type === 'بنت' ? 'bg-heir-daughter/10 text-heir-daughter' :
                            dist.heir_type === 'زوجة' ? 'bg-heir-wife/10 text-heir-wife' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {dist.heir_type}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">لا توجد توزيعات مسجلة بعد</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>سجل المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : payments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              لا توجد مدفوعات بعد
            </div>
          ) : isMobile ? (
            <div className="grid gap-4">
              {payments.map((payment) => (
                <MobileStatementCard
                  key={payment.id}
                  payment={payment}
                  masked={settings?.mask_exact_amounts || false}
                />
              ))}
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="rounded-md border">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم المرجع</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">طريقة الدفع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.reference_number || "—"}
                        </TableCell>
                        <TableCell>
                          {payment.payment_date && format(new Date(payment.payment_date), "dd/MM/yyyy", { locale: ar })}
                        </TableCell>
                        <TableCell>{payment.description || "—"}</TableCell>
                        <TableCell className="font-semibold">—</TableCell>
                        <TableCell>{payment.payment_method || "—"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'مدفوع' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {payment.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
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
