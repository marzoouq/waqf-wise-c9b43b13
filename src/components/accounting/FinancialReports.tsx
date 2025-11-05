import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

const FinancialReports = () => {
  const { data: trialBalance } = useQuery({
    queryKey: ["trial_balance"],
    queryFn: async () => {
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("is_active", true)
        .order("code");

      if (accountsError) throw accountsError;

      const { data: lines, error: linesError } = await supabase
        .from("journal_entry_lines")
        .select(`
          *,
          journal_entry:journal_entries!inner(status)
        `)
        .eq("journal_entry.status", "posted");

      if (linesError) throw linesError;

      // حساب الأرصدة
      const balances = accounts.map((account) => {
        const accountLines = lines?.filter((line: any) => line.account_id === account.id) || [];
        const totalDebit = accountLines.reduce((sum: number, line: any) => sum + Number(line.debit_amount), 0);
        const totalCredit = accountLines.reduce((sum: number, line: any) => sum + Number(line.credit_amount), 0);
        const balance = totalDebit - totalCredit;

        return {
          ...account,
          debit: totalDebit,
          credit: totalCredit,
          balance: balance,
        };
      });

      return balances;
    },
  });

  const totalDebit = trialBalance?.reduce((sum, acc) => sum + acc.debit, 0) || 0;
  const totalCredit = trialBalance?.reduce((sum, acc) => sum + acc.credit, 0) || 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold">التقارير المالية</h2>

      <Tabs defaultValue="trial-balance" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="trial-balance" className="text-xs sm:text-sm py-2">ميزان المراجعة</TabsTrigger>
          <TabsTrigger value="income-statement" className="text-xs sm:text-sm py-2">قائمة الدخل</TabsTrigger>
          <TabsTrigger value="balance-sheet" className="text-xs sm:text-sm py-2">الميزانية العمومية</TabsTrigger>
        </TabsList>

        <TabsContent value="trial-balance" className="mt-4">
          <Card className="p-3 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4">ميزان المراجعة</h3>
            {trialBalance && trialBalance.filter((acc) => acc.debit > 0 || acc.credit > 0).length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">رمز الحساب</TableHead>
                    <TableHead className="text-xs sm:text-sm">اسم الحساب</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">مدين</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm">دائن</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm hidden sm:table-cell">الرصيد</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {trialBalance
                  ?.filter((acc) => acc.debit > 0 || acc.credit > 0)
                  .map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono text-xs sm:text-sm">{account.code}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{account.name_ar}</TableCell>
                      <TableCell className="text-center font-mono text-xs sm:text-sm">
                        {account.debit.toLocaleString("ar-SA", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs sm:text-sm">
                        {account.credit.toLocaleString("ar-SA", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs sm:text-sm hidden sm:table-cell">
                        {account.balance.toLocaleString("ar-SA", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="text-left font-bold text-xs sm:text-sm">
                    الإجمالي
                  </TableCell>
                  <TableCell className="text-center font-bold font-mono text-xs sm:text-sm">
                    {totalDebit.toLocaleString("ar-SA", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                  <TableCell className="text-center font-bold font-mono text-xs sm:text-sm">
                    {totalCredit.toLocaleString("ar-SA", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                  <TableCell className="text-center font-bold font-mono text-xs sm:text-sm hidden sm:table-cell">
                    {(totalDebit - totalCredit).toLocaleString("ar-SA", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-12">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <h4 className="text-lg font-medium mb-2">لا توجد بيانات</h4>
                  <CardDescription>
                    لم يتم ترحيل أي قيود محاسبية بعد. قم بإضافة قيود وترحيلها لتظهر في ميزان المراجعة.
                  </CardDescription>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="income-statement" className="mt-4">
          <Card className="p-3 sm:p-6">
            <div className="flex flex-col items-center gap-4 py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">قائمة الدخل</h3>
                <CardDescription>
                  قريباً - سيتم عرض الإيرادات والمصروفات وصافي الربح
                </CardDescription>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="mt-4">
          <Card className="p-3 sm:p-6">
            <div className="flex flex-col items-center gap-4 py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">الميزانية العمومية</h3>
                <CardDescription>
                  قريباً - سيتم عرض الأصول والخصوم وحقوق الملكية
                </CardDescription>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;
