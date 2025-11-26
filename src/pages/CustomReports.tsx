import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, Eye, Trash2 } from "lucide-react";
import { useCustomReports } from "@/hooks/useCustomReports";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function CustomReports() {
  const { templates: reports, isLoading, deleteTemplate } = useCustomReports();

  const columns: Column<any>[] = [
    {
      key: "name",
      label: "اسم التقرير",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: "report_type",
      label: "نوع التقرير",
      hideOnMobile: true,
      render: (value: string) => {
        const labels: Record<string, string> = {
          beneficiaries: 'المستفيدون',
          properties: 'العقارات',
          distributions: 'التوزيعات',
          loans: 'القروض',
          accounting: 'المحاسبة',
          custom: 'مخصص',
        };
        return <Badge variant="outline">{labels[value] || value}</Badge>;
      }
    },
    {
      key: "is_public",
      label: "الوصول",
      hideOnTablet: true,
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'عام' : 'خاص'}
        </Badge>
      )
    },
    {
      key: "is_scheduled",
      label: "مجدول",
      hideOnTablet: true,
      render: (value: boolean) => (
        value ? <Badge variant="outline">نعم</Badge> : <span className="text-muted-foreground">لا</span>
      )
    },
    {
      key: "created_at",
      label: "تاريخ الإنشاء",
      hideOnMobile: true,
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy', { locale: ar })
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="عرض">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="تنزيل">
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title="حذف"
            onClick={() => deleteTemplate(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="container-custom py-6 space-y-6">
      <PageHeader
        title="التقارير المخصصة"
        description="إنشاء وإدارة التقارير المخصصة حسب احتياجاتك"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>قائمة التقارير</CardTitle>
              <CardDescription>جميع التقارير المخصصة المحفوظة</CardDescription>
            </div>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              تقرير جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <UnifiedDataTable
            columns={columns}
            data={reports}
            loading={isLoading}
            emptyMessage="لا توجد تقارير مخصصة"
            showMobileScrollHint={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
