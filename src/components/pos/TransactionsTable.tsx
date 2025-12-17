import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { POSTransaction } from '@/hooks/pos/usePOSTransactions';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { TableColumn } from '@/types/table';
import { ReactNode } from 'react';

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

interface TransactionRow {
  id: string;
  transaction_number: string;
  transaction_type: string;
  payer_name: string | null;
  description: string | null;
  payment_method: string;
  amount: number;
  created_at: string;
  [key: string]: unknown;
}

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

  const columns: TableColumn<TransactionRow>[] = [
    {
      key: 'transaction_number',
      label: 'رقم العملية',
      render: (value) => (
        <span className="font-mono text-sm">{String(value)}</span>
      ),
    },
    {
      key: 'transaction_type',
      label: 'النوع',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.transaction_type === 'تحصيل' ? (
            <ArrowDownCircle className="h-4 w-4 text-status-success" />
          ) : (
            <ArrowUpCircle className="h-4 w-4 text-status-error" />
          )}
          <Badge
            variant={row.transaction_type === 'تحصيل' ? 'default' : 'destructive'}
            className={row.transaction_type === 'تحصيل' ? 'bg-status-success' : ''}
          >
            {String(value)}
          </Badge>
        </div>
      ),
    },
    {
      key: 'payer_name',
      label: 'الوصف',
      render: (value, row) => (
        <span className="max-w-[200px] truncate block">
          {row.payer_name || row.description || '-'}
        </span>
      ),
      mobileHidden: true,
    },
    {
      key: 'payment_method',
      label: 'طريقة الدفع',
      render: (value) => (
        <Badge variant="outline">
          {PAYMENT_METHOD_LABELS[String(value)] || String(value)}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'المبلغ',
      render: (value, row) => (
        <span className={`font-bold ${row.transaction_type === 'تحصيل' ? 'text-status-success' : 'text-status-error'}`}>
          {row.transaction_type === 'تحصيل' ? '+' : '-'}
          {Number(value).toLocaleString('ar-SA')} ر.س
        </span>
      ),
      className: 'text-left',
    },
    {
      key: 'created_at',
      label: 'الوقت',
      render: (value) => (
        <span className="text-muted-foreground text-sm">
          {format(new Date(String(value)), 'HH:mm', { locale: ar })}
        </span>
      ),
      mobileHidden: true,
    },
  ];

  const tableData: TransactionRow[] = transactions.map(t => ({
    id: t.id,
    transaction_number: t.transaction_number,
    transaction_type: t.transaction_type,
    payer_name: t.payer_name,
    description: t.description,
    payment_method: t.payment_method,
    amount: t.amount,
    created_at: t.created_at,
  }));

  const mobileCardRender = (row: TransactionRow): ReactNode => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-mono text-sm text-muted-foreground">{row.transaction_number}</span>
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.created_at), 'HH:mm', { locale: ar })}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {row.transaction_type === 'تحصيل' ? (
            <ArrowDownCircle className="h-4 w-4 text-status-success" />
          ) : (
            <ArrowUpCircle className="h-4 w-4 text-status-error" />
          )}
          <Badge
            variant={row.transaction_type === 'تحصيل' ? 'default' : 'destructive'}
            className={row.transaction_type === 'تحصيل' ? 'bg-status-success' : ''}
          >
            {row.transaction_type}
          </Badge>
        </div>
        <Badge variant="outline">
          {PAYMENT_METHOD_LABELS[row.payment_method] || row.payment_method}
        </Badge>
      </div>
      {(row.payer_name || row.description) && (
        <p className="text-sm text-muted-foreground truncate">
          {row.payer_name || row.description}
        </p>
      )}
      <div className="text-left">
        <span className={`font-bold text-lg ${row.transaction_type === 'تحصيل' ? 'text-status-success' : 'text-status-error'}`}>
          {row.transaction_type === 'تحصيل' ? '+' : '-'}
          {row.amount.toLocaleString('ar-SA')} ر.س
        </span>
      </div>
    </div>
  );

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
        <ResponsiveTable<TransactionRow>
          columns={columns}
          data={tableData}
          emptyMessage="لا توجد عمليات في هذه الوردية"
          mobileCardView={true}
          mobileCardRender={mobileCardRender}
        />
      </CardContent>
    </Card>
  );
}
