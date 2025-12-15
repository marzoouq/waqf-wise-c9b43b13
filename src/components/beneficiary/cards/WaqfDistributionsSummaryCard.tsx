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
import type { HeirDistribution } from "@/types/distributions";

interface WaqfDistributionsSummaryCardProps {
  beneficiaryId: string;
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

  // الحصول على تاريخ آخر توزيع
  const latestDate = distributions[0]?.distribution_date;

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
      <Card className="h-full">
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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20 h-full cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                إجمالي المحصل
              </CardTitle>
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            {/* الإجمالي الرئيسي */}
            <div className="text-2xl sm:text-3xl font-bold text-primary tabular-nums mb-3">
              {allYearsTotal.toLocaleString("ar-SA")}
              <span className="text-sm sm:text-base font-normal text-muted-foreground me-1"> ر.س</span>
            </div>
            
            {/* تفاصيل مختصرة */}
            <div className="flex flex-wrap gap-2 text-xs">
              {currentYearAmount > 0 && (
                <Badge variant="outline" className="bg-[hsl(var(--status-success)/0.1)] text-[hsl(var(--status-success))] border-[hsl(var(--status-success)/0.3)]">
                  <CircleDot className="h-3 w-3 ms-1" />
                  الحالية: {currentYearAmount.toLocaleString("ar-SA")}
                </Badge>
              )}
              {historicalAmount > 0 && (
                <Badge variant="secondary">
                  <Archive className="h-3 w-3 ms-1" />
                  السابقة: {historicalAmount.toLocaleString("ar-SA")}
                </Badge>
              )}
            </div>

            {latestDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Calendar className="h-3 w-3" />
                آخر توزيع: {formatDate(latestDate, "dd/MM/yyyy")}
              </div>
            )}
          </CardContent>
        </Card>
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
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {year.isClosed ? (
                          <Archive className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <CircleDot className="h-4 w-4 text-[hsl(var(--status-success))]" />
                        )}
                        <span className="font-semibold">{year.yearName}</span>
                        <Badge variant={year.isClosed ? "secondary" : "default"} className="text-xs">
                          {year.isClosed ? "مؤرشفة" : "نشطة"}
                        </Badge>
                      </div>
                      <span className={`font-bold ${year.isClosed ? 'text-muted-foreground' : 'text-[hsl(var(--status-success))]'}`}>
                        {year.total.toLocaleString("ar-SA")} ر.س
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">نوع الوريث</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
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
                            <TableCell className="text-sm">
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
                  <span className="font-semibold">الإجمالي الكلي</span>
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
  );
}
