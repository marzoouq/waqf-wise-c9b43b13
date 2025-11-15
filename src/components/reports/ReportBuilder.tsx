import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCustomReports } from '@/hooks/useCustomReports';
import { Plus, Save, Play, Trash2, Star } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';

export const ReportBuilder = () => {
  const { templates, isLoading, createTemplate, deleteTemplate, toggleFavorite, executeReport } = useCustomReports();
  
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportType, setReportType] = useState('beneficiaries');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<any>({});

  const reportTypes = [
    { value: 'beneficiaries', label: 'المستفيدون' },
    { value: 'properties', label: 'العقارات' },
    { value: 'contracts', label: 'العقود' },
    { value: 'payments', label: 'المدفوعات' },
    { value: 'distributions', label: 'التوزيعات' },
    { value: 'loans', label: 'القروض' },
  ];

  const columnsByType: Record<string, { value: string; label: string }[]> = {
    beneficiaries: [
      { value: 'full_name', label: 'الاسم الكامل' },
      { value: 'national_id', label: 'رقم الهوية' },
      { value: 'phone', label: 'الهاتف' },
      { value: 'city', label: 'المدينة' },
      { value: 'category', label: 'الفئة' },
      { value: 'status', label: 'الحالة' },
    ],
    properties: [
      { value: 'name', label: 'الاسم' },
      { value: 'property_type', label: 'النوع' },
      { value: 'location', label: 'الموقع' },
      { value: 'status', label: 'الحالة' },
      { value: 'market_value', label: 'القيمة السوقية' },
    ],
  };

  const handleSaveTemplate = async () => {
    if (!reportName) return;

    await createTemplate({
      name: reportName,
      description: reportDescription,
      report_type: reportType,
      configuration: {
        columns: selectedColumns,
        filters,
      },
      is_public: false,
      is_favorite: false,
    });

    // Reset form
    setReportName('');
    setReportDescription('');
    setSelectedColumns([]);
    setFilters({});
  };

  const handleExecuteReport = async (template: any) => {
    try {
      const results = await executeReport(template);
      console.log('Report results:', results);
      // يمكن عرض النتائج في modal أو تصديرها
    } catch (error) {
      console.error('Error executing report:', error);
    }
  };

  if (isLoading) {
    return <LoadingState message="جاري التحميل..." />;
  }

  return (
    <div className="space-y-6">
      {/* منشئ التقرير */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            منشئ التقارير المخصصة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم التقرير</Label>
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="مثال: تقرير المستفيدين النشطين"
              />
            </div>

            <div className="space-y-2">
              <Label>نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="وصف مختصر للتقرير..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>الأعمدة المطلوبة</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-lg">
              {columnsByType[reportType]?.map((column) => (
                <div key={column.value} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={column.value}
                    checked={selectedColumns.includes(column.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedColumns([...selectedColumns, column.value]);
                      } else {
                        setSelectedColumns(selectedColumns.filter(c => c !== column.value));
                      }
                    }}
                  />
                  <Label htmlFor={column.value} className="text-sm cursor-pointer">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveTemplate} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              حفظ القالب
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* القوالب المحفوظة */}
      <Card>
        <CardHeader>
          <CardTitle>القوالب المحفوظة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleFavorite({ id: template.id, isFavorite: template.is_favorite })}
                    >
                      <Star className={`h-4 w-4 ${template.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {template.description && (
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleExecuteReport(template)}
                      className="flex-1 flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      تنفيذ
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
