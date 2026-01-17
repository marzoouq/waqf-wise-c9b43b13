import { useState } from "react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, Eye, Trash2, Star } from "lucide-react";
import { useCustomReports, type ReportTemplate } from "@/hooks/reports/useCustomReports";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { format, arLocale as ar } from "@/lib/date";
import { CreateReportDialog } from "@/components/reports/CreateReportDialog";
import { ViewReportDialog } from "@/components/reports/ViewReportDialog";
import { exportToExcel, exportToPDF } from "@/lib/report-export";
import { useToast } from "@/hooks/ui/use-toast";

export default function CustomReports() {
  const { 
    templates: reports, 
    isLoading, 
    deleteTemplate, 
    createTemplate,
    executeReport,
    toggleFavorite,
    REPORT_FIELDS 
  } = useCustomReports();
  const { toast } = useToast();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);

  const handleView = (report: ReportTemplate) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const handleDownload = async (report: ReportTemplate, format: "excel" | "pdf") => {
    try {
      toast({ title: "جاري التحميل...", description: "يتم إعداد التقرير للتنزيل" });
      const result = await executeReport(report);
      
      if (format === "excel") {
        await exportToExcel(report, result);
      } else {
        await exportToPDF(report, result);
      }
      
      toast({ title: "تم التنزيل", description: `تم تنزيل التقرير بصيغة ${format.toUpperCase()}` });
    } catch (error) {
      toast({ 
        title: "خطأ في التنزيل", 
        description: "حدث خطأ أثناء تحميل التقرير",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا التقرير؟")) {
      await deleteTemplate(id);
    }
  };

  const handleToggleFavorite = async (report: ReportTemplate) => {
    await toggleFavorite({ id: report.id, isFavorite: !report.is_favorite });
  };

  const handleCreateReport = async (data: {
    name: string;
    report_type: string;
    fields: string[];
    is_public?: boolean;
  }) => {
    await createTemplate(data);
  };

  const columns: Column<ReportTemplate>[] = [
    {
      key: "name",
      label: "اسم التقرير",
      render: (value: string, row: ReportTemplate) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
          {row.is_favorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
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
          <Button 
            variant="ghost" 
            size="icon" 
            title="عرض التقرير"
            onClick={() => handleView(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title="تنزيل Excel"
            onClick={() => handleDownload(row, "excel")}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title={row.is_favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            onClick={() => handleToggleFavorite(row)}
          >
            <Star className={`h-4 w-4 ${row.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title="حذف"
            onClick={() => handleDelete(row.id)}
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
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="ms-2 h-4 w-4" />
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

      {/* Create Report Dialog */}
      <CreateReportDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateReport}
        reportFields={REPORT_FIELDS}
      />

      {/* View Report Dialog */}
      <ViewReportDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        template={selectedReport}
        executeReport={executeReport}
        onDownload={handleDownload}
      />
    </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
