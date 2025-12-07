import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { POSTransaction } from '@/hooks/pos/usePOSTransactions';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TransactionsTableProps {
  transactions: POSTransaction[];
  isLoading?: boolean;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  'نقدي': 'نقدي',
  'شبكة': 'شبكة',
  'تحويل': 'تحويل',
  'شيك': 'شيك',
};

export function TransactionsTable({ transactions, isLoading }: TransactionsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          عمليات الوردية
          <Badge variant="secondary">{transactions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد عمليات في هذه الوردية
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم العملية</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead className="text-left">المبلغ</TableHead>
                  <TableHead>الوقت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {transaction.transaction_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.transaction_type === 'تحصيل' ? (
                          <ArrowDownCircle className="h-4 w-4 text-status-success" />
                        ) : (
                          <ArrowUpCircle className="h-4 w-4 text-status-error" />
                        )}
                        <Badge
                          variant={transaction.transaction_type === 'تحصيل' ? 'default' : 'destructive'}
                          className={transaction.transaction_type === 'تحصيل' ? 'bg-status-success' : ''}
                        >
                          {transaction.transaction_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.payer_name || transaction.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PAYMENT_METHOD_LABELS[transaction.payment_method] || transaction.payment_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      <span className={`font-bold ${transaction.transaction_type === 'تحصيل' ? 'text-status-success' : 'text-status-error'}`}>
                        {transaction.transaction_type === 'تحصيل' ? '+' : '-'}
                        {transaction.amount.toLocaleString('ar-SA')} ر.س
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(transaction.created_at), 'HH:mm', { locale: ar })}
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
