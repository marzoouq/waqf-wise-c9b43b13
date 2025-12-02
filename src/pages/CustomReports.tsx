import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, Eye, Trash2 } from "lucide-react";
import { useCustomReports, type ReportTemplate } from "@/hooks/useCustomReports";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { format, arLocale as ar } from "@/lib/date";

export default function CustomReports() {
  const { templates: reports, isLoading, deleteTemplate } = useCustomReports();

  const columns: Column<ReportTemplate>[] = [
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
      key: "is_favorite",
      label: "مفضل",
      hideOnTablet: true,
      render: (value: boolean) => (
        value ? <Badge variant="outline">نعم</Badge> : <span className="text-muted-foreground">لا</span>
      )
    },
    {
      key: "created_at",
      label: "تاريخ الإنشاء",
      hideOnMobile: true,
      render: (value: string) => value ? format(new Date(value), 'dd/MM/yyyy', { locale: ar }) : '-'
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (_: unknown, row: ReportTemplate) => (
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
    <PageErrorBoundary pageName="التقارير المخصصة">
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="التقارير المخصصة"
        description="إنشاء وإدارة التقارير المخصصة حسب احتياجاتك"
        icon={<FileText className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        actions={
          <Button size="sm">
            <Plus className="ml-2 h-4 w-4" />
            <span className="hidden sm:inline">تقرير جديد</span>
            <span className="sm:hidden">جديد</span>
          </Button>
        }
      />

      <Card>
        <CardHeader>
            <CardTitle>قائمة التقارير</CardTitle>
            <CardDescription>جميع التقارير المخصصة المحفوظة</CardDescription>
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
    </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
