import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { format } from "date-fns";
import { FileText, Printer, Book } from "lucide-react";
import { AccountRow, GeneralLedgerEntry } from "@/types/supabase-helpers";
import { EmptyAccountingState } from "./EmptyAccountingState";
import { AccountingErrorState } from "./AccountingErrorState";
import { LoadingState } from "@/components/shared/LoadingState";

const GeneralLedgerReport = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: accounts, error: accountsError } = useQuery({
    queryKey: ["accounts_for_ledger"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, code, name_ar")
        .eq("is_active", true)
        .eq("is_header", false)
        .order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: ledgerData, isLoading, error, refetch } = useQuery({
    queryKey: ["general_ledger", selectedAccountId || undefined, dateFrom || undefined, dateTo || undefined],
    queryFn: async () => {
      if (!selectedAccountId) return null;

      let query = supabase
        .from("journal_entry_lines")
        .select(`
          *,
          journal_entry:journal_entries!inner(
            entry_number,
            entry_date,
            description,
            status
          )
        `)
        .eq("account_id", selectedAccountId)
        .eq("journal_entry.status", "posted")
        .order("journal_entry(entry_date)", { ascending: true });

      if (dateFrom) {
        query = query.gte("journal_entry.entry_date", dateFrom);
      }
      if (dateTo) {
        query = query.lte("journal_entry.entry_date", dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      let balance = 0;
      
      const processedData: GeneralLedgerEntry[] = data.map((line, index: number) => {
        const debit = Number(line.debit_amount);
        const credit = Number(line.credit_amount);
        balance += debit - credit;
        return {
          id: line.id || `line-${index}`,
          entry_date: line.journal_entry.entry_date,
          entry_number: line.journal_entry.entry_number,
          description: line.description || line.journal_entry.description,
          debit_amount: debit,
          credit_amount: credit,
          balance,
          journal_entry: {
            id: line.journal_entry_id,
            entry_number: line.journal_entry.entry_number,
            entry_date: line.journal_entry.entry_date,
            description: line.journal_entry.description
          }
        };
      });

      return processedData;
    },
    enabled: !!selectedAccountId,
  });

  const selectedAccount = accounts?.find((acc: AccountRow) => acc.id === selectedAccountId);

  const handlePrint = () => {
    window.print();
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

          {selectedAccountId && (
            <div className="flex justify-end mb-4 print:hidden">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 ml-2" />
                طباعة
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
