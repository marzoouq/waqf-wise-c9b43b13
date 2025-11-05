import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Printer, FileSpreadsheet } from "lucide-react";

const DetailedTrialBalance = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: trialBalance, isLoading } = useQuery({
    queryKey: ["detailed_trial_balance", dateFrom, dateTo],
    queryFn: async () => {
      // Get all active accounts
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("id, code, name_ar, account_type, account_nature")
        .eq("is_active", true)
        .eq("is_header", false)
        .order("code");

      if (accountsError) throw accountsError;

      // Get posted journal entry lines
      let linesQuery = supabase
        .from("journal_entry_lines")
        .select(`
          account_id,
          debit_amount,
          credit_amount,
          journal_entry:journal_entries!inner(
            entry_date,
            status
          )
        `)
        .eq("journal_entry.status", "posted");

      if (dateFrom) {
        linesQuery = linesQuery.gte("journal_entry.entry_date", dateFrom);
      }
      if (dateTo) {
        linesQuery = linesQuery.lte("journal_entry.entry_date", dateTo);
      }

      const { data: lines, error: linesError } = await linesQuery;
      if (linesError) throw linesError;

      // Calculate balances for each account
      const balances = new Map();
      lines?.forEach((line: any) => {
        const accountId = line.account_id;
        if (!balances.has(accountId)) {
          balances.set(accountId, { debit: 0, credit: 0 });
        }
        const current = balances.get(accountId);
        current.debit += Number(line.debit_amount);
        current.credit += Number(line.credit_amount);
      });

      // Build trial balance
      const trialBalanceData = accounts
        .map((account) => {
          const balance = balances.get(account.id) || { debit: 0, credit: 0 };
          const netBalance = balance.debit - balance.credit;
          
          return {
            ...account,
            debit: balance.debit,
            credit: balance.credit,
            debit_balance: netBalance > 0 ? netBalance : 0,
            credit_balance: netBalance < 0 ? Math.abs(netBalance) : 0,
          };
        })
        .filter((account) => account.debit > 0 || account.credit > 0);

      return trialBalanceData;
    },
  });

  const totals = trialBalance?.reduce(
    (acc, account) => ({
      debit: acc.debit + account.debit,
      credit: acc.credit + account.credit,
      debit_balance: acc.debit_balance + account.debit_balance,
      credit_balance: acc.credit_balance + account.credit_balance,
    }),
    { debit: 0, credit: 0, debit_balance: 0, credit_balance: 0 }
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            ميزان المراجعة التفصيلي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      )}

      {trialBalance && (
        <Card id="print-content">
          <CardHeader className="print:border-b">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">ميزان المراجعة التفصيلي</h2>
              {(dateFrom || dateTo) && (
                <div className="text-sm text-muted-foreground">
                  الفترة: {dateFrom || "..."} - {dateTo || "..."}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رمز الحساب</TableHead>
                  <TableHead>اسم الحساب</TableHead>
                  <TableHead>نوع الحساب</TableHead>
                  <TableHead className="text-center">إجمالي المدين</TableHead>
                  <TableHead className="text-center">إجمالي الدائن</TableHead>
                  <TableHead className="text-center">رصيد مدين</TableHead>
                  <TableHead className="text-center">رصيد دائن</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد بيانات للفترة المحددة
                    </TableCell>
                  </TableRow>
                ) : (
                  trialBalance.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono text-sm">{account.code}</TableCell>
                      <TableCell>{account.name_ar}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {account.account_type}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {account.debit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {account.credit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {account.debit_balance > 0 ? account.debit_balance.toFixed(2) : "-"}
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {account.credit_balance > 0 ? account.credit_balance.toFixed(2) : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {totals && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-left font-bold">
                      الإجمالي
                    </TableCell>
                    <TableCell className="text-center font-bold font-mono">
                      {totals.debit.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center font-bold font-mono">
                      {totals.credit.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center font-bold font-mono">
                      {totals.debit_balance.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center font-bold font-mono">
                      {totals.credit_balance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DetailedTrialBalance;
