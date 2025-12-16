import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCustomReports } from "@/hooks/reports/useCustomReports";

export function ReportBuilder() {
  const { createTemplate } = useCustomReports();
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("custom");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const availableColumns = [
    { value: "full_name", label: "الاسم الكامل" },
    { value: "national_id", label: "رقم الهوية" },
    { value: "phone", label: "رقم الهاتف" },
    { value: "category", label: "الفئة" },
    { value: "status", label: "الحالة" },
    { value: "total_received", label: "إجمالي المستحقات" },
    { value: "created_at", label: "تاريخ التسجيل" },
  ];

  const reportTypes = [
    { value: "beneficiaries", label: "المستفيدون" },
    { value: "properties", label: "العقارات" },
    { value: "distributions", label: "التوزيعات" },
    { value: "loans", label: "القروض" },
    { value: "accounting", label: "المحاسبة" },
    { value: "custom", label: "مخصص" },
  ];

  const handleSubmit = () => {
    if (!reportName || selectedColumns.length === 0) {
      return;
    }

    createTemplate({
      name: reportName,
      report_type: reportType,
      fields: selectedColumns,
      description: '',
      configuration: { columns: selectedColumns, filters: {}, sortBy: '' },
      is_public: false,
      is_favorite: false,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>بناء تقرير مخصص</CardTitle>
        <CardDescription>قم بإنشاء تقرير مخصص بالبيانات التي تحتاجها</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="report-name">اسم التقرير</Label>
          <Input
            id="report-name"
            placeholder="مثال: تقرير المستفيدين الشهري"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-type">نوع التقرير</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger id="report-type">
              <SelectValue />
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

        <div className="space-y-4">
          <Label>الأعمدة المطلوبة</Label>
          <div className="grid grid-cols-2 gap-4">
            {availableColumns.map((column) => (
              <div key={column.value} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={column.value}
                  checked={selectedColumns.includes(column.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedColumns([...selectedColumns, column.value]);
                    } else {
                      setSelectedColumns(selectedColumns.filter((c) => c !== column.value));
                    }
                  }}
                />
                <Label htmlFor={column.value} className="cursor-pointer">
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => {
            setReportName("");
            setSelectedColumns([]);
          }}>
            إعادة تعيين
          </Button>
          <Button onClick={handleSubmit}>
            إنشاء التقرير
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
