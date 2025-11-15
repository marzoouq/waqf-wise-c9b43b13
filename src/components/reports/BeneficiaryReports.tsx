import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Users } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { exportToExcel, exportToPDF } from "@/lib/exportHelpers";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function BeneficiaryReports() {
  const { toast } = useToast();

  const { data: beneficiaries = [], isLoading } = useQuery({
    queryKey: ["beneficiaries-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleExportPDF = () => {
    const headers = ["الاسم الكامل", "رقم الهوية", "الفئة", "الحالة", "المدينة"];
    const data = beneficiaries.map((b) => [
      b.full_name,
      b.national_id,
      b.category,
      b.status,
      b.city || "-",
    ]);

    exportToPDF("تقرير المستفيدين", headers, data, "beneficiaries_report");

    toast({
      title: "تم التصدير",
      description: "تم تصدير تقرير المستفيدين بنجاح",
    });
  };

  const handleExportExcel = () => {
    const data = beneficiaries.map((b) => ({
      "الاسم الكامل": b.full_name,
      "رقم الهوية": b.national_id,
      "رقم الجوال": b.phone,
      "البريد الإلكتروني": b.email || "-",
      الفئة: b.category,
      الحالة: b.status,
      المدينة: b.city || "-",
      القبيلة: b.tribe || "-",
      "تاريخ التسجيل": new Date(b.created_at).toLocaleDateString("ar-SA"),
    }));

    exportToExcel(data, "beneficiaries_report", "المستفيدون");

    toast({
      title: "تم التصدير",
      description: "تم تصدير تقرير المستفيدين بنجاح",
    });
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل بيانات المستفيدين..." />;
  }

  if (beneficiaries.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="لا توجد بيانات للمستفيدين"
        description="لم يتم العثور على أي بيانات للمستفيدين"
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          تقرير المستفيدين
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
                <TableHead>الاسم الكامل</TableHead>
                <TableHead>رقم الهوية</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>القبيلة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beneficiaries.map((beneficiary) => (
                <TableRow key={beneficiary.id}>
                  <TableCell className="font-medium">
                    {beneficiary.full_name}
                  </TableCell>
                  <TableCell className="font-mono">{beneficiary.national_id}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{beneficiary.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        beneficiary.status === "نشط" ? "default" : "secondary"
                      }
                    >
                      {beneficiary.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{beneficiary.city || "-"}</TableCell>
                  <TableCell>{beneficiary.tribe || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          إجمالي المستفيدين: {beneficiaries.length}
        </div>
      </CardContent>
    </Card>
  );
}
