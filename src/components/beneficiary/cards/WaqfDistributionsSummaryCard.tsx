import { useState } from "react";
import { useWaqfDistributionsSummary } from "@/hooks/beneficiary/useBeneficiaryProfileData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wallet, TrendingUp, Calendar, ChevronLeft, CheckCircle2, Clock, Loader2, Archive, CircleDot } from "lucide-react";
import { formatDate } from "@/lib/date";
import { ErrorState } from "@/components/shared/ErrorState";

interface WaqfDistributionsSummaryCardProps {
  beneficiaryId: string;
}

interface HeirDistribution {
  id: string;
  share_amount: number;
  heir_type: string;
  distribution_date: string;
  fiscal_year_id: string;
  fiscal_years: {
    name: string;
    start_date: string;
    end_date: string;
    is_closed: boolean;
    is_active: boolean;
  } | null;
}

export function WaqfDistributionsSummaryCard({ beneficiaryId }: WaqfDistributionsSummaryCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: distributions = [], isLoading, error, refetch } = useWaqfDistributionsSummary(beneficiaryId);

  // فصل التوزيعات الحالية عن التاريخية
  const currentYearDistributions = distributions.filter(d => !d.fiscal_years?.is_closed);
  const historicalDistributions = distributions.filter(d => d.fiscal_years?.is_closed);

  const currentYearAmount = currentYearDistributions.reduce((sum, d) => sum + (d.share_amount || 0), 0);
  const historicalAmount = historicalDistributions.reduce((sum, d) => sum + (d.share_amount || 0), 0);
  const allYearsTotal = currentYearAmount + historicalAmount;

  // الحصول على تاريخ آخر توزيع لكل فئة
  const latestCurrentDate = currentYearDistributions[0]?.distribution_date;
  const latestHistoricalDate = historicalDistributions[0]?.distribution_date;

  // تجميع التوزيعات حسب السنة المالية
  const distributionsByYear = distributions.reduce((acc, dist) => {
    const yearName = dist.fiscal_years?.name || "غير محدد";
    if (!acc[yearName]) {
      acc[yearName] = {
        yearName,
        isClosed: dist.fiscal_years?.is_closed || false,
        isActive: dist.fiscal_years?.is_active || false,
        distributions: [],
        total: 0,
        latestDate: dist.distribution_date,
      };
    }
    acc[yearName].distributions.push(dist);
    acc[yearName].total += dist.share_amount || 0;
    return acc;
  }, {} as Record<string, { yearName: string; isClosed: boolean; isActive: boolean; distributions: HeirDistribution[]; total: number; latestDate: string }>);

  const yearsData = Object.values(distributionsByYear).sort((a, b) => 
    b.yearName.localeCompare(a.yearName)
  );

  const getHeirTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "son": "ابن",
      "daughter": "بنت",
      "wife": "زوجة",
      "husband": "زوج",
      "father": "أب",
      "mother": "أم",
      "brother": "أخ",
      "sister": "أخت",
      "ابن": "ابن",
      "بنت": "بنت",
      "زوجة": "زوجة",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل التوزيعات" message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          إجمالي المحصل من الوقف
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* السنة الحالية */}
          <div className="p-4 rounded-lg bg-[hsl(var(--status-success)/0.1)] border border-[hsl(var(--status-success)/0.3)] space-y-2">
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--status-success))]">
              <CircleDot className="h-4 w-4" />
              السنة الحالية 2025-2026
            </div>
            <div className="text-2xl font-bold text-[hsl(var(--status-success))]">
              {currentYearAmount > 0 ? (
                <>{currentYearAmount.toLocaleString("ar-SA")} ر.س</>
              ) : (
                <span className="text-muted-foreground text-lg">لم يتم التوزيع بعد</span>
              )}
            </div>
            {latestCurrentDate && (
              <div className="flex items-center gap-1 text-xs text-[hsl(var(--status-success))]">
                <Calendar className="h-3 w-3" />
                {formatDate(latestCurrentDate, "dd/MM/yyyy")}
              </div>
            )}
            {currentYearAmount > 0 && (
              <Badge variant="outline" className="bg-[hsl(var(--status-success)/0.1)] text-[hsl(var(--status-success))] border-[hsl(var(--status-success)/0.3)]">
                <CheckCircle2 className="h-3 w-3 ml-1" />
                تم الصرف
              </Badge>
            )}
          </div>

          {/* السنوات السابقة (مؤرشفة) */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Archive className="h-4 w-4" />
              السنوات السابقة (مؤرشفة)
            </div>
            <div className="text-2xl font-bold text-muted-foreground">
              {historicalAmount > 0 ? (
                <>{historicalAmount.toLocaleString("ar-SA")} ر.س</>
              ) : (
                <span className="text-muted-foreground text-lg">—</span>
              )}
            </div>
            {latestHistoricalDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(latestHistoricalDate, "dd/MM/yyyy")}
              </div>
            )}
            {historicalAmount > 0 && (
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                <Archive className="h-3 w-3 ml-1" />
                مؤرشف
              </Badge>
            )}
          </div>

          {/* إجمالي جميع السنوات */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2 text-right hover:bg-primary/15 transition-colors cursor-pointer w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    الإجمالي الكلي
                  </div>
                  <ChevronLeft className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {allYearsTotal.toLocaleString("ar-SA")} ر.س
                </div>
                <div className="text-xs text-muted-foreground">
                  اضغط لعرض التفاصيل
                </div>
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  تفاصيل التوزيعات حسب السنة المالية
                </DialogTitle>
              </DialogHeader>
              
              <ScrollArea className="max-h-[60vh]">
                {yearsData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد توزيعات مسجلة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {yearsData.map((year) => (
                      <Card 
                        key={year.yearName} 
                        className={`overflow-hidden ${
                          year.isClosed 
                            ? 'border-border bg-muted/30' 
                            : 'border-[hsl(var(--status-success)/0.3)] bg-[hsl(var(--status-success)/0.05)]'
                        }`}
                      >
                        <CardHeader className={`py-3 ${
                          year.isClosed 
                            ? 'bg-muted/50' 
                            : 'bg-[hsl(var(--status-success)/0.1)]'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {year.isClosed ? (
                                <Archive className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <CircleDot className="h-4 w-4 text-[hsl(var(--status-success))]" />
                              )}
                              <span className="font-semibold">{year.yearName}</span>
                              <Badge variant={year.isClosed ? "secondary" : "default"}>
                                {year.isClosed ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 ml-1" />
                                    مقفلة ومؤرشفة
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3 ml-1" />
                                    نشطة
                                  </>
                                )}
                              </Badge>
                            </div>
                            <span className={`font-bold ${year.isClosed ? 'text-muted-foreground' : 'text-[hsl(var(--status-success))]'}`}>
                              {year.total.toLocaleString("ar-SA")} ر.س
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            تاريخ التوزيع: {formatDate(year.latestDate, "dd/MM/yyyy")}
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-right">نوع الوريث</TableHead>
                                <TableHead className="text-right">تاريخ التوزيع</TableHead>
                                <TableHead className="text-right">المبلغ</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {year.distributions.map((dist) => (
                                <TableRow key={dist.id}>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {getHeirTypeLabel(dist.heir_type)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(dist.distribution_date, "dd/MM/yyyy")}
                                  </TableCell>
                                  <TableCell className="font-semibold">
                                    {dist.share_amount?.toLocaleString("ar-SA")} ر.س
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}

                    {/* الإجمالي الكلي */}
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">الإجمالي الكلي لجميع السنوات</span>
                        <span className="text-xl font-bold text-primary">
                          {allYearsTotal.toLocaleString("ar-SA")} ر.س
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        {distributions.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            عدد التوزيعات المسجلة: {distributions.length} توزيع عبر {yearsData.length} سنة مالية
          </p>
        )}
      </CardContent>
    </Card>
  );
}
