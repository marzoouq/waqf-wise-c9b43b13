import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, RefreshCw, Wifi, ChevronLeft, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWaqfCorpus, type FiscalYearCorpus } from "@/hooks/dashboard/useFinancialCards";
import { ErrorState } from "@/components/shared/ErrorState";

interface WaqfCorpusCardProps {
  className?: string;
  compact?: boolean;
}

export function WaqfCorpusCard({ className, compact = false }: WaqfCorpusCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // جلب بيانات رقبة الوقف مع Realtime من hook
  const { data: corpusData = [], isLoading, lastUpdated, isLive, error, refetch } = useWaqfCorpus();

  // حساب إجمالي رقبة الوقف المرحلة
  const totalCorpus = corpusData.reduce((sum, item) => sum + (item.waqf_corpus || 0), 0);
  
  // آخر سنة مقفلة
  const lastClosedYear = corpusData.find(c => c.fiscal_years?.is_closed);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className={compact ? "pb-2" : ""}>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل رقبة الوقف" message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* مؤشر التحديث المباشر */}
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-500/50 to-amber-500 animate-pulse" />
      )}
      
      <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2 pt-4" : ""}`}>
        <CardTitle className={`flex items-center gap-2 ${compact ? "text-sm" : "text-base"}`}>
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Building2 className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-amber-600`} />
          </div>
          رقبة الوقف
        </CardTitle>
        
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge variant="outline" className="gap-1 text-success border-success/30 bg-success/10 animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              يتم التحديث
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Wifi className="h-3 w-3" />
              مباشر
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className={compact ? "pt-0" : ""}>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full text-right space-y-2 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="flex items-center justify-between">
                <div className={`font-bold text-amber-600 ${compact ? "text-2xl" : "text-3xl"}`}>
                  {totalCorpus.toLocaleString("ar-SA")} ر.س
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </div>
              
              {lastClosedYear && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  مرحل من: {lastClosedYear.fiscal_years?.name}
                </div>
              )}
              
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  آخر تحديث: {lastUpdated.toLocaleTimeString("ar-SA")}
                </p>
              )}
              
              {!compact && (
                <p className="text-sm text-muted-foreground mt-2">
                  إجمالي الفائض المحتجز من السنوات المالية السابقة
                </p>
              )}
            </button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-600" />
                تفاصيل رقبة الوقف حسب السنة المالية
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh]">
              {corpusData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بيانات مسجلة
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">السنة المالية</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الرصيد الافتتاحي</TableHead>
                        <TableHead className="text-right">رقبة الوقف</TableHead>
                        <TableHead className="text-right">الرصيد الختامي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {corpusData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.fiscal_years?.name || "غير محدد"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.fiscal_years?.is_closed ? "secondary" : "default"}>
                              {item.fiscal_years?.is_closed ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 ms-1" />
                                  مقفلة
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 ms-1" />
                                  نشطة
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(item.opening_balance || 0).toLocaleString("ar-SA")} ر.س
                          </TableCell>
                          <TableCell className="font-semibold text-amber-600">
                            {(item.waqf_corpus || 0).toLocaleString("ar-SA")} ر.س
                          </TableCell>
                          <TableCell>
                            {(item.closing_balance || 0).toLocaleString("ar-SA")} ر.س
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* الإجمالي */}
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">إجمالي رقبة الوقف المرحلة</span>
                      <span className="text-xl font-bold text-amber-600">
                        {totalCorpus.toLocaleString("ar-SA")} ر.س
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      هذا المبلغ يمثل الفائض المحتجز من غلة الوقف للحفاظ على أصل الوقف وتنميته
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}