import { useContracts } from "@/hooks/useContracts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";

export function ContractsTable() {
  const { contracts, isLoading } = useContracts();

  if (isLoading) return <LoadingState message="جاري تحميل العقود..." />;
  
  if (!contracts || contracts.length === 0) {
    return <EmptyState icon={FileText} title="لا توجد عقود" description="لم يتم تسجيل أي عقود بعد" />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم العقد</TableHead>
            <TableHead>اسم المستأجر</TableHead>
            <TableHead>العقار</TableHead>
            <TableHead>تاريخ البدء</TableHead>
            <TableHead>تاريخ الانتهاء</TableHead>
            <TableHead>الإيجار الشهري</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">{contract.contract_number}</TableCell>
              <TableCell>{contract.tenant_name}</TableCell>
              <TableCell>{contract.properties?.name || '-'}</TableCell>
              <TableCell>{new Date(contract.start_date).toLocaleDateString('ar-SA')}</TableCell>
              <TableCell>{new Date(contract.end_date).toLocaleDateString('ar-SA')}</TableCell>
              <TableCell className="font-bold">{contract.monthly_rent.toLocaleString()} ر.س</TableCell>
              <TableCell>
                <Badge variant={contract.status === 'نشط' ? 'default' : 'secondary'}>
                  {contract.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
