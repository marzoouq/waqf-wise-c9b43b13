import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Building2 } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { exportToExcel, exportToPDF } from "@/lib/exportHelpers";
import { toast } from "@/lib/toast";
import { PropertyRow, ContractRow } from "@/types/supabase-helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PropertyWithContracts extends PropertyRow {
  contracts?: ContractRow[];
}

export function PropertiesReports() {
  

  const { data: properties = [], isLoading } = useQuery<PropertyWithContracts[]>({
    queryKey: ["properties-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          contracts (
            id,
            contract_number,
            tenant_name,
            monthly_rent,
            status
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PropertyWithContracts[];
    },
  });

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          تقرير العقارات
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
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
