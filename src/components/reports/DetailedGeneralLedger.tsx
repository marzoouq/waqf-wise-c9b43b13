import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Printer, FileDown, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function DetailedGeneralLedger() {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { data: accounts } = useQuery({
    queryKey: ['accounts_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, code, name_ar')
        .eq('is_active', true)
        .order('code');
      if (error) throw error;
      return data;
    },
  });

  const { data: ledgerEntries, isLoading } = useQuery({
    queryKey: ['general_ledger', selectedAccount, startDate, endDate],
    queryFn: async () => {
      if (!selectedAccount) return [];

      let query = supabase
        .from('journal_entry_lines')
        .select(`
          *,
          journal_entries!inner(
            entry_number,
            entry_date,
            description,
            status
          )
        `)
        .eq('account_id', selectedAccount)
        .eq('journal_entries.status', 'posted')
        .order('journal_entries(entry_date)', { ascending: true });

      if (startDate) {
        query = query.gte('journal_entries.entry_date', startDate);
      }
      if (endDate) {
        query = query.lte('journal_entries.entry_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      // حساب الرصيد الجاري
      let runningBalance = 0;
      return (data || []).map((entry: any) => {
        runningBalance += entry.debit_amount - entry.credit_amount;
        return {
          ...entry,
          running_balance: runningBalance,
        };
      });
    },
    enabled: !!selectedAccount,
  });

  const totalDebit = ledgerEntries?.reduce((sum, entry) => sum + entry.debit_amount, 0) || 0;
  const totalCredit = ledgerEntries?.reduce((sum, entry) => sum + entry.credit_amount, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              دفتر الأستاذ التفصيلي
            </CardTitle>
            <CardDescription>
              عرض جميع الحركات المالية لحساب معين مع الرصيد الجاري
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Button variant="outline">
              <FileDown className="h-4 w-4 ml-2" />
              تصدير Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* الفلاتر */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label>الحساب *</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((account) => (
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
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* النتائج */}
          {!selectedAccount ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>اختر حساباً لعرض دفتر الأستاذ</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              جاري التحميل...
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>رقم القيد</TableHead>
                      <TableHead>البيان</TableHead>
                      <TableHead className="text-right">مدين</TableHead>
                      <TableHead className="text-right">دائن</TableHead>
                      <TableHead className="text-right">الرصيد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          لا توجد حركات في الفترة المحددة
                        </TableCell>
                      </TableRow>
                    ) : (
                      ledgerEntries?.map((entry: any) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {new Date(entry.journal_entries.entry_date).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell className="font-mono">
                            {entry.journal_entries.entry_number}
                          </TableCell>
                          <TableCell>
                            {entry.description || entry.journal_entries.description}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-'}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(entry.running_balance)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {ledgerEntries && ledgerEntries.length > 0 && (
                      <TableRow className="font-bold bg-primary/10">
                        <TableCell colSpan={3}>الإجمالي</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(totalDebit)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(totalCredit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(ledgerEntries[ledgerEntries.length - 1]?.running_balance || 0)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* إحصائيات */}
              {ledgerEntries && ledgerEntries.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">عدد الحركات</div>
                      <div className="text-2xl font-bold">{ledgerEntries.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">إجمالي المدين</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalDebit)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">إجمالي الدائن</div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(totalCredit)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
