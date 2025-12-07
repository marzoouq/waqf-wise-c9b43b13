import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantLedger } from '@/hooks/property/useTenantLedger';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, CreditCard, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface TenantLedgerProps {
  tenantId: string;
  tenantName?: string;
}

const transactionTypeLabels: Record<string, string> = {
  invoice: 'فاتورة',
  payment: 'دفعة',
  adjustment: 'تسوية',
  opening_balance: 'رصيد افتتاحي',
};

const transactionTypeIcons: Record<string, React.ReactNode> = {
  invoice: <FileText className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  adjustment: <ArrowUpCircle className="h-4 w-4" />,
  opening_balance: <ArrowDownCircle className="h-4 w-4" />,
};

export function TenantLedger({ tenantId, tenantName }: TenantLedgerProps) {
  const { entries, isLoading, balance } = useTenantLedger(tenantId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          كشف حساب {tenantName && `- ${tenantName}`}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">الرصيد الحالي:</span>
          <Badge
            variant={balance > 0 ? 'destructive' : balance < 0 ? 'default' : 'secondary'}
            className="text-base"
          >
            {formatCurrency(Math.abs(balance))}
            {balance > 0 ? ' مدين' : balance < 0 ? ' دائن' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد حركات في الحساب
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>المرجع</TableHead>
                  <TableHead>البيان</TableHead>
                  <TableHead className="text-left">مدين</TableHead>
                  <TableHead className="text-left">دائن</TableHead>
                  <TableHead className="text-left">الرصيد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(entry.transaction_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transactionTypeIcons[entry.transaction_type]}
                        <span>{transactionTypeLabels[entry.transaction_type]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entry.reference_number || '-'}
                    </TableCell>
                    <TableCell>{entry.description || '-'}</TableCell>
                    <TableCell className="text-left font-medium text-destructive">
                      {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-'}
                    </TableCell>
                    <TableCell className="text-left font-medium text-green-600">
                      {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-'}
                    </TableCell>
                    <TableCell className="text-left font-bold">
                      {formatCurrency(entry.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
