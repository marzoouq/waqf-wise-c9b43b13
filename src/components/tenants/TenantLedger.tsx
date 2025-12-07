import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantLedger } from '@/hooks/property/useTenantLedger';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, CreditCard, ArrowUpCircle, ArrowDownCircle, Receipt } from 'lucide-react';

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
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
          كشف حساب {tenantName && `- ${tenantName}`}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">الرصيد:</span>
          <Badge
            variant={balance > 0 ? 'destructive' : balance < 0 ? 'default' : 'secondary'}
            className="text-sm sm:text-base"
          >
            {formatCurrency(Math.abs(balance))}
            {balance > 0 ? ' مدين' : balance < 0 ? ' دائن' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            لا توجد حركات في الحساب
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors"
              >
                {/* Mobile & Desktop View */}
                <div className="flex flex-col gap-2">
                  {/* Row 1: Type, Date, Balance */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${
                        entry.credit_amount > 0 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30' 
                          : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                      }`}>
                        {transactionTypeIcons[entry.transaction_type]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transactionTypeLabels[entry.transaction_type] || entry.transaction_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(entry.transaction_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      {entry.credit_amount > 0 && (
                        <p className="font-bold text-green-600 text-sm sm:text-base">
                          +{formatCurrency(entry.credit_amount)}
                        </p>
                      )}
                      {entry.debit_amount > 0 && (
                        <p className="font-bold text-destructive text-sm sm:text-base">
                          -{formatCurrency(entry.debit_amount)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Description */}
                  {entry.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground pr-8">
                      {entry.description}
                    </p>
                  )}

                  {/* Row 3: Balance */}
                  <div className="flex items-center justify-between pt-2 border-t text-xs sm:text-sm">
                    <span className="text-muted-foreground">الرصيد بعد العملية</span>
                    <span className={`font-bold ${
                      entry.balance > 0 
                        ? 'text-destructive' 
                        : entry.balance < 0 
                          ? 'text-green-600' 
                          : ''
                    }`}>
                      {formatCurrency(Math.abs(entry.balance))}
                      {entry.balance > 0 ? ' مدين' : entry.balance < 0 ? ' دائن' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
