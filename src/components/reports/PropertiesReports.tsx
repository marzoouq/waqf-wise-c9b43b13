import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Building2 } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { exportToExcel, exportToPDF } from "@/lib/exportHelpers";
import { useToast } from "@/hooks/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReportRefreshIndicator } from "./ReportRefreshIndicator";
import { usePropertiesReport } from "@/hooks/reports/usePropertiesReport";

export function PropertiesReports() {
  const { toast } = useToast();
  const { properties, isLoading, isRefetching, lastUpdated, handleRefresh, error } = usePropertiesReport();

  const handleExportPDF = () => {
    const headers = ["اسم العقار", "الموقع", "نوع العقار", "الحالة", "الإيجار الشهري"];
    const data = properties.map((p) => {
      const activeContract = p.contracts?.find((c) => c.status === "نشط");
      return [
        p.name,
        p.location,
        p.type,
        p.status,
        activeContract
          ? `${Number(activeContract.monthly_rent).toLocaleString("ar-SA")} ريال`
          : "-",
      ];
    });

    exportToPDF("تقرير العقارات", headers, data, "properties_report");

    toast({
      title: "تم التصدير",
      description: "تم تصدير تقرير العقارات بنجاح",
    });
  };

  const handleExportExcel = () => {
    const data = properties.map((p) => {
      const activeContract = p.contracts?.find((c) => c.status === "نشط");
      return {
        "اسم العقار": p.name,
        الموقع: p.location,
        "نوع العقار": p.type,
        الحالة: p.status,
        "المستأجر الحالي": activeContract?.tenant_name || "-",
        "الإيجار الشهري": activeContract
          ? Number(activeContract.monthly_rent)
          : 0,
        "تاريخ الإضافة": new Date(p.created_at).toLocaleDateString("ar-SA"),
      };
    });

    exportToExcel(data, "properties_report", "العقارات");

    toast({
      title: "تم التصدير",
      description: "تم تصدير تقرير العقارات بنجاح",
    });
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل بيانات العقارات..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل تقرير العقارات" onRetry={handleRefresh} />;
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="لا توجد بيانات للعقارات"
        description="لم يتم العثور على أي بيانات للعقارات"
      />
    );
  }

  const totalRent = properties.reduce((sum, p) => {
    const activeContract = p.contracts?.find((c) => c.status === "نشط");
    return sum + (activeContract ? Number(activeContract.monthly_rent) : 0);
  }, 0);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          تقرير العقارات
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <ReportRefreshIndicator
            lastUpdated={lastUpdated}
            isRefetching={isRefetching}
            onRefresh={handleRefresh}
          />
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 ms-2" />
            PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" size="sm">
            <Download className="h-4 w-4 ms-2" />
            Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم العقار</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>نوع العقار</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المستأجر الحالي</TableHead>
                <TableHead className="text-left">الإيجار الشهري</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => {
                const activeContract = property.contracts?.find(
                  (c: { status: string }) => c.status === "نشط"
                );
                return (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.name}</TableCell>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{property.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          property.status === "متاح" ? "default" : "secondary"
                        }
                      >
                        {property.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{activeContract?.tenant_name || "-"}</TableCell>
                    <TableCell className="text-left font-mono">
                      {activeContract
                        ? Number(activeContract.monthly_rent).toLocaleString(
                            "ar-SA"
                          ) + " ريال"
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted-foreground">
            إجمالي العقارات: {properties.length}
          </span>
          <span className="font-semibold">
            إجمالي الإيجارات الشهرية:{" "}
            {totalRent.toLocaleString("ar-SA")} ريال
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
