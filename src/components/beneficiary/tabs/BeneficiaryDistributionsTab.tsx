import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock, Wallet, Calendar, Archive, CircleDot, TrendingUp } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useBeneficiaryDistributions } from "@/hooks/beneficiary/useBeneficiaryDistributions";

interface BeneficiaryDistributionsTabProps {
  beneficiaryId: string;
}

export function BeneficiaryDistributionsTab({ beneficiaryId }: BeneficiaryDistributionsTabProps) {
  const { settings } = useVisibilitySettings();
  const isMobile = useIsMobile();
  const masked = settings?.mask_exact_amounts || false;
  
  const {
    distributions,
    currentDistributions,
    historicalDistributions,
    currentTotal,
    historicalTotal,
    totalDistributed,
    isLoading,
  } = useBeneficiaryDistributions(beneficiaryId);

  const getHeirTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "son": "ابن",
      "daughter": "بنت",
      "wife": "زوجة",
      "husband": "زوج",
      "father": "أب",
      "mother": "أم",
      "ابن": "ابن",
      "بنت": "بنت",
      "زوجة": "زوجة",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (isClosed: boolean) => {
    return isClosed ? (
      <Badge variant="secondary" className="gap-1 bg-muted text-muted-foreground">
        <Archive className="h-3 w-3" />
        مؤرشف
      </Badge>
    ) : (
      <Badge variant="default" className="gap-1 bg-success-light text-success border-success/30">
        <CircleDot className="h-3 w-3" />
        حالي
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* ملخص التوزيعات */}
      {distributions.length > 0 && (
        <Card className="border-dashed">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              ملخص التوزيعات
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-success-light border border-success/20">
                <div className="flex items-center justify-center gap-1 text-xs text-success mb-1">
                  <CircleDot className="h-3 w-3" />
                  السنة الحالية
                </div>
                <p className="font-bold text-success">
                  {masked ? (
                    <MaskedValue value={String(currentTotal)} type="amount" masked={true} />
                  ) : (
                    <>{currentTotal.toLocaleString("ar-SA")} ر.س</>
                  )}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Archive className="h-3 w-3" />
                  السنوات السابقة
                </div>
                <p className="font-bold text-muted-foreground">
                  {masked ? (
                    <MaskedValue value={String(historicalTotal)} type="amount" masked={true} />
                  ) : (
                    <>{historicalTotal.toLocaleString("ar-SA")} ر.س</>
                  )}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Wallet className="h-3 w-3" />
                  الإجمالي
                </div>
                <p className="font-bold text-primary">
                  {masked ? (
                    <MaskedValue value={String(totalDistributed)} type="amount" masked={true} />
                  ) : (
                    <>{totalDistributed.toLocaleString("ar-SA")} ر.س</>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* جدول التوزيعات التفصيلي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            سجل التوزيعات
          </CardTitle>
          <CardDescription>جميع التوزيعات والمبالغ المخصصة لك من غلة الوقف</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : distributions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              لا توجد توزيعات مسجلة بعد
            </div>
          ) : isMobile ? (
            // عرض البطاقات على الجوال
            <div className="grid gap-4">
              {distributions.map((dist) => {
                const isClosed = dist.fiscal_years?.is_closed || false;
                return (
                  <Card 
                    key={dist.id} 
                    className={`hover:shadow-md transition-shadow ${
                      isClosed 
                        ? 'bg-muted/30 border-border' 
                        : 'bg-success-light/30 border-success/20'
                    }`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">السنة المالية</p>
                          <p className="font-semibold">{dist.fiscal_years?.name || "—"}</p>
                        </div>
                        {getStatusBadge(isClosed)}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            تاريخ التوزيع
                          </div>
                          <p className="text-sm font-medium">
                            {format(new Date(dist.distribution_date), "dd/MM/yyyy", { locale: ar })}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">نوع الوريث</p>
                          <Badge variant="outline">{getHeirTypeLabel(dist.heir_type)}</Badge>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">المبلغ المستحق</p>
                        <p className={`text-lg font-bold ${isClosed ? 'text-muted-foreground' : 'text-success'}`}>
                          {masked ? (
                            <MaskedValue value={String(dist.share_amount || 0)} type="amount" masked={true} />
                          ) : (
                            <>{dist.share_amount?.toLocaleString("ar-SA")} ر.س</>
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // عرض الجدول على الديسكتوب
            <ScrollArea className="w-full">
              <div className="rounded-md border">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">السنة المالية</TableHead>
                      <TableHead className="text-right">تاريخ التوزيع</TableHead>
                      <TableHead className="text-right">نوع الوريث</TableHead>
                      <TableHead className="text-right">المبلغ المستحق</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map((dist) => {
                      const isClosed = dist.fiscal_years?.is_closed || false;
                      return (
                        <TableRow 
                          key={dist.id}
                          className={
                            isClosed 
                              ? 'bg-muted/30' 
                              : 'bg-success-light/20'
                          }
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {isClosed ? (
                                <Archive className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <CircleDot className="h-4 w-4 text-success" />
                              )}
                              {dist.fiscal_years?.name || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(dist.distribution_date), "dd/MM/yyyy", { locale: ar })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getHeirTypeLabel(dist.heir_type)}</Badge>
                          </TableCell>
                          <TableCell className={`font-bold ${isClosed ? 'text-muted-foreground' : 'text-success'}`}>
                            {masked ? (
                              <MaskedValue value={String(dist.share_amount || 0)} type="amount" masked={true} />
                            ) : (
                              <>{dist.share_amount?.toLocaleString("ar-SA")} ر.س</>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(isClosed)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* صف الإجمالي */}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={3}>الإجمالي</TableCell>
                      <TableCell className="text-primary">
                        {masked ? (
                          <MaskedValue value={String(totalDistributed)} type="amount" masked={true} />
                        ) : (
                          <>{totalDistributed.toLocaleString("ar-SA")} ر.س</>
                        )}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
