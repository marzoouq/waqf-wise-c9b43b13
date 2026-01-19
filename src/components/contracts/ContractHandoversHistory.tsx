/**
 * سجل نماذج استلام/تسليم الوحدة
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ClipboardCheck,
  Eye,
  Printer,
  Key,
  Zap,
  Droplets,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useUnitHandovers } from '@/hooks/contracts/useUnitHandovers';
import { UnitHandoverPrintTemplate } from './UnitHandoverPrintTemplate';
import { Skeleton } from '@/components/ui/skeleton';
import { type Contract } from '@/hooks/property/useContracts';

type UnitHandoverData = ReturnType<typeof useUnitHandovers>['handovers'] extends (infer T)[] | undefined ? T : never;

interface ContractHandoversHistoryProps {
  contractId: string;
  contract: Contract;
}

export function ContractHandoversHistory({
  contractId,
  contract,
}: ContractHandoversHistoryProps) {
  const { handovers, isLoading } = useUnitHandovers(contractId);
  const [selectedHandover, setSelectedHandover] = useState<UnitHandoverData | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!handovers?.length) {
    return null;
  }

  const handleViewPrint = (handover: UnitHandoverData) => {
    setSelectedHandover(handover);
    setShowPrintDialog(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            سجل استلام/تسليم الوحدة
            <Badge variant="outline" className="me-2">
              {handovers.length} نموذج
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>العدادات</TableHead>
                <TableHead>المفاتيح</TableHead>
                <TableHead>التوقيعات</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {handovers.map((handover) => (
                <TableRow key={handover.id}>
                  <TableCell>
                    {format(new Date(handover.handover_date), 'dd/MM/yyyy', {
                      locale: ar,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        handover.handover_type === 'تسليم'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {handover.handover_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {handover.general_condition || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      {handover.electricity_meter_reading && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          {handover.electricity_meter_reading}
                        </span>
                      )}
                      {handover.water_meter_reading && (
                        <span className="flex items-center gap-1">
                          <Droplets className="h-3 w-3 text-blue-500" />
                          {handover.water_meter_reading}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      {handover.keys_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span title="توقيع المؤجر">
                        {handover.landlord_signature ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                      <span title="توقيع المستأجر">
                        {handover.tenant_signature ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleViewPrint(handover)}
                        title="عرض وطباعة"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleViewPrint(handover)}
                        title="طباعة"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* حوار الطباعة */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>نموذج {selectedHandover?.handover_type} الوحدة</DialogTitle>
          </DialogHeader>
          {selectedHandover && (
            <UnitHandoverPrintTemplate
              handover={selectedHandover}
              contract={{
                contract_number: contract.contract_number,
                tenant_name: contract.tenant_name,
                tenant_phone: contract.tenant_phone,
                tenant_id_number: contract.tenant_id_number,
                property_name: contract.properties?.name,
                property_location: contract.properties?.location,
                monthly_rent: contract.monthly_rent,
              }}
              onPrint={() => setShowPrintDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
