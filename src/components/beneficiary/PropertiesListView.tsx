import { useProperties } from "@/hooks/property/useProperties";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Building2 } from "lucide-react";

export function PropertiesListView() {
  const { properties, isLoading, error, refetch } = useProperties();

  if (isLoading) return <LoadingState message="جاري تحميل العقارات..." />;

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل بيانات العقارات" onRetry={refetch} />;
  }
  
  if (!properties || properties.length === 0) {
    return <EmptyState icon={Building2} title="لا توجد عقارات" description="لم يتم تسجيل أي عقارات بعد" />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم العقار</TableHead>
            <TableHead>النوع</TableHead>
            <TableHead>الموقع</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell className="font-medium">{property.name}</TableCell>
              <TableCell>{property.type}</TableCell>
              <TableCell>{property.location}</TableCell>
              <TableCell>
                <Badge variant={property.status === 'نشط' ? 'default' : 'secondary'}>
                  {property.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
