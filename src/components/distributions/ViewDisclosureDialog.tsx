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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-medium">حصة الناظر</p>
                </div>
                <p className="text-xl font-bold mb-1">
                  {disclosure.nazer_share.toLocaleString()} ر.س
                </p>
                <Badge variant="outline">{disclosure.nazer_percentage}%</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <p className="text-sm font-medium">صدقة الواقف</p>
                </div>
                <p className="text-xl font-bold mb-1">
                  {disclosure.charity_share.toLocaleString()} ر.س
                </p>
                <Badge variant="outline">{disclosure.charity_percentage}%</Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-medium">رأس مال الوقف</p>
                </div>
                <p className="text-xl font-bold mb-1">
                  {disclosure.corpus_share.toLocaleString()} ر.س
                </p>
                <Badge variant="outline">{disclosure.corpus_percentage}%</Badge>
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
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{disclosure.sons_count}</p>
                <p className="text-sm text-muted-foreground mt-1">الأبناء</p>
              </div>
              
              <div className="text-center p-4 bg-pink-50 dark:bg-pink-950 rounded-lg">
                <p className="text-3xl font-bold text-pink-600">{disclosure.daughters_count}</p>
                <p className="text-sm text-muted-foreground mt-1">البنات</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{disclosure.wives_count}</p>
                <p className="text-sm text-muted-foreground mt-1">الزوجات</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{disclosure.total_beneficiaries}</p>
                <p className="text-sm text-muted-foreground mt-1">الإجمالي</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة المستفيدين التفصيلية */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المستفيدين والمستحقات</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
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
                      <TableCell colSpan={6} className="text-center">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : beneficiaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        لا توجد بيانات مستفيدين
                      </TableCell>
                    </TableRow>
                  ) : (
                    beneficiaries.map((beneficiary, index) => (
                      <TableRow key={beneficiary.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{beneficiary.beneficiary_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{beneficiary.beneficiary_type}</Badge>
                        </TableCell>
                        <TableCell>{beneficiary.relationship || '-'}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          {beneficiary.allocated_amount.toLocaleString()} ر.س
                        </TableCell>
                        <TableCell>{beneficiary.payments_count}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* كشف الحساب البنكي */}
        {(disclosure.opening_balance || disclosure.closing_balance) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                كشف الحساب البنكي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">الرصيد الافتتاحي</p>
                  <p className="text-2xl font-bold">
                    {disclosure.opening_balance?.toLocaleString() || 0} ر.س
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">الرصيد الختامي</p>
                  <p className="text-2xl font-bold">
                    {disclosure.closing_balance?.toLocaleString() || 0} ر.س
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* المصروفات التفصيلية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              تفصيل المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm">مصروفات الصيانة</span>
                <span className="font-bold">{disclosure.maintenance_expenses?.toLocaleString() || 0} ر.س</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm">مصروفات إدارية</span>
                <span className="font-bold">{disclosure.administrative_expenses?.toLocaleString() || 0} ر.س</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm">مصروفات التطوير</span>
                <span className="font-bold">{disclosure.development_expenses?.toLocaleString() || 0} ر.س</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm">مصروفات أخرى</span>
                <span className="font-bold">{disclosure.other_expenses?.toLocaleString() || 0} ر.س</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-bold">إجمالي المصروفات</span>
                <span className="text-lg font-bold text-red-600">
                  {disclosure.total_expenses.toLocaleString()} ر.س
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ملاحظة الشفافية */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📊 <strong>ملاحظة:</strong> هذا الإفصاح يعرض جميع المعلومات المالية والتوزيعات بشفافية كاملة.
            تم إعداده بناءً على البيانات المحاسبية المعتمدة والتوزيعات المنفذة خلال السنة المالية {disclosure.year}.
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
