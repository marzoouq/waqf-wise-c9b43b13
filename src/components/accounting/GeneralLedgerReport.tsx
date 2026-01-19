import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "@/lib/date";
import { FileText, Printer, Book, Download } from "lucide-react";
import { AccountRow } from "@/types/supabase-helpers";
import { EmptyAccountingState } from "./EmptyAccountingState";
import { AccountingErrorState } from "./AccountingErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { useGeneralLedger } from "@/hooks/accounting/useGeneralLedger";

const GeneralLedgerReport = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const {
    accounts,
    accountsError,
    ledgerData,
    isLoading,
    error,
    refetch,
    selectedAccount,
  } = useGeneralLedger({ accountId: selectedAccountId, dateFrom, dateTo });

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!ledgerData || !selectedAccount) return;
    
    const { exportToPDF } = await import("@/lib/exportHelpers");
    
    const headers = ['التاريخ', 'رقم القيد', 'البيان', 'مدين', 'دائن', 'الرصيد'];
    const data = ledgerData.map(line => [
      format(new Date(line.journal_entry.entry_date), "dd/MM/yyyy"),
      line.journal_entry.entry_number,
      line.description || line.journal_entry.description || '',
      Number(line.debit_amount) > 0 ? Number(line.debit_amount).toFixed(2) : '-',
      Number(line.credit_amount) > 0 ? Number(line.credit_amount).toFixed(2) : '-',
      line.balance.toFixed(2),
    ]);

    const title = `دفتر الأستاذ العام - ${selectedAccount.code} - ${selectedAccount.name_ar}`;
    await exportToPDF(title, headers, data, `general-ledger-${selectedAccount.code}-${format(new Date(), "yyyyMMdd")}`);
  };

  const handleExportExcel = async () => {
    if (!ledgerData || !selectedAccount) return;
    
    const { exportToExcel } = await import("@/lib/excel-helper");
    
    const exportData = ledgerData.map(line => ({
      'التاريخ': format(new Date(line.journal_entry.entry_date), "dd/MM/yyyy"),
      'رقم القيد': line.journal_entry.entry_number,
      'البيان': line.description || line.journal_entry.description || '',
      'مدين': Number(line.debit_amount) > 0 ? Number(line.debit_amount).toFixed(2) : '0.00',
      'دائن': Number(line.credit_amount) > 0 ? Number(line.credit_amount).toFixed(2) : '0.00',
      'الرصيد': line.balance.toFixed(2),
    }));

    await exportToExcel(exportData, `general-ledger-${selectedAccount.code}-${format(new Date(), "yyyyMMdd")}`, "دفتر الأستاذ");
  };

  if (accountsError) {
    return <AccountingErrorState error={accountsError as Error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            دفتر الأستاذ العام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>الحساب *</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account: AccountRow) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          {selectedAccountId && ledgerData && ledgerData.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2 mb-4 print:hidden">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handlePrint}>
                <Printer className="h-4 w-4 ms-2" />
                <span className="hidden sm:inline">طباعة</span>
                <span className="sm:hidden">طباعة</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleExportPDF}>
                <FileText className="h-4 w-4 ms-2" />
                <span className="hidden sm:inline">تصدير PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleExportExcel}>
                <Download className="h-4 w-4 ms-2" />
                <span className="hidden sm:inline">تصدير Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && <LoadingState message="جاري تحميل دفتر الأستاذ..." />}

      {error && <AccountingErrorState error={error as Error} onRetry={refetch} />}

      {!selectedAccountId && !isLoading && !error && (
        <EmptyAccountingState
          icon={<FileText className="h-12 w-12" />}
          title="اختر حساباً لعرض دفتر الأستاذ"
          description="قم باختيار حساب من القائمة أعلاه لعرض جميع الحركات والأرصدة"
        />
      )}

      {selectedAccount && ledgerData && ledgerData.length === 0 && (
        <EmptyAccountingState
          icon={<FileText className="h-12 w-12" />}
          title="لا توجد حركات على هذا الحساب"
          description="لا توجد قيود محاسبية مرحلة على هذا الحساب في الفترة المحددة"
        />
      )}

      {selectedAccount && ledgerData && ledgerData.length > 0 && (
        <Card id="print-content" className="print:shadow-none">
          <CardHeader className="print:border-b">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">دفتر الأستاذ العام</h2>
              <div className="text-sm text-muted-foreground">
                <div>الحساب: {selectedAccount.code} - {selectedAccount.name_ar}</div>
                {(dateFrom || dateTo) && (
                  <div>
                    الفترة: {dateFrom ? format(new Date(dateFrom), "dd/MM/yyyy") : "..."} - {dateTo ? format(new Date(dateTo), "dd/MM/yyyy") : "..."}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">التاريخ</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">رقم القيد</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">البيان</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">مدين</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">دائن</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm">الرصيد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerData.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                      {format(new Date(line.journal_entry.entry_date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="font-mono text-xs sm:text-sm hidden lg:table-cell">
                      {line.journal_entry.entry_number}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                      {line.description || line.journal_entry.description}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs sm:text-sm">
                      {Number(line.debit_amount) > 0
                        ? Number(line.debit_amount).toFixed(2)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs sm:text-sm">
                      {Number(line.credit_amount) > 0
                        ? Number(line.credit_amount).toFixed(2)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm font-semibold">
                      {line.balance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeneralLedgerReport;
