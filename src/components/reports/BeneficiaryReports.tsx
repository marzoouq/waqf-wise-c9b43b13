import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Users } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { exportToExcel, exportToPDF } from "@/lib/exportHelpers";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { UnifiedDataTable, Column } from "@/components/unified/UnifiedDataTable";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function BeneficiaryReports() {
  const { toast } = useToast();

  const { data: beneficiaries = [], isLoading } = useQuery({
    queryKey: ["beneficiaries-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .order("created_at", { ascending: false});

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

  const columns: Column<any>[] = [
    {
      key: "full_name",
      label: "الاسم الكامل",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "national_id",
      label: "رقم الهوية",
      render: (value) => <span className="font-mono">{value}</span>,
      hideOnMobile: true,
    },
    {
      key: "category",
      label: "الفئة",
      render: (value) => <Badge variant="secondary">{value}</Badge>,
    },
    {
      key: "status",
      label: "الحالة",
      render: (value) => (
        <Badge variant={value === "نشط" ? "default" : "secondary"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "city",
      label: "المدينة",
      render: (value) => value || "-",
      hideOnMobile: true,
    },
    {
      key: "tribe",
      label: "القبيلة",
      render: (value) => value || "-",
      hideOnTablet: true,
    },
  ];

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
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            تقرير المستفيدين ({beneficiaries.length})
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
      </Card>

      <UnifiedDataTable
        columns={columns}
        data={beneficiaries}
        emptyMessage="لا توجد بيانات للمستفيدين"
      />
    </div>
  );
}
