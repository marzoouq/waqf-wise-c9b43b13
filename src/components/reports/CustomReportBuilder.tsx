import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Save,
  Play,
  FileText,
  Settings,
  Filter,
  BarChart3,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/ui/use-toast";
import { useCustomReports, type ReportResult } from "@/hooks/reports/useCustomReports";
import { ReportResultsPreview } from "./ReportResultsPreview";
import { exportToPDF, exportToExcel, exportToCSV } from "@/lib/exportHelpers";
import type { CustomReportFilter } from "@/types/reports/index";
import { ReportService } from "@/services";

export function CustomReportBuilder() {
  const { toast } = useToast();
  const { executeDirectReport, REPORT_FIELDS } = useCustomReports();
  
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportType, setReportType] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<CustomReportFilter[]>([]);
  const [groupBy, setGroupBy] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  
  const [isRunning, setIsRunning] = useState(false);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);

  const reportTypes = [
    { value: "beneficiaries", label: "تقرير المستفيدين" },
    { value: "payments", label: "تقرير المدفوعات" },
    { value: "properties", label: "تقرير العقارات" },
    { value: "distributions", label: "تقرير التوزيعات" },
    { value: "loans", label: "تقرير القروض" },
    { value: "contracts", label: "تقرير العقود" },
  ];

  // الحصول على الحقول المتاحة حسب نوع التقرير
  const getAvailableFields = (type: string): string[] => {
    return REPORT_FIELDS[type]?.map(f => f.label) || [];
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const addFilter = () => {
    setFilters([...filters, { field: "", operator: "equals", value: "" }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, key: string, value: string | number | boolean) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [key]: value };
    setFilters(newFilters);
  };

  const handleSaveReport = async () => {
    if (!reportName || !reportType || selectedFields.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
      });
      return;
    }

    try {
      await ReportService.createTemplate({
        template_name: reportName,
        description: reportDescription,
        report_type: reportType,
        template_config: JSON.parse(JSON.stringify({
          type: reportType,
          fields: selectedFields,
          filters,
          groupBy,
          sortBy,
        })),
        is_public: false,
      });

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ قالب التقرير المخصص",
      });

      // Reset form
      resetForm();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ';
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: errorMessage,
      });
    }
  };

  const handleRunReport = async () => {
    if (!reportType || selectedFields.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار نوع التقرير والحقول المطلوبة",
      });
      return;
    }

    setIsRunning(true);
    try {
      const result = await executeDirectReport(reportType, selectedFields, sortBy);
      setReportResult(result);
      
      toast({
        title: "تم توليد التقرير",
        description: `تم جلب ${result.totalCount} سجل`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء تشغيل التقرير';
      toast({
        variant: "destructive",
        title: "خطأ في التقرير",
        description: errorMessage,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const resetForm = () => {
    setReportName("");
    setReportDescription("");
    setReportType("");
    setSelectedFields([]);
    setFilters([]);
    setGroupBy("");
    setSortBy("");
    setReportResult(null);
  };

  // دوال التصدير
  const handleExportPDF = () => {
    if (!reportResult) return;
    
    const headers = reportResult.columns.map(c => c.label);
    const rows = reportResult.data.map(row => 
      reportResult.columns.map(col => String(row[col.key] ?? '—'))
    );
    
    exportToPDF(
      reportName || 'تقرير مخصص',
      headers,
      rows,
      `custom-report-${new Date().toISOString().split('T')[0]}`
    );
    
    toast({ title: "تم التصدير", description: "تم تصدير التقرير بصيغة PDF" });
  };

  const handleExportExcel = () => {
    if (!reportResult) return;
    
    const data = reportResult.data.map(row => {
      const obj: Record<string, unknown> = {};
      reportResult.columns.forEach(col => {
        obj[col.label] = row[col.key];
      });
      return obj;
    });
    
    exportToExcel(data, reportName || 'تقرير-مخصص');
    toast({ title: "تم التصدير", description: "تم تصدير التقرير بصيغة Excel" });
  };

  const handleExportCSV = () => {
    if (!reportResult) return;
    
    const headers = reportResult.columns.map(c => c.label);
    const rows = reportResult.data.map(row => 
      reportResult.columns.map(col => String(row[col.key] ?? ''))
    );
    
    exportToCSV(headers, rows, reportName || 'تقرير-مخصص');
    toast({ title: "تم التصدير", description: "تم تصدير التقرير بصيغة CSV" });
  };

  const availableFields = reportType ? getAvailableFields(reportType) : [];

  return (
    <div className="space-y-6">
      {/* معلومات التقرير */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            معلومات التقرير
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-name">اسم التقرير *</Label>
            <Input
              id="report-name"
              placeholder="تقرير المدفوعات الشهرية"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">وصف التقرير</Label>
            <Textarea
              id="report-description"
              placeholder="وصف مختصر للتقرير..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-type">نوع التقرير *</Label>
            <Select value={reportType} onValueChange={(value) => {
              setReportType(value);
              setSelectedFields([]);
              setReportResult(null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع التقرير" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* اختيار الحقول */}
      {reportType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              اختيار الحقول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableFields.map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <Checkbox
                    id={field}
                    checked={selectedFields.includes(field)}
                    onCheckedChange={() => handleFieldToggle(field)}
                  />
                  <Label htmlFor={field} className="cursor-pointer">
                    {field}
                  </Label>
                </div>
              ))}
            </div>

            {selectedFields.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">الحقول المختارة:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFields.map((field) => (
                    <Badge key={field} variant="secondary">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* الفلاتر */}
      {reportType && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                الفلاتر
              </CardTitle>
              <Button size="sm" variant="outline" onClick={addFilter}>
                <Plus className="h-4 w-4 ms-2" />
                إضافة فلتر
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filters.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد فلاتر. اضغط "إضافة فلتر" لإضافة فلتر جديد.
              </p>
            ) : (
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={`filter-${index}-${filter.field}`} className="flex items-end gap-2">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label>الحقل</Label>
                        <Select
                          value={filter.field}
                          onValueChange={(value) => updateFilter(index, "field", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>المعامل</Label>
                        <Select
                          value={filter.operator}
                          onValueChange={(value) => updateFilter(index, "operator", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">يساوي</SelectItem>
                            <SelectItem value="not_equals">لا يساوي</SelectItem>
                            <SelectItem value="contains">يحتوي</SelectItem>
                            <SelectItem value="greater_than">أكبر من</SelectItem>
                            <SelectItem value="less_than">أقل من</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>القيمة</Label>
                        <Input
                          value={String(filter.value)}
                          onChange={(e) => updateFilter(index, "value", e.target.value)}
                          placeholder="القيمة"
                        />
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFilter(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* خيارات التجميع والترتيب */}
      {reportType && selectedFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              خيارات العرض
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group-by">تجميع حسب</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue placeholder="بدون تجميع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون تجميع</SelectItem>
                  {selectedFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-by">ترتيب حسب</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="بدون ترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون ترتيب</SelectItem>
                  {selectedFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* أزرار الإجراءات */}
      {reportType && selectedFields.length > 0 && (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={resetForm}>
            إعادة تعيين
          </Button>
          <Button variant="outline" onClick={handleRunReport} disabled={isRunning}>
            {isRunning ? (
              <Loader2 className="h-4 w-4 ms-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 ms-2" />
            )}
            تشغيل التقرير
          </Button>
          <Button onClick={handleSaveReport}>
            <Save className="h-4 w-4 ms-2" />
            حفظ القالب
          </Button>
        </div>
      )}

      {/* معاينة النتائج */}
      {reportResult && (
        <ReportResultsPreview
          result={reportResult}
          reportName={reportName}
          onClose={() => setReportResult(null)}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          onExportCSV={handleExportCSV}
        />
      )}
    </div>
  );
}
