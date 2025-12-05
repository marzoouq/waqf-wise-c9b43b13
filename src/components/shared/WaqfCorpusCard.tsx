import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, RefreshCw, Wifi, ChevronLeft, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { productionLogger } from "@/lib/logger/production-logger";

interface WaqfCorpusCardProps {
  className?: string;
  compact?: boolean;
}

interface FiscalYearCorpus {
  id: string;
  fiscal_year_id: string;
  waqf_corpus: number;
  opening_balance: number;
  closing_balance: number;
  created_at: string;
  fiscal_years: {
    name: string;
    start_date: string;
    end_date: string;
    is_closed: boolean;
  };
}

export function WaqfCorpusCard({ className, compact = false }: WaqfCorpusCardProps) {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // جلب بيانات رقبة الوقف من جميع السنوات المالية المقفلة
  const { data: corpusData = [], isLoading } = useQuery({
    queryKey: ["waqf-corpus-realtime"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_year_closings")
        .select(`
          id,
          fiscal_year_id,
          waqf_corpus,
          opening_balance,
          closing_balance,
          created_at,
          fiscal_years!inner (
            name,
            start_date,
            end_date,
            is_closed
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        productionLogger.error("Error fetching waqf corpus", { error });
        throw error;
      }
      return (data || []) as FiscalYearCorpus[];
    },
  });

  // الاشتراك في التحديثات المباشرة
  useEffect(() => {
    const channel = supabase
      .channel("waqf-corpus-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fiscal_year_closings",
        },
        (payload) => {
          productionLogger.info("Waqf corpus updated", { payload });
          setLastUpdated(new Date());
          setIsLive(true);
          queryClient.invalidateQueries({ queryKey: ["waqf-corpus-realtime"] });
          
          // إخفاء مؤشر التحديث بعد 3 ثواني
          setTimeout(() => setIsLive(false), 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
                                  <CheckCircle2 className="h-3 w-3 ml-1" />
                                  مقفلة
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 ml-1" />
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