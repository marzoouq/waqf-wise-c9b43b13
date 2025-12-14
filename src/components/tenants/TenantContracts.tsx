import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Building, Calendar, FileText, CreditCard } from 'lucide-react';
import { useTenantContracts } from '@/hooks/tenants/useTenantContracts';
import { ErrorState } from '@/components/shared/ErrorState';

interface TenantContractsProps {
  tenantId: string;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'نشط': { label: 'نشط', variant: 'default' },
  'active': { label: 'نشط', variant: 'default' },
  'منتهي': { label: 'منتهي', variant: 'secondary' },
  'ملغي': { label: 'ملغي', variant: 'destructive' },
  'مسودة': { label: 'مسودة', variant: 'outline' },
};

export function TenantContracts({ tenantId }: TenantContractsProps) {
  const { contracts, isLoading, error, refetch } = useTenantContracts(tenantId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل العقود" message={(error as Error).message} onRetry={refetch} />;
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لا توجد عقود مرتبطة بهذا المستأجر</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <Card key={contract.id}>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                {contract.properties?.name}
              </CardTitle>
              <Badge variant={statusLabels[contract.status]?.variant || 'secondary'}>
                {statusLabels[contract.status]?.label || contract.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">رقم العقد</p>
                <p className="font-mono font-medium">{contract.contract_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">الإيجار الشهري</p>
                <p className="font-medium">{formatCurrency(contract.monthly_rent)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">تاريخ البداية</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(contract.start_date)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">تاريخ النهاية</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(contract.end_date)}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>نوع الدفع: {contract.payment_frequency || 'شهري'}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
