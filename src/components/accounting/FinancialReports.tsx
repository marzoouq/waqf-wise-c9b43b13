import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <h2 className="text-2xl font-bold">التقارير المالية</h2>

      <Tabs defaultValue="trial-balance" className="w-full">
        <TabsList>
          <TabsTrigger value="trial-balance">ميزان المراجعة</TabsTrigger>
          <TabsTrigger value="income-statement">قائمة الدخل</TabsTrigger>
          <TabsTrigger value="balance-sheet">الميزانية العمومية</TabsTrigger>
        </TabsList>

        <TabsContent value="trial-balance">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">ميزان المراجعة</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رمز الحساب</TableHead>
                  <TableHead>اسم الحساب</TableHead>
                  <TableHead className="text-center">مدين</TableHead>
                  <TableHead className="text-center">دائن</TableHead>
                  <TableHead className="text-center">الرصيد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalance
                  ?.filter((acc) => acc.debit > 0 || acc.credit > 0)
                  .map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.code}</TableCell>
                      <TableCell>{account.name_ar}</TableCell>
                      <TableCell className="text-center font-mono">
                        {account.debit.toLocaleString("ar-SA", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {account.credit.toLocaleString("ar-SA", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {account.balance.toLocaleString("ar-SA", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="font-bold">
                    الإجمالي
                  </TableCell>
                  <TableCell className="text-center font-bold font-mono">
                    {totalDebit.toLocaleString("ar-SA", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-center font-bold font-mono">
                    {totalCredit.toLocaleString("ar-SA", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-center font-bold font-mono">
                    {(totalDebit - totalCredit).toLocaleString("ar-SA", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="income-statement">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">قائمة الدخل</h3>
            <div className="text-center text-muted-foreground py-8">
              قريباً - سيتم عرض الإيرادات والمصروفات وصافي الربح
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">الميزانية العمومية</h3>
            <div className="text-center text-muted-foreground py-8">
              قريباً - سيتم عرض الأصول والخصوم وحقوق الملكية
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;
