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
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CustomReportFilter } from "@/types/reports/index";
import type { Json } from "@/integrations/supabase/types";

export function CustomReportBuilder() {
  const { toast } = useToast();
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportType, setReportType] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<CustomReportFilter[]>([]);
  const [groupBy, setGroupBy] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");

  const reportTypes = [
    { value: "beneficiaries", label: "تقرير المستفيدين" },
    { value: "payments", label: "تقرير المدفوعات" },
    { value: "properties", label: "تقرير العقارات" },
    { value: "distributions", label: "تقرير التوزيعات" },
    { value: "loans", label: "تقرير القروض" },
    { value: "contracts", label: "تقرير العقود" },
  ];

  const availableFields: Record<string, string[]> = {
    beneficiaries: ["الاسم", "الفئة", "الحالة", "رقم الهوية", "الجوال", "المدينة"],
    payments: ["رقم الدفعة", "التاريخ", "المبلغ", "الوصف", "الحالة"],
    properties: ["اسم العقار", "النوع", "المساحة", "القيمة", "الحالة"],
    distributions: ["رقم التوزيع", "التاريخ", "المبلغ الكلي", "عدد المستفيدين"],
    loans: ["رقم القرض", "المبلغ", "المدة", "القسط الشهري", "الحالة"],
    contracts: ["رقم العقد", "العقار", "المستأجر", "الإيجار الشهري", "تاريخ البداية", "تاريخ الانتهاء"],
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
      const configuration = {
        type: reportType,
        fields: selectedFields,
        filters,
        groupBy,
        sortBy,
      };

      const { error } = await supabase
        .from("custom_report_templates")
        .insert([{
          name: reportName,
          description: reportDescription,
          report_type: reportType,
          configuration: configuration as unknown as Json,
          is_public: false,
        }]);

      if (error) throw error;

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ قالب التقرير المخصص",
      });

      // Reset form
      setReportName("");
      setReportDescription("");
      setReportType("");
      setSelectedFields([]);
      setFilters([]);
      setGroupBy("");
      setSortBy("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ';
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: errorMessage,
      });
    }
  };

  const handleRunReport = () => {
    toast({
      title: "تشغيل التقرير",
      description: "جاري إنشاء التقرير...",
    });
    // هنا يمكن إضافة منطق تشغيل التقرير
  };

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
            <Select value={reportType} onValueChange={setReportType}>
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
              {availableFields[reportType]?.map((field) => (
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
                <Plus className="h-4 w-4 ml-2" />
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
                  <div key={index} className="flex items-end gap-2">
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
                            {availableFields[reportType]?.map((field) => (
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
          <Button variant="outline" onClick={handleRunReport}>
            <Play className="h-4 w-4 ml-2" />
            تشغيل التقرير
          </Button>
          <Button onClick={handleSaveReport}>
            <Save className="h-4 w-4 ml-2" />
            حفظ القالب
          </Button>
        </div>
      )}
    </div>
  );
}
