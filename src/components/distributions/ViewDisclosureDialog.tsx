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
      <DialogContent className="w-[95vw] max-w-6xl max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-3 sm:p-6 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                الإفصاح السنوي {disclosure.year - 1}-{disclosure.year}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{disclosure.waqf_name}</p>
            </div>
            <Badge variant="outline" className="text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2 w-fit">
              {disclosure.status === 'published' ? 'منشور' : 'مسودة'}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(95vh-80px)] sm:h-[calc(90vh-100px)]">
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            
            {/* ============================================ */}
            {/* القسم 1: الكشف المالي المتسلسل (الأهم) */}
            {/* ============================================ */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="pb-2 sm:pb-4 p-3 sm:p-6">
                <CardTitle className="text-base sm:text-xl flex items-center gap-2">
                  <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  الكشف المالي المتسلسل
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  رحلة الأموال من الإيرادات إلى المتبقي (رقبة الوقف)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
                
                {/* 1. إجمالي الإيرادات */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-full">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-lg">إجمالي الإيرادات</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">جميع مصادر الدخل للسنة المالية</p>
                    </div>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-emerald-600 text-left sm:text-right">{formatCurrency(totalRevenues)}</p>
                </div>

                {/* سهم للأسفل */}
                <div className="flex justify-center">
                  <ArrowDown className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* 2. إجمالي المصروفات (خصم) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-red-500/10 rounded-lg border border-red-500/20 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-red-500/20 rounded-full">
                      <MinusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-lg">(-) إجمالي المصروفات</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">صيانة + إدارية + أخرى ({expenseItems.length || 4} بند)</p>
                    </div>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-red-600 text-left sm:text-right">({formatCurrency(totalExpenses)})</p>
                </div>

                {/* سهم للأسفل */}
                <div className="flex justify-center">
                  <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>

                {/* 3. صافي الدخل بعد المصروفات */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-full">
                      <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-lg">= صافي الدخل التشغيلي</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">الإيرادات - المصروفات</p>
                    </div>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600 text-left sm:text-right">{formatCurrency(netAfterExpenses)}</p>
                </div>

                <Separator className="my-4" />

                {/* 4. الاستقطاعات النظامية */}
                <div className="space-y-2 sm:space-y-3">
                  <p className="font-semibold text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                    <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
                    الاستقطاعات النظامية:
                  </p>
                  
                  {/* ضريبة القيمة المضافة */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 mr-0 sm:mr-6 gap-1">
                    <div className="flex items-center gap-2">
                      <MinusCircle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                      <span className="text-xs sm:text-sm">(-) ضريبة القيمة المضافة (15%)</span>
                    </div>
                    <p className="font-bold text-sm sm:text-base text-orange-600">({formatCurrency(vatAmount)})</p>
                  </div>

                  {/* حصة الناظر */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 mr-0 sm:mr-6 gap-1">
                    <div className="flex items-center gap-2">
                      <MinusCircle className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                      <span className="text-xs sm:text-sm">(-) حصة الناظر ({disclosure.nazer_percentage}%)</span>
                    </div>
                    <p className="font-bold text-sm sm:text-base text-purple-600">({formatCurrency(nazerShare)})</p>
                  </div>

                  {/* صدقة الواقف */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-pink-500/10 rounded-lg border border-pink-500/20 mr-0 sm:mr-6 gap-1">
                    <div className="flex items-center gap-2">
                      <MinusCircle className="h-3 w-3 sm:h-4 sm:w-4 text-pink-600" />
                      <span className="text-xs sm:text-sm">(-) صدقة الواقف ({disclosure.charity_percentage}%)</span>
                    </div>
                    <p className="font-bold text-sm sm:text-base text-pink-600">({formatCurrency(charityShare)})</p>
                  </div>

                  {/* إجمالي الاستقطاعات */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-muted rounded-lg mr-0 sm:mr-6 border gap-1">
                    <span className="font-semibold text-xs sm:text-sm">إجمالي الاستقطاعات</span>
                    <p className="font-bold text-sm sm:text-base">({formatCurrency(totalDeductions)})</p>
                  </div>
                </div>

                {/* سهم للأسفل */}
                <div className="flex justify-center">
                  <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>

                {/* 5. المتاح للتوزيع */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-cyan-500/20 rounded-full">
                      <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-lg">= المتاح للتوزيع على الورثة</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">صافي الدخل - الاستقطاعات</p>
                    </div>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-cyan-600 text-left sm:text-right">{formatCurrency(availableForDistribution)}</p>
                </div>

                {/* سهم للأسفل */}
                <div className="flex justify-center">
                  <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>

                {/* 6. توزيعات الورثة */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-amber-500/20 rounded-full">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-lg">(-) توزيعات الورثة</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {distributions?.heirs_count || disclosure.total_beneficiaries} وريث (وفق الشريعة الإسلامية)
                      </p>
                    </div>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-amber-600 text-left sm:text-right">({formatCurrency(distributedAmount)})</p>
                </div>

                {/* سهم للأسفل */}
                <div className="flex justify-center">
                  <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>

                {/* 7. المتبقي (رقبة الوقف) - النتيجة النهائية */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-5 bg-primary/10 rounded-lg border-2 border-primary gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-primary/20 rounded-full">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-base sm:text-xl">= المتبقي (رقبة الوقف)</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">يُرحّل للسنة المالية القادمة</p>
                    </div>
                  </div>
                  <p className="text-xl sm:text-3xl font-bold text-primary text-left sm:text-right">{formatCurrency(corpusShare)}</p>
                </div>
              </CardContent>
            </Card>

            {/* ============================================ */}
            {/* القسم 2: تفصيل الإيرادات */}
            {/* ============================================ */}
            {revenueItems.length > 0 && (
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                    تفصيل الإيرادات
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">جميع مصادر الدخل للسنة المالية</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right text-xs sm:text-sm">مصدر الإيراد</TableHead>
                          <TableHead className="text-left text-xs sm:text-sm">المبلغ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revenueItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium text-xs sm:text-sm">{item.name}</TableCell>
                            <TableCell className="text-emerald-600 font-semibold text-xs sm:text-sm">
                              {formatCurrency(item.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow className="bg-emerald-500/10">
                          <TableCell className="font-bold text-xs sm:text-sm">الإجمالي</TableCell>
                          <TableCell className="font-bold text-emerald-600 text-xs sm:text-sm">
                            {formatCurrency(totalRevenues)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ============================================ */}
            {/* القسم 3: تفصيل المصروفات */}
            {/* ============================================ */}
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  تفصيل المصروفات ({expenseItems.length || 4} بند)
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">جميع بنود المصروفات للسنة المالية</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {expenseItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right w-8 sm:w-12 text-xs sm:text-sm">#</TableHead>
                          <TableHead className="text-right text-xs sm:text-sm">بند المصروف</TableHead>
                          <TableHead className="text-left text-xs sm:text-sm">المبلغ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenseItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-muted-foreground text-xs sm:text-sm">{index + 1}</TableCell>
                            <TableCell className="font-medium text-xs sm:text-sm">{item.name}</TableCell>
                            <TableCell className="text-red-600 font-semibold text-xs sm:text-sm">
                              {formatCurrency(item.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow className="bg-red-500/10">
                          <TableCell></TableCell>
                          <TableCell className="font-bold text-xs sm:text-sm">إجمالي المصروفات</TableCell>
                          <TableCell className="font-bold text-red-600 text-xs sm:text-sm">
                            {formatCurrency(totalExpenses)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                      <span>مصروفات الصيانة</span>
                      <span className="font-semibold text-red-600">{formatCurrency(disclosure.maintenance_expenses)}</span>
                    </div>
                    <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                      <span>مصروفات إدارية</span>
                      <span className="font-semibold text-red-600">{formatCurrency(disclosure.administrative_expenses)}</span>
                    </div>
                    <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                      <span>مصروفات تطوير</span>
                      <span className="font-semibold text-red-600">{formatCurrency(disclosure.development_expenses)}</span>
                    </div>
                    <div className="flex justify-between p-2 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm">
                      <span>مصروفات أخرى</span>
                      <span className="font-semibold text-red-600">{formatCurrency(disclosure.other_expenses)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between p-2 sm:p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-xs sm:text-sm">
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
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                  توزيعات الورثة (وفق الشريعة الإسلامية)
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  للذكر مثل حظ الأنثيين - الزوجات لهن الثمن
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  {/* إجمالي التوزيعات */}
                  <Card className="bg-amber-500/10 border-amber-500/20 col-span-2 md:col-span-1">
                    <CardContent className="p-2 sm:p-4 text-center">
                      <Coins className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-amber-600" />
                      <p className="text-xs sm:text-sm text-muted-foreground">إجمالي الموزع</p>
                      <p className="text-sm sm:text-xl font-bold text-amber-600">{formatCurrency(distributedAmount)}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {distributions?.heirs_count || disclosure.total_beneficiaries} وريث
                      </p>
                    </CardContent>
                  </Card>

                  {/* حصة الأبناء */}
                  <Card className="bg-heir-son/10 border-heir-son/20">
                    <CardContent className="p-2 sm:p-4 text-center">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-heir-son" />
                      <p className="text-xs sm:text-sm text-muted-foreground">حصة الأبناء</p>
                      <p className="text-sm sm:text-xl font-bold text-heir-son">
                        {formatCurrency(distributions?.sons_share || 512132.35)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {distributions?.sons_count || disclosure.sons_count} أبناء
                      </p>
                    </CardContent>
                  </Card>

                  {/* حصة البنات */}
                  <Card className="bg-heir-daughter/10 border-heir-daughter/20">
                    <CardContent className="p-2 sm:p-4 text-center">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-heir-daughter" />
                      <p className="text-xs sm:text-sm text-muted-foreground">حصة البنات</p>
                      <p className="text-sm sm:text-xl font-bold text-heir-daughter">
                        {formatCurrency(distributions?.daughters_share || 358492.65)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {distributions?.daughters_count || disclosure.daughters_count} بنات
                      </p>
                    </CardContent>
                  </Card>

                  {/* حصة الزوجات */}
                  <Card className="bg-heir-wife/10 border-heir-wife/20">
                    <CardContent className="p-2 sm:p-4 text-center">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-heir-wife" />
                      <p className="text-xs sm:text-sm text-muted-foreground">حصة الزوجات</p>
                      <p className="text-sm sm:text-xl font-bold text-heir-wife">
                        {formatCurrency(distributions?.wives_share || 124375)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
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
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  ملخص النسب والحصص
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                  <div className="text-center p-2 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground">حصة الناظر</p>
                    <p className="text-lg sm:text-2xl font-bold">{disclosure.nazer_percentage}%</p>
                    <p className="text-xs sm:text-sm text-purple-600">{formatCurrency(nazerShare)}</p>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground">صدقة الواقف</p>
                    <p className="text-lg sm:text-2xl font-bold">{disclosure.charity_percentage}%</p>
                    <p className="text-xs sm:text-sm text-pink-600">{formatCurrency(charityShare)}</p>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground">رقبة الوقف</p>
                    <p className="text-lg sm:text-2xl font-bold">{disclosure.corpus_percentage}%</p>
                    <p className="text-xs sm:text-sm text-primary">{formatCurrency(corpusShare)}</p>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground">ضريبة القيمة المضافة</p>
                    <p className="text-lg sm:text-2xl font-bold">15%</p>
                    <p className="text-xs sm:text-sm text-orange-600">{formatCurrency(vatAmount)}</p>
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
