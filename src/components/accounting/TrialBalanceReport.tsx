import { useFinancialReports } from "@/hooks/useFinancialReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Printer, Scale, FileText } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { ScrollableTableWrapper } from "@/components/shared/ScrollableTableWrapper";
import { MobileScrollHint } from "@/components/shared/MobileScrollHint";
import { TrialBalanceRow } from "@/types/supabase-helpers";
import { EmptyAccountingState } from "./EmptyAccountingState";
import { LoadingState } from "@/components/shared/LoadingState";

export function TrialBalanceReport() {
  const { trialBalance, isLoading } = useFinancialReports();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(num));
  };

  const totalDebit = trialBalance.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredit = trialBalance.reduce((sum, acc) => sum + acc.credit, 0);
  const difference = Math.abs(totalDebit - totalCredit);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    const { exportToExcel } = await import("@/lib/excel-helper");
    
    const exportData = trialBalance.map(acc => ({
      'رمز الحساب': acc.code,
      'اسم الحساب': acc.name,
      'مدين': acc.debit > 0 ? acc.debit.toFixed(2) : '0.00',
      'دائن': acc.credit > 0 ? acc.credit.toFixed(2) : '0.00',
      'الرصيد': acc.balance.toFixed(2),
    }));

    // Add total row
    exportData.push({
      'رمز الحساب': '',
      'اسم الحساب': 'الإجمالي',
      'مدين': totalDebit.toFixed(2),
      'دائن': totalCredit.toFixed(2),
      'الرصيد': difference < 0.01 ? 'متوازن' : `فرق: ${difference.toFixed(2)}`,
    });

    await exportToExcel(exportData, `trial-balance-${format(new Date(), "yyyyMMdd")}`, "ميزان المراجعة");
  };

  const handleExportPDF = async () => {
    const { exportToPDF } = await import("@/lib/exportHelpers");
    
    const headers = ['رمز الحساب', 'اسم الحساب', 'مدين', 'دائن', 'الرصيد'];
    const data = trialBalance.map(acc => [
      acc.code,
      acc.name,
      acc.debit > 0 ? formatNumber(acc.debit) : '-',
      acc.credit > 0 ? formatNumber(acc.credit) : '-',
      formatNumber(acc.balance),
    ]);
    
    // Add total row
    data.push([
      '',
      'الإجمالي',
      formatNumber(totalDebit),
      formatNumber(totalCredit),
      difference < 0.01 ? 'متوازن' : `فرق: ${formatNumber(difference)}`,
    ]);

    await exportToPDF(
      `ميزان المراجعة - ${format(new Date(), "dd/MM/yyyy")}`,
      headers,
      data,
      `trial-balance-${format(new Date(), "yyyyMMdd")}`
    );
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل ميزان المراجعة..." />;
  }

  if (trialBalance.length === 0) {
    return (
      <EmptyAccountingState
        icon={<Scale className="h-12 w-12" />}
        title="لا توجد بيانات لميزان المراجعة"
        description="تأكد من وجود قيود محاسبية مرحلة لإنشاء ميزان المراجعة"
      />
    );
  }

  return (
    <Card className="print:shadow-none">
      <CardHeader className="print:border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">ميزان المراجعة</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              التاريخ: {format(new Date(), "dd MMMM yyyy", { locale: ar })}
            </p>
          </div>
          <div className="flex gap-2 print:hidden flex-wrap">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="ml-2 h-4 w-4" />
              تصدير PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollableTableWrapper>
          <MobileScrollHint />
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">رمز الحساب</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">اسم الحساب</TableHead>
                <TableHead className="text-left text-xs sm:text-sm whitespace-nowrap">مدين</TableHead>
                <TableHead className="text-left text-xs sm:text-sm whitespace-nowrap">دائن</TableHead>
                <TableHead className="text-left text-xs sm:text-sm whitespace-nowrap">الرصيد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trialBalance.map((account: TrialBalanceRow) => (
                <TableRow key={account.account_id}>
                  <TableCell className="font-mono text-xs sm:text-sm">{account.code}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{account.name}</TableCell>
                  <TableCell className="text-left font-mono text-xs sm:text-sm whitespace-nowrap">
                    {account.debit > 0 ? formatNumber(account.debit) : "-"}
                  </TableCell>
                  <TableCell className="text-left font-mono text-xs sm:text-sm whitespace-nowrap">
                    {account.credit > 0 ? formatNumber(account.credit) : "-"}
                  </TableCell>
                  <TableCell className="text-left font-mono font-semibold text-xs sm:text-sm whitespace-nowrap">
                    <span className={account.balance > 0 ? "text-success" : account.balance < 0 ? "text-destructive" : ""}>
                      {formatNumber(account.balance)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Total Row */}
              <TableRow className="bg-primary/10 font-bold">
                <TableCell colSpan={2} className="text-right text-xs sm:text-sm">الإجمالي</TableCell>
                <TableCell className="text-left font-mono text-xs sm:text-sm whitespace-nowrap">{formatNumber(totalDebit)}</TableCell>
                <TableCell className="text-left font-mono text-xs sm:text-sm whitespace-nowrap">{formatNumber(totalCredit)}</TableCell>
                <TableCell className="text-left font-mono text-xs sm:text-sm">
                  {difference < 0.01 ? (
                    <Badge variant="default" className="gap-1 text-xs">
                      متوازن
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1 text-xs">
                      فرق: {formatNumber(difference)}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollableTableWrapper>
      </CardContent>
    </Card>
  );
}
