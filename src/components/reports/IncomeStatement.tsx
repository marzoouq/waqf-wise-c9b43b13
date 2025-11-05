import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Download, FileText, Printer } from "lucide-react";
import { exportFinancialStatementToPDF, exportToExcel } from "@/lib/exportHelpers";

interface AccountData {
  code: string;
  name: string;
  amount: number;
}

export const IncomeStatement = () => {
  const [dateFrom, setDateFrom] = useState(
    format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd")
  );
  const [dateTo, setDateTo] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: revenueData, isLoading: revenueLoading } = useQuery<AccountData[]>({
    queryKey: ["revenue-data", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          credit_amount,
          debit_amount,
          accounts!inner(id, code, name_ar, account_type),
          journal_entries!inner(entry_date, status)
        `)
        .eq("accounts.account_type", "revenue")
        .eq("journal_entries.status", "posted")
        .gte("journal_entries.entry_date", dateFrom)
        .lte("journal_entries.entry_date", dateTo);

      if (error) throw error;

      const grouped = data.reduce((acc: Record<string, AccountData>, line: any) => {
        const accountId = line.accounts.id;
        if (!acc[accountId]) {
          acc[accountId] = {
            code: line.accounts.code,
            name: line.accounts.name_ar,
            amount: 0,
          };
        }
        acc[accountId].amount += Number(line.credit_amount) - Number(line.debit_amount);
        return acc;
      }, {});

      return Object.values(grouped).sort((a, b) => a.code.localeCompare(b.code));
    },
  });

  const { data: expenseData, isLoading: expenseLoading } = useQuery<AccountData[]>({
    queryKey: ["expense-data", dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          credit_amount,
          debit_amount,
          accounts!inner(id, code, name_ar, account_type),
          journal_entries!inner(entry_date, status)
        `)
        .eq("accounts.account_type", "expense")
        .eq("journal_entries.status", "posted")
        .gte("journal_entries.entry_date", dateFrom)
        .lte("journal_entries.entry_date", dateTo);

      if (error) throw error;

      const grouped = data.reduce((acc: Record<string, AccountData>, line: any) => {
        const accountId = line.accounts.id;
        if (!acc[accountId]) {
          acc[accountId] = {
            code: line.accounts.code,
            name: line.accounts.name_ar,
            amount: 0,
          };
        }
        acc[accountId].amount += Number(line.debit_amount) - Number(line.credit_amount);
        return acc;
      }, {});

      return Object.values(grouped).sort((a, b) => a.code.localeCompare(b.code));
    },
  });

  const totalRevenue = (revenueData || []).reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = (expenseData || []).reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalRevenue - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const sections = [
      {
        title: "الإيرادات",
        items: (revenueData || []).map((item) => ({
          label: `${item.code} - ${item.name}`,
          amount: item.amount,
        })),
      },
      {
        title: "المصروفات",
        items: (expenseData || []).map((item) => ({
          label: `${item.code} - ${item.name}`,
          amount: item.amount,
        })),
      },
    ];

    const totals = [
      { label: "إجمالي الإيرادات", amount: totalRevenue },
      { label: "إجمالي المصروفات", amount: totalExpense },
      { label: netIncome >= 0 ? "صافي الربح" : "صافي الخسارة", amount: Math.abs(netIncome) },
    ];

    exportFinancialStatementToPDF(
      "قائمة الدخل",
      sections,
      totals,
      `income-statement-${dateFrom}-${dateTo}`
    );
  };

  const handleExportExcel = () => {
    const excelData = [
      { نوع: "الإيرادات", الحساب: "", المبلغ: "" },
      ...(revenueData || []).map((item) => ({
        نوع: "",
        الحساب: `${item.code} - ${item.name}`,
        المبلغ: item.amount.toFixed(2),
      })),
      { نوع: "", الحساب: "إجمالي الإيرادات", المبلغ: totalRevenue.toFixed(2) },
      { نوع: "", الحساب: "", المبلغ: "" },
      { نوع: "المصروفات", الحساب: "", المبلغ: "" },
      ...(expenseData || []).map((item) => ({
        نوع: "",
        الحساب: `${item.code} - ${item.name}`,
        المبلغ: item.amount.toFixed(2),
      })),
      { نوع: "", الحساب: "إجمالي المصروفات", المبلغ: totalExpense.toFixed(2) },
      { نوع: "", الحساب: "", المبلغ: "" },
      {
        نوع: "",
        الحساب: netIncome >= 0 ? "صافي الربح" : "صافي الخسارة",
        المبلغ: Math.abs(netIncome).toFixed(2),
      },
    ];

    exportToExcel(excelData, `income-statement-${dateFrom}-${dateTo}`, "قائمة الدخل");
  };

  if (revenueLoading || expenseLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span>الفترة المالية</span>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handlePrint} variant="outline" size="sm" className="print:hidden">
                <Printer className="h-4 w-4 ml-2" />
                طباعة
              </Button>
              <Button onClick={handleExportPDF} variant="outline" size="sm" className="print:hidden">
                <FileText className="h-4 w-4 ml-2" />
                PDF
              </Button>
              <Button onClick={handleExportExcel} variant="outline" size="sm" className="print:hidden">
                <Download className="h-4 w-4 ml-2" />
                Excel
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
            <div>
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="print-content" className="print:shadow-none">
        <CardHeader className="text-center print:pb-4">
          <div className="hidden print:block mb-4">
            <h1 className="text-2xl font-bold">قائمة الدخل</h1>
            <p className="text-sm text-muted-foreground mt-2">
              من {format(new Date(dateFrom), "dd MMMM yyyy", { locale: ar })} إلى{" "}
              {format(new Date(dateTo), "dd MMMM yyyy", { locale: ar })}
            </p>
          </div>
          <CardTitle className="print:hidden">قائمة الدخل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Revenue Section */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-primary">الإيرادات</h3>
            <div className="space-y-2">
              {(revenueData || []).map((item) => (
                <div key={item.code} className="flex justify-between items-center py-2 px-3 rounded hover:bg-muted/50">
                  <span className="text-sm">
                    {item.code} - {item.name}
                  </span>
                  <span className="font-mono font-semibold">{item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center font-bold py-2 px-3 bg-primary/10 rounded">
              <span>إجمالي الإيرادات</span>
              <span className="font-mono text-lg">{totalRevenue.toFixed(2)}</span>
            </div>
          </div>

          {/* Expense Section */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-destructive">المصروفات</h3>
            <div className="space-y-2">
              {(expenseData || []).map((item) => (
                <div key={item.code} className="flex justify-between items-center py-2 px-3 rounded hover:bg-muted/50">
                  <span className="text-sm">
                    {item.code} - {item.name}
                  </span>
                  <span className="font-mono font-semibold">{item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center font-bold py-2 px-3 bg-destructive/10 rounded">
              <span>إجمالي المصروفات</span>
              <span className="font-mono text-lg">{totalExpense.toFixed(2)}</span>
            </div>
          </div>

          {/* Net Income */}
          <div className="pt-4 border-t-2 border-primary">
            <div
              className={`flex justify-between items-center font-bold text-xl py-3 px-4 rounded ${
                netIncome >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
              }`}
            >
              <span>{netIncome >= 0 ? "صافي الربح" : "صافي الخسارة"}</span>
              <span className="font-mono">{Math.abs(netIncome).toFixed(2)} ر.س</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
