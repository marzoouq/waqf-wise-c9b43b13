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
import { SmartDisclosureDocuments } from "@/components/reports/SmartDisclosureDocuments";
import { HistoricalRentalDetailsCard } from "@/components/fiscal-year/HistoricalRentalDetailsCard";

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
              <div className="p-4 bg-success-light dark:bg-success/10 rounded-lg border border-success/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <p className="text-sm font-medium text-success">إجمالي الإيرادات</p>
                </div>
                <p className="text-2xl font-bold text-success">
                  {disclosure.total_revenues.toLocaleString()} ر.س
                </p>
              </div>

              <div className="p-4 bg-destructive-light dark:bg-destructive/10 rounded-lg border border-destructive/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <p className="text-sm font-medium text-destructive">إجمالي المصروفات</p>
                </div>
                <p className="text-2xl font-bold text-destructive">
                  {disclosure.total_expenses.toLocaleString()} ر.س
                </p>
              </div>

              <div className="p-4 bg-info-light dark:bg-info/10 rounded-lg border border-info/30">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-info" />
                  <p className="text-sm font-medium text-info">صافي الدخل</p>
                </div>
                <p className="text-2xl font-bold text-info">
                  {disclosure.net_income.toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* تفاصيل الإيرادات */}
        {disclosure.revenue_breakdown && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                تفاصيل الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(disclosure.revenue_breakdown as { residential_monthly?: number; remaining_2024?: number; jeddah_properties?: number; nahdi_rental?: number })?.residential_monthly && (
                  <div className="p-3 bg-success/10 rounded-lg border border-success/30">
                    <p className="text-xs text-success mb-1">إيراد سكني شهري</p>
                    <p className="text-lg font-bold text-success">
                      {((disclosure.revenue_breakdown as { residential_monthly: number }).residential_monthly).toLocaleString()} ر.س
                    </p>
                  </div>
                )}
                {(disclosure.revenue_breakdown as { remaining_2024?: number })?.remaining_2024 && (
                  <div className="p-3 bg-success/10 rounded-lg border border-success/30">
                    <p className="text-xs text-success mb-1">متبقي 2024</p>
                    <p className="text-lg font-bold text-success">
                      {((disclosure.revenue_breakdown as { remaining_2024: number }).remaining_2024).toLocaleString()} ر.س
                    </p>
                  </div>
                )}
                {(disclosure.revenue_breakdown as { jeddah_properties?: number })?.jeddah_properties && (
                  <div className="p-3 bg-success/10 rounded-lg border border-success/30">
                    <p className="text-xs text-success mb-1">عقار 2 و 3 جدة</p>
                    <p className="text-lg font-bold text-success">
                      {((disclosure.revenue_breakdown as { jeddah_properties: number }).jeddah_properties).toLocaleString()} ر.س
                    </p>
                  </div>
                )}
                {(disclosure.revenue_breakdown as { nahdi_rental?: number })?.nahdi_rental && (
                  <div className="p-3 bg-success/10 rounded-lg border border-success/30">
                    <p className="text-xs text-success mb-1">إيجار النهدي</p>
                    <p className="text-lg font-bold text-success">
                      {((disclosure.revenue_breakdown as { nahdi_rental: number }).nahdi_rental).toLocaleString()} ر.س
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ضريبة VAT */}
        {disclosure.vat_amount && disclosure.vat_amount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                الخصومات الضريبية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <p className="text-sm font-medium text-destructive">ضريبة القيمة المضافة (VAT)</p>
                </div>
                <p className="text-2xl font-bold text-destructive">
                  {disclosure.vat_amount.toLocaleString()} ر.س
                </p>
                <Badge variant="outline" className="mt-2">15%</Badge>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* توزيعات المستفيدين */}
        {disclosure.beneficiaries_details && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                توزيعات المستفيدين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/30 col-span-2 md:col-span-4">
                  <p className="text-sm text-primary mb-1">إجمالي التوزيعات للمستفيدين</p>
                  <p className="text-2xl font-bold text-primary">
                    {((disclosure.beneficiaries_details as { distributions?: { total?: number } })?.distributions?.total || 0).toLocaleString()} ر.س
                  </p>
                </div>
                <div className="p-3 bg-heir-son/10 rounded-lg border border-heir-son/30">
                  <p className="text-xs text-heir-son mb-1">حصة الأبناء</p>
                  <p className="text-lg font-bold text-heir-son">
                    {((disclosure.beneficiaries_details as { distributions?: { sons_share?: number } })?.distributions?.sons_share || 0).toLocaleString()} ر.س
                  </p>
                </div>
                <div className="p-3 bg-heir-daughter/10 rounded-lg border border-heir-daughter/30">
                  <p className="text-xs text-heir-daughter mb-1">حصة البنات</p>
                  <p className="text-lg font-bold text-heir-daughter">
                    {((disclosure.beneficiaries_details as { distributions?: { daughters_share?: number } })?.distributions?.daughters_share || 0).toLocaleString()} ر.س
                  </p>
                </div>
                <div className="p-3 bg-heir-wife/10 rounded-lg border border-heir-wife/30">
                  <p className="text-xs text-heir-wife mb-1">حصة الزوجات</p>
                  <p className="text-lg font-bold text-heir-wife">
                    {((disclosure.beneficiaries_details as { distributions?: { wives_share?: number } })?.distributions?.wives_share || 0).toLocaleString()} ر.س
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">عدد الورثة</p>
                  <p className="text-lg font-bold">
                    {(disclosure.beneficiaries_details as { distributions?: { heirs_count?: number } })?.distributions?.heirs_count || 0} وريث
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* البيانات الشهرية */}
        {disclosure.monthly_data && Array.isArray(disclosure.monthly_data) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                البيانات الشهرية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الشهر</TableHead>
                      <TableHead>الإيرادات</TableHead>
                      <TableHead>المصروفات</TableHead>
                      <TableHead>الصافي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(disclosure.monthly_data as Array<{ month: number; revenues: number; expenses: number }>).map((item) => (
                      <TableRow key={item.month}>
                        <TableCell>شهر {item.month}</TableCell>
                        <TableCell className="text-success">{item.revenues.toLocaleString()} ر.س</TableCell>
                        <TableCell className="text-destructive">{item.expenses.toLocaleString()} ر.س</TableCell>
                        <TableCell className="font-bold">{(item.revenues - item.expenses).toLocaleString()} ر.س</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* جدول المستأجرين والعقود */}
        {disclosure.beneficiaries_details && (disclosure.beneficiaries_details as { contracts?: Array<{ tenant: string; property: string; annual_rent: number; monthly_rent: number; status: string }> })?.contracts && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                المستأجرين والعقود
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المستأجر</TableHead>
                      <TableHead>العقار</TableHead>
                      <TableHead>الإيجار الشهري</TableHead>
                      <TableHead>الإيجار السنوي</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {((disclosure.beneficiaries_details as { contracts: Array<{ tenant: string; property: string; annual_rent: number; monthly_rent: number; status: string }> }).contracts).map((contract, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{contract.tenant}</TableCell>
                        <TableCell>{contract.property}</TableCell>
                        <TableCell>{contract.monthly_rent.toLocaleString()} ر.س</TableCell>
                        <TableCell className="text-success font-bold">{contract.annual_rent.toLocaleString()} ر.س</TableCell>
                        <TableCell>
                          <Badge variant={contract.status === 'نشط' ? 'default' : 'secondary'}>
                            {contract.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

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
                    <Building className="h-4 w-4 text-info" />
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

        {/* البيان التفصيلي للشقق السكنية */}
        {disclosure.fiscal_year_id && (
          <HistoricalRentalDetailsCard 
            fiscalYearId={disclosure.fiscal_year_id} 
            fiscalYearName={`${disclosure.year - 1}-${disclosure.year}`}
          />
        )}

        {/* المستندات الداعمة للإفصاح - العرض الذكي */}
        <SmartDisclosureDocuments disclosureId={disclosure.id} />
      </div>
    </ResponsiveDialog>
  );
};
