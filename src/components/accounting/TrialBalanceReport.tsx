import { useFinancialReports } from "@/hooks/useFinancialReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">ميزان المراجعة</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              التاريخ: {format(new Date(), "dd MMMM yyyy", { locale: ar })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
            <Button variant="outline" size="sm">
              <Download className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">رمز الحساب</TableHead>
              <TableHead className="text-right">اسم الحساب</TableHead>
              <TableHead className="text-left">مدين</TableHead>
              <TableHead className="text-left">دائن</TableHead>
              <TableHead className="text-left">الرصيد</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trialBalance.map((account) => (
              <TableRow key={account.account_id}>
                <TableCell className="font-mono text-sm">{account.code}</TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell className="text-left font-mono">
                  {account.debit > 0 ? formatNumber(account.debit) : "-"}
                </TableCell>
                <TableCell className="text-left font-mono">
                  {account.credit > 0 ? formatNumber(account.credit) : "-"}
                </TableCell>
                <TableCell className="text-left font-mono font-semibold">
                  <span className={account.balance > 0 ? "text-green-600" : account.balance < 0 ? "text-red-600" : ""}>
                    {formatNumber(account.balance)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Total Row */}
            <TableRow className="bg-primary/10 font-bold">
              <TableCell colSpan={2} className="text-right">الإجمالي</TableCell>
              <TableCell className="text-left font-mono">{formatNumber(totalDebit)}</TableCell>
              <TableCell className="text-left font-mono">{formatNumber(totalCredit)}</TableCell>
              <TableCell className="text-left font-mono">
                {difference < 0.01 ? (
                  <Badge variant="default" className="gap-1">
                    متوازن
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    فرق: {formatNumber(difference)}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}