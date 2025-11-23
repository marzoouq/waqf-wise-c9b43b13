import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  FileText,
  Building,
  PiggyBank,
  Heart,
  Crown,
  PieChart as PieChartIcon
} from "lucide-react";
import { useDisclosureBeneficiaries } from "@/hooks/useAnnualDisclosures";
import { AnnualDisclosure } from "@/hooks/useAnnualDisclosures";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ViewDisclosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disclosure: AnnualDisclosure | null;
}

export const ViewDisclosureDialog = ({
  open,
  onOpenChange,
  disclosure,
}: ViewDisclosureDialogProps) => {
  const { beneficiaries, isLoading } = useDisclosureBeneficiaries(disclosure?.id);

  if (!disclosure) return null;

  // بيانات الرسوم البيانية
  const distributionData = [
    { name: 'حصة الناظر', value: disclosure.nazer_share, color: 'hsl(var(--chart-1))' },
    { name: 'صدقة الواقف', value: disclosure.charity_share, color: 'hsl(var(--chart-2))' },
    { name: 'رقبة الوقف', value: disclosure.corpus_share, color: 'hsl(var(--chart-3))' },
  ];

  const expensesData = [
    { name: 'صيانة', value: disclosure.maintenance_expenses || 0, color: 'hsl(var(--chart-4))' },
    { name: 'إدارية', value: disclosure.administrative_expenses || 0, color: 'hsl(var(--chart-5))' },
    { name: 'تطوير', value: disclosure.development_expenses || 0, color: 'hsl(var(--chart-1))' },
    { name: 'أخرى', value: disclosure.other_expenses || 0, color: 'hsl(var(--chart-2))' },
  ].filter(item => item.value > 0);

  const beneficiariesData = [
    { name: 'أبناء', value: disclosure.sons_count, color: 'hsl(var(--primary))' },
    { name: 'بنات', value: disclosure.daughters_count, color: 'hsl(var(--secondary))' },
    { name: 'زوجات', value: disclosure.wives_count, color: 'hsl(var(--accent))' },
  ].filter(item => item.value > 0);

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`الإفصاح السنوي - ${disclosure.year}`}
      description={`${disclosure.waqf_name} - إفصاح مالي شامل وشفاف`}
      size="full"
    >
      <div className="space-y-6">
        {/* ملخص المعلومات المالية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              الملخص المالي السنوي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-green-600">إجمالي الإيرادات</p>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {disclosure.total_revenues.toLocaleString()} ر.س
                </p>
              </div>

              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-medium text-red-600">إجمالي المصروفات</p>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {disclosure.total_expenses.toLocaleString()} ر.س
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-600">صافي الدخل</p>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {disclosure.net_income.toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* رسوم بيانية تفاعلية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              التحليل المالي التفاعلي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-4 text-center">الإيرادات مقابل المصروفات</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'الإيرادات', value: disclosure.total_revenues, color: 'hsl(var(--success))' },
                        { name: 'المصروفات', value: disclosure.total_expenses, color: 'hsl(var(--destructive))' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {[
                        { name: 'الإيرادات', value: disclosure.total_revenues, color: 'hsl(var(--success))' },
                        { name: 'المصروفات', value: disclosure.total_expenses, color: 'hsl(var(--destructive))' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {beneficiariesData.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-4 text-center">توزيع المستفيدين</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={beneficiariesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {beneficiariesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* نسب التوزيع */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              نسب وحصص التوزيع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-warning" />
                    <p className="text-sm font-medium">حصة الناظر</p>
                  </div>
                  <p className="text-xl font-bold mb-1">
                    {disclosure.nazer_share.toLocaleString()} ر.س
                  </p>
                  <Badge variant="outline">{disclosure.nazer_percentage}%</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-accent" />
                    <p className="text-sm font-medium">صدقة الواقف</p>
                  </div>
                  <p className="text-xl font-bold mb-1">
                    {disclosure.charity_share.toLocaleString()} ر.س
                  </p>
                  <Badge variant="outline">{disclosure.charity_percentage}%</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium">رقبة الوقف</p>
                  </div>
                  <p className="text-xl font-bold mb-1">
                    {disclosure.corpus_share.toLocaleString()} ر.س
                  </p>
                  <Badge variant="outline">{disclosure.corpus_percentage}%</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-4 text-center">التوزيع النسبي</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات المستفيدين */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              إحصائيات المستفيدين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 text-center border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{disclosure.total_beneficiaries}</p>
                <p className="text-sm text-muted-foreground">إجمالي المستفيدين</p>
              </div>
              
              <div className="p-4 text-center border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-info" />
                <p className="text-2xl font-bold">{disclosure.sons_count}</p>
                <p className="text-sm text-muted-foreground">الأبناء</p>
              </div>
              
              <div className="p-4 text-center border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">{disclosure.daughters_count}</p>
                <p className="text-sm text-muted-foreground">البنات</p>
              </div>
              
              <div className="p-4 text-center border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-secondary-foreground" />
                <p className="text-2xl font-bold">{disclosure.wives_count}</p>
                <p className="text-sm text-muted-foreground">الزوجات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* تفاصيل المصروفات */}
        {expensesData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                تفاصيل المصروفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-3">
                  {disclosure.maintenance_expenses && disclosure.maintenance_expenses > 0 && (
                    <div className="p-3 bg-warning-light rounded-lg border border-warning/20">
                      <p className="text-xs text-warning mb-1">مصروفات الصيانة</p>
                      <p className="text-lg font-bold text-warning">
                        {disclosure.maintenance_expenses.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {disclosure.administrative_expenses && disclosure.administrative_expenses > 0 && (
                    <div className="p-3 bg-info-light rounded-lg border border-info/20">
                      <p className="text-xs text-info mb-1">مصروفات إدارية</p>
                      <p className="text-lg font-bold text-info">
                        {disclosure.administrative_expenses.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {disclosure.development_expenses && disclosure.development_expenses > 0 && (
                    <div className="p-3 bg-secondary rounded-lg border border-secondary/20">
                      <p className="text-xs text-secondary-foreground mb-1">مصروفات التطوير</p>
                      <p className="text-lg font-bold text-secondary-foreground">
                        {disclosure.development_expenses.toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {disclosure.other_expenses && disclosure.other_expenses > 0 && (
                    <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                      <p className="text-xs text-accent mb-1">مصروفات أخرى</p>
                      <p className="text-lg font-bold text-accent">
                        {disclosure.other_expenses.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-4 text-center">توزيع المصروفات</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={expensesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {expensesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* قائمة المستفيدين التفصيلية */}
        {beneficiaries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                قائمة المستفيدين التفصيلية ({beneficiaries.length} مستفيد)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>العلاقة</TableHead>
                      <TableHead>المبلغ المخصص</TableHead>
                      <TableHead>عدد الدفعات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          جاري التحميل...
                        </TableCell>
                      </TableRow>
                    ) : (
                      beneficiaries.map((ben) => (
                        <TableRow key={ben.id}>
                          <TableCell className="font-medium">{ben.beneficiary_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{ben.beneficiary_type}</Badge>
                          </TableCell>
                          <TableCell>{ben.relationship || '-'}</TableCell>
                          <TableCell className="font-semibold">
                            {ben.allocated_amount.toLocaleString()} ر.س
                          </TableCell>
                          <TableCell>{ben.payments_count}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveDialog>
  );
};
