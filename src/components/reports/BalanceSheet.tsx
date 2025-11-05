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

export const BalanceSheet = () => {
  const [asOfDate, setAsOfDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: assetsData, isLoading: assetsLoading } = useQuery<AccountData[]>({
    queryKey: ["assets-data", asOfDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          credit_amount,
          debit_amount,
          accounts!inner(id, code, name_ar, account_type),
          journal_entries!inner(entry_date, status)
        `)
        .eq("accounts.account_type", "asset")
        .eq("journal_entries.status", "posted")
        .lte("journal_entries.entry_date", asOfDate);

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

  const { data: liabilitiesData, isLoading: liabilitiesLoading } = useQuery<AccountData[]>({
    queryKey: ["liabilities-data", asOfDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          credit_amount,
          debit_amount,
          accounts!inner(id, code, name_ar, account_type),
          journal_entries!inner(entry_date, status)
        `)
        .eq("accounts.account_type", "liability")
        .eq("journal_entries.status", "posted")
        .lte("journal_entries.entry_date", asOfDate);

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

  const { data: equityData, isLoading: equityLoading } = useQuery<AccountData[]>({
    queryKey: ["equity-data", asOfDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          credit_amount,
          debit_amount,
          accounts!inner(id, code, name_ar, account_type),
          journal_entries!inner(entry_date, status)
        `)
        .eq("accounts.account_type", "equity")
        .eq("journal_entries.status", "posted")
        .lte("journal_entries.entry_date", asOfDate);

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

  const totalAssets = (assetsData || []).reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = (liabilitiesData || []).reduce((sum, item) => sum + item.amount, 0);
  const totalEquity = (equityData || []).reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilitiesEquity = totalLiabilities + totalEquity;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const sections = [
      {
        title: "الأصول",
        items: (assetsData || []).map((item) => ({
          label: `${item.code} - ${item.name}`,
          amount: item.amount,
        })),
      },
      {
        title: "الخصوم",
        items: (liabilitiesData || []).map((item) => ({
          label: `${item.code} - ${item.name}`,
          amount: item.amount,
        })),
      },
      {
        title: "حقوق الملكية",
        items: (equityData || []).map((item) => ({
          label: `${item.code} - ${item.name}`,
          amount: item.amount,
        })),
      },
    ];

    const totals = [
      { label: "إجمالي الأصول", amount: totalAssets },
      { label: "إجمالي الخصوم وحقوق الملكية", amount: totalLiabilitiesEquity },
    ];

    exportFinancialStatementToPDF(
      "الميزانية العمومية",
      sections,
      totals,
      `balance-sheet-${asOfDate}`
    );
  };

  const handleExportExcel = () => {
    const excelData = [
      { القسم: "الأصول", الحساب: "", المبلغ: "" },
      ...(assetsData || []).map((item) => ({
        القسم: "",
        الحساب: `${item.code} - ${item.name}`,
        المبلغ: item.amount.toFixed(2),
      })),
      { القسم: "", الحساب: "إجمالي الأصول", المبلغ: totalAssets.toFixed(2) },
      { القسم: "", الحساب: "", المبلغ: "" },
      { القسم: "الخصوم", الحساب: "", المبلغ: "" },
      ...(liabilitiesData || []).map((item) => ({
        القسم: "",
        الحساب: `${item.code} - ${item.name}`,
        المبلغ: item.amount.toFixed(2),
      })),
      { القسم: "", الحساب: "إجمالي الخصوم", المبلغ: totalLiabilities.toFixed(2) },
      { القسم: "", الحساب: "", المبلغ: "" },
      { القسم: "حقوق الملكية", الحساب: "", المبلغ: "" },
      ...(equityData || []).map((item) => ({
        القسم: "",
        الحساب: `${item.code} - ${item.name}`,
        المبلغ: item.amount.toFixed(2),
      })),
      { القسم: "", الحساب: "إجمالي حقوق الملكية", المبلغ: totalEquity.toFixed(2) },
      { القسم: "", الحساب: "", المبلغ: "" },
      {
        القسم: "",
        الحساب: "إجمالي الخصوم وحقوق الملكية",
        المبلغ: totalLiabilitiesEquity.toFixed(2),
      },
    ];

    exportToExcel(excelData, `balance-sheet-${asOfDate}`, "الميزانية العمومية");
  };

  if (assetsLoading || liabilitiesLoading || equityLoading) {
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
            <span>التاريخ</span>
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
          <div className="max-w-xs print:hidden">
            <Label>كما في تاريخ</Label>
            <Input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Section */}
        <Card id="print-content" className="print:shadow-none">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-primary">الأصول</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {(assetsData || []).map((item) => (
              <div
                key={item.code}
                className="flex justify-between items-center py-2 px-3 rounded hover:bg-muted/50"
              >
                <span className="text-sm">
                  {item.code} - {item.name}
                </span>
                <span className="font-mono font-semibold">{item.amount.toFixed(2)}</span>
              </div>
            ))}
            <Separator className="my-3" />
            <div className="flex justify-between items-center font-bold py-3 px-3 bg-primary/10 rounded">
              <span>إجمالي الأصول</span>
              <span className="font-mono text-lg">{totalAssets.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities & Equity Section */}
        <Card className="print:shadow-none">
          <CardHeader className="bg-secondary/50">
            <CardTitle>الخصوم وحقوق الملكية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Liabilities */}
            <div>
              <h3 className="font-semibold mb-3 text-destructive">الخصوم</h3>
              <div className="space-y-2">
                {(liabilitiesData || []).map((item) => (
                  <div
                    key={item.code}
                    className="flex justify-between items-center py-2 px-3 rounded hover:bg-muted/50"
                  >
                    <span className="text-sm">
                      {item.code} - {item.name}
                    </span>
                    <span className="font-mono font-semibold">{item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center font-semibold py-2 px-3 bg-destructive/10 rounded mt-2">
                <span className="text-sm">إجمالي الخصوم</span>
                <span className="font-mono">{totalLiabilities.toFixed(2)}</span>
              </div>
            </div>

            {/* Equity */}
            <div>
              <h3 className="font-semibold mb-3 text-success">حقوق الملكية</h3>
              <div className="space-y-2">
                {(equityData || []).map((item) => (
                  <div
                    key={item.code}
                    className="flex justify-between items-center py-2 px-3 rounded hover:bg-muted/50"
                  >
                    <span className="text-sm">
                      {item.code} - {item.name}
                    </span>
                    <span className="font-mono font-semibold">{item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center font-semibold py-2 px-3 bg-success/10 rounded mt-2">
                <span className="text-sm">إجمالي حقوق الملكية</span>
                <span className="font-mono">{totalEquity.toFixed(2)}</span>
              </div>
            </div>

            <Separator />
            <div className="flex justify-between items-center font-bold py-3 px-3 bg-secondary rounded text-lg">
              <span>المجموع</span>
              <span className="font-mono">{totalLiabilitiesEquity.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
