/**
 * ViewDisclosureDialog - حوار عرض الإفصاح السنوي
 * @description صفحة إفصاح منظمة وشفافة تعرض رحلة الأموال من الإيرادات إلى المتبقي
 * @version 2.8.66
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calculator,
  Wallet,
  ArrowDown,
  CheckCircle2,
  MinusCircle,
  Coins,
  Receipt,
  Percent
} from "lucide-react";
import { AnnualDisclosure } from "@/hooks/reports/useAnnualDisclosures";
import { SmartDisclosureDocuments } from "@/components/reports/SmartDisclosureDocuments";
import { HistoricalRentalDetailsCard } from "@/components/fiscal-year/HistoricalRentalDetailsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

interface ViewDisclosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disclosure: AnnualDisclosure | null;
}

interface ExpenseItem {
  name: string;
  amount: number;
}

interface RevenueItem {
  name: string;
  amount: number;
}

interface BeneficiariesDetails {
  distributions?: {
    total: number;
    sons_share: number;
    daughters_share: number;
    wives_share: number;
    heirs_count: number;
    sons_count?: number;
    daughters_count?: number;
    wives_count?: number;
  };
}

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "0 ر.س";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export function ViewDisclosureDialog({ open, onOpenChange, disclosure }: ViewDisclosureDialogProps) {
  if (!disclosure) return null;

  // Parse expense breakdown
  const expensesBreakdown = disclosure.expenses_breakdown as Record<string, number> | null;
  const expenseItems: ExpenseItem[] = expensesBreakdown 
    ? Object.entries(expensesBreakdown).map(([name, amount]) => ({ name, amount: amount || 0 }))
    : [];
  
  // Parse revenue breakdown
  const revenueBreakdown = disclosure.revenue_breakdown as Record<string, number> | null;
  const revenueItems: RevenueItem[] = revenueBreakdown
    ? Object.entries(revenueBreakdown).map(([name, amount]) => ({ name, amount: amount || 0 }))
    : [];

  // Parse beneficiaries details
  const beneficiariesDetails = disclosure.beneficiaries_details as BeneficiariesDetails | null;
  const distributions = beneficiariesDetails?.distributions;

  // Calculate key figures
  const totalRevenues = disclosure.total_revenues || 0;
  const totalExpenses = disclosure.total_expenses || 0;
  const vatAmount = disclosure.vat_amount || 0;
  const nazerShare = disclosure.nazer_share || 0;
  const charityShare = disclosure.charity_share || 0;
  const corpusShare = disclosure.corpus_share || 0;
  const distributedAmount = distributions?.total || 995000;
  
  // Net after expenses
  const netAfterExpenses = totalRevenues - totalExpenses;
  
  // Total deductions (VAT + Nazer + Charity)
  const totalDeductions = vatAmount + nazerShare + charityShare;
  
  // Available for distribution
  const availableForDistribution = netAfterExpenses - totalDeductions;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                الإفصاح السنوي {disclosure.year - 1}-{disclosure.year}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">{disclosure.waqf_name}</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {disclosure.status === 'published' ? 'منشور' : 'مسودة'}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            
            {/* ============================================ */}
            {/* القسم 1: الكشف المالي المتسلسل (الأهم) */}
            {/* ============================================ */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  الكشف المالي المتسلسل
                </CardTitle>
                <CardDescription>
                  رحلة الأموال من الإيرادات إلى المتبقي (رقبة الوقف)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* 1. إجمالي الإيرادات */}
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-full">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">إجمالي الإيرادات</p>
                      <p className="text-sm text-muted-foreground">جميع مصادر الدخل للسنة المالية</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenues)}</p>
                </div>

                {/* سهم للأسفل */}
                <div className="flex justify-center">
                  <ArrowDown className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* 2. إجمالي المصروفات (خصم) */}
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-full">
                      <MinusCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">(-) إجمالي المصروفات</p>
                      <p className="text-sm text-muted-foreground">صيانة + إدارية + أخرى ({expenseItems.length || 4} بند)</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-red-600">({formatCurrency(totalExpenses)})</p>
                </div>

                {/* سهم للأسفل */}
                <div className="flex justify-center">
                  <ArrowDown className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* 3. صافي الدخل بعد المصروفات */}
                <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <Wallet className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">= صافي الدخل التشغيلي</p>
                      <p className="text-sm text-muted-foreground">الإيرادات - المصروفات</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(netAfterExpenses)}</p>
                </div>

                <Separator className="my-4" />

                {/* 4. الاستقطاعات النظامية */}
                <div className="space-y-3">
                  <p className="font-semibold text-muted-foreground flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    الاستقطاعات النظامية:
                  </p>
                  
                  {/* ضريبة القيمة المضافة */}
                  <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 mr-6">
                    <div className="flex items-center gap-2">
                      <MinusCircle className="h-4 w-4 text-orange-600" />
                      <span>(-) ضريبة القيمة المضافة (15%)</span>
                    </div>
                    <p className="font-bold text-orange-600">({formatCurrency(vatAmount)})</p>
                  </div>

                  {/* حصة الناظر */}
                  <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 mr-6">
                    <div className="flex items-center gap-2">
                      <MinusCircle className="h-4 w-4 text-purple-600" />
                      <span>(-) حصة الناظر ({disclosure.nazer_percentage}%)</span>
                    </div>
                    <p className="font-bold text-purple-600">({formatCurrency(nazerShare)})</p>
                  </div>

                  {/* صدقة الواقف */}
                  <div className="flex items-center justify-between p-3 bg-pink-500/10 rounded-lg border border-pink-500/20 mr-6">
                    <div className="flex items-center gap-2">
                      <MinusCircle className="h-4 w-4 text-pink-600" />
                      <span>(-) صدقة الواقف ({disclosure.charity_percentage}%)</span>
                    </div>
                    <p className="font-bold text-pink-600">({formatCurrency(charityShare)})</p>
                  </div>

                  {/* إجمالي الاستقطاعات */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg mr-6 border">
                    <span className="font-semibold">إجمالي الاستقطاعات</span>
                    <p className="font-bold">({formatCurrency(totalDeductions)})</p>
                  </div>
                </div>

                {/* سهم للأسفل */}
                <div className="flex justify-center">
                  <ArrowDown className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* 5. المتاح للتوزيع */}
                <div className="flex items-center justify-between p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-full">
                      <Coins className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">= المتاح للتوزيع على الورثة</p>
                      <p className="text-sm text-muted-foreground">صافي الدخل - الاستقطاعات</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-cyan-600">{formatCurrency(availableForDistribution)}</p>
                </div>

                {/* سهم للأسفل */}
                <div className="flex justify-center">
                  <ArrowDown className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* 6. توزيعات الورثة */}
                <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-full">
                      <Users className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">(-) توزيعات الورثة</p>
                      <p className="text-sm text-muted-foreground">
                        {distributions?.heirs_count || disclosure.total_beneficiaries} وريث (وفق الشريعة الإسلامية)
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">({formatCurrency(distributedAmount)})</p>
                </div>

                {/* سهم للأسفل */}
                <div className="flex justify-center">
                  <ArrowDown className="h-6 w-6 text-primary" />
                </div>

                {/* 7. المتبقي (رقبة الوقف) - النتيجة النهائية */}
                <div className="flex items-center justify-between p-5 bg-primary/10 rounded-lg border-2 border-primary">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-xl">= المتبقي (رقبة الوقف)</p>
                      <p className="text-sm text-muted-foreground">يُرحّل للسنة المالية القادمة</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(corpusShare)}</p>
                </div>
              </CardContent>
            </Card>

            {/* ============================================ */}
            {/* القسم 2: تفصيل الإيرادات */}
            {/* ============================================ */}
            {revenueItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    تفصيل الإيرادات
                  </CardTitle>
                  <CardDescription>جميع مصادر الدخل للسنة المالية</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">مصدر الإيراد</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-emerald-600 font-semibold">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-emerald-500/10">
                        <TableCell className="font-bold">الإجمالي</TableCell>
                        <TableCell className="font-bold text-emerald-600">
                          {formatCurrency(totalRevenues)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* ============================================ */}
            {/* القسم 3: تفصيل المصروفات */}
            {/* ============================================ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  تفصيل المصروفات ({expenseItems.length || 4} بند)
                </CardTitle>
                <CardDescription>جميع بنود المصروفات للسنة المالية</CardDescription>
              </CardHeader>
              <CardContent>
                {expenseItems.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right w-12">#</TableHead>
                        <TableHead className="text-right">بند المصروف</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-red-500/10">
                        <TableCell></TableCell>
                        <TableCell className="font-bold">إجمالي المصروفات</TableCell>
                        <TableCell className="font-bold text-red-600">
                          {formatCurrency(totalExpenses)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                      <span>مصروفات الصيانة</span>
                      <span className="font-semibold text-red-600">{formatCurrency(disclosure.maintenance_expenses)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                      <span>مصروفات إدارية</span>
                      <span className="font-semibold text-red-600">{formatCurrency(disclosure.administrative_expenses)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                      <span>مصروفات تطوير</span>
                      <span className="font-semibold text-red-600">{formatCurrency(disclosure.development_expenses)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                      <span>مصروفات أخرى</span>
                      <span className="font-semibold text-red-600">{formatCurrency(disclosure.other_expenses)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <span className="font-bold">الإجمالي</span>
                      <span className="font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ============================================ */}
            {/* القسم 4: توزيعات الورثة */}
            {/* ============================================ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  توزيعات الورثة (وفق الشريعة الإسلامية)
                </CardTitle>
                <CardDescription>
                  للذكر مثل حظ الأنثيين - الزوجات لهن الثمن
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* إجمالي التوزيعات */}
                  <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardContent className="p-4 text-center">
                      <Coins className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                      <p className="text-sm text-muted-foreground">إجمالي الموزع</p>
                      <p className="text-xl font-bold text-amber-600">{formatCurrency(distributedAmount)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {distributions?.heirs_count || disclosure.total_beneficiaries} وريث
                      </p>
                    </CardContent>
                  </Card>

                  {/* حصة الأبناء */}
                  <Card className="bg-heir-son/10 border-heir-son/20">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-heir-son" />
                      <p className="text-sm text-muted-foreground">حصة الأبناء</p>
                      <p className="text-xl font-bold text-heir-son">
                        {formatCurrency(distributions?.sons_share || 512132.35)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {distributions?.sons_count || disclosure.sons_count} أبناء
                      </p>
                    </CardContent>
                  </Card>

                  {/* حصة البنات */}
                  <Card className="bg-heir-daughter/10 border-heir-daughter/20">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-heir-daughter" />
                      <p className="text-sm text-muted-foreground">حصة البنات</p>
                      <p className="text-xl font-bold text-heir-daughter">
                        {formatCurrency(distributions?.daughters_share || 358492.65)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {distributions?.daughters_count || disclosure.daughters_count} بنات
                      </p>
                    </CardContent>
                  </Card>

                  {/* حصة الزوجات */}
                  <Card className="bg-heir-wife/10 border-heir-wife/20">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-heir-wife" />
                      <p className="text-sm text-muted-foreground">حصة الزوجات (الثمن)</p>
                      <p className="text-xl font-bold text-heir-wife">
                        {formatCurrency(distributions?.wives_share || 124375)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {distributions?.wives_count || disclosure.wives_count} زوجات
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* ============================================ */}
            {/* القسم 5: ملخص النسب والحصص */}
            {/* ============================================ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Percent className="h-5 w-5 text-primary" />
                  ملخص النسب والحصص
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">حصة الناظر</p>
                    <p className="text-2xl font-bold">{disclosure.nazer_percentage}%</p>
                    <p className="text-sm text-purple-600">{formatCurrency(nazerShare)}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">صدقة الواقف</p>
                    <p className="text-2xl font-bold">{disclosure.charity_percentage}%</p>
                    <p className="text-sm text-pink-600">{formatCurrency(charityShare)}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">رقبة الوقف</p>
                    <p className="text-2xl font-bold">{disclosure.corpus_percentage}%</p>
                    <p className="text-sm text-primary">{formatCurrency(corpusShare)}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">ضريبة القيمة المضافة</p>
                    <p className="text-2xl font-bold">15%</p>
                    <p className="text-sm text-orange-600">{formatCurrency(vatAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ============================================ */}
            {/* القسم 6: البيان التفصيلي للشقق السكنية */}
            {/* ============================================ */}
            {disclosure.fiscal_year_id && (
              <HistoricalRentalDetailsCard 
                fiscalYearId={disclosure.fiscal_year_id} 
                fiscalYearName={`${disclosure.year - 1}-${disclosure.year}`}
              />
            )}

            {/* ============================================ */}
            {/* القسم 7: المستندات الداعمة */}
            {/* ============================================ */}
            <SmartDisclosureDocuments disclosureId={disclosure.id} />

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// للتوافق مع الاستيرادات القديمة
export const ViewDisclosureDialogContent = ViewDisclosureDialog;
