import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Building, Calendar, FileText, CreditCard, AlertTriangle, Receipt } from 'lucide-react';
import { useTenantContracts } from '@/hooks/tenants/useTenantContracts';
import { ErrorState } from '@/components/shared/ErrorState';
import { EarlyTerminationDialog } from '@/components/contracts/EarlyTerminationDialog';
import { ContractReceipts } from '@/components/contracts/ContractReceipts';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface TenantContractsProps {
  tenantId: string;
}

interface ContractData {
  id: string;
  contract_number: string;
  monthly_rent: number;
  start_date: string;
  end_date: string;
  status: string;
  payment_frequency: string;
  security_deposit?: number;
  tenant_name: string;
  notes?: string;
  properties?: {
    name: string;
    type?: string;
    location?: string;
  } | null;
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
  const [terminationContract, setTerminationContract] = useState<ContractData | null>(null);
  const [expandedContract, setExpandedContract] = useState<string | null>(null);

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
    <>
      <div className="space-y-4">
        {contracts.map((contract) => {
          const contractData: ContractData = {
            id: contract.id,
            contract_number: contract.contract_number,
            monthly_rent: contract.monthly_rent,
            start_date: contract.start_date,
            end_date: contract.end_date,
            status: contract.status,
            payment_frequency: contract.payment_frequency || 'شهري',
            security_deposit: contract.security_deposit,
            tenant_name: contract.tenant_name || '',
            notes: contract.notes,
            properties: contract.properties || undefined,
          };

          const isActive = contract.status === 'نشط' || contract.status === 'active';
          const isExpanded = expandedContract === contract.id;

          return (
            <Collapsible 
              key={contract.id} 
              open={isExpanded} 
              onOpenChange={(open) => setExpandedContract(open ? contract.id : null)}
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {contract.properties?.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusLabels[contract.status]?.variant || 'secondary'}>
                        {statusLabels[contract.status]?.label || contract.status}
                      </Badge>
                      {isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setTerminationContract(contractData)}
                        >
                          <AlertTriangle className="h-4 w-4 ms-1" />
                          <span className="hidden sm:inline">إنهاء مبكر</span>
                        </Button>
                      )}
                    </div>
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
                  
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>نوع الدفع: {contract.payment_frequency || 'شهري'}</span>
                    </div>
                    
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Receipt className="h-4 w-4 ms-1" />
                        السندات
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="mt-4">
                    <ContractReceipts 
                      contractId={contract.id} 
                      tenantName={contract.tenant_name || ''} 
                    />
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* حوار إنهاء العقد المبكر */}
      <EarlyTerminationDialog
        open={!!terminationContract}
        onOpenChange={(open) => !open && setTerminationContract(null)}
        contract={terminationContract}
      />
    </>
  );
}
