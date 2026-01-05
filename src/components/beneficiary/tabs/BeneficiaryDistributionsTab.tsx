/**
 * تبويب التوزيعات - الأنصبة من الوقف
 * يركز على: نوع الوريث، نسبة الاستحقاق، المقارنة السنوية
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Wallet, Calendar, Archive, CircleDot, TrendingUp, Users, Percent, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useBeneficiaryDistributions } from "@/hooks/beneficiary/useBeneficiaryDistributions";
import { useYearlyComparison } from "@/hooks/beneficiary/useBeneficiaryTabsData";

interface BeneficiaryDistributionsTabProps {
  beneficiaryId: string;
}

const HEIR_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  "son": { label: "ابن", color: "bg-heir-son/10 text-heir-son border-heir-son/30" },
  "daughter": { label: "بنت", color: "bg-heir-daughter/10 text-heir-daughter border-heir-daughter/30" },
  "wife": { label: "زوجة", color: "bg-heir-wife/10 text-heir-wife border-heir-wife/30" },
  "husband": { label: "زوج", color: "bg-primary/10 text-primary border-primary/30" },
  "father": { label: "أب", color: "bg-primary/10 text-primary border-primary/30" },
  "mother": { label: "أم", color: "bg-primary/10 text-primary border-primary/30" },
  "ابن": { label: "ابن", color: "bg-heir-son/10 text-heir-son border-heir-son/30" },
  "بنت": { label: "بنت", color: "bg-heir-daughter/10 text-heir-daughter border-heir-daughter/30" },
  "زوجة": { label: "زوجة", color: "bg-heir-wife/10 text-heir-wife border-heir-wife/30" },
};

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

  const { data: yearlyData } = useYearlyComparison(beneficiaryId);

  // حساب نسبة التغير مقارنة بالسنة السابقة
  const calculateYearlyChange = () => {
    if (!yearlyData || yearlyData.length < 2) return null;
    const current = yearlyData[0]?.total || 0;
    const previous = yearlyData[1]?.total || 0;
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const yearlyChange = calculateYearlyChange();

  const getHeirConfig = (type: string) => {
    return HEIR_TYPE_CONFIG[type] || { label: type, color: "bg-muted text-muted-foreground border-border" };
  };

  // تجميع التوزيعات حسب نوع الوريث
  const distributionsByType = distributions.reduce((acc, dist) => {
    const type = dist.heir_type || 'غير محدد';
    if (!acc[type]) acc[type] = { count: 0, total: 0 };
    acc[type].count++;
    acc[type].total += dist.share_amount || 0;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  return (
    <div className="space-y-6">
      {/* بطاقة نوع المستفيد والنسبة */}
      {distributions.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              نصيبك من الوقف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* نوع الوريث */}
              <div className="text-center p-3 rounded-lg bg-background/80">
                <p className="text-xs text-muted-foreground mb-1">صفتك</p>
                <Badge className={`${getHeirConfig(distributions[0]?.heir_type).color} border`}>
                  {getHeirConfig(distributions[0]?.heir_type).label}
                </Badge>
              </div>

              {/* إجمالي المستلم */}
              <div className="text-center p-3 rounded-lg bg-background/80">
                <p className="text-xs text-muted-foreground mb-1">إجمالي النصيب</p>
                <p className="font-bold text-primary">
                  {masked ? (
                    <MaskedValue value={String(totalDistributed)} type="amount" masked={true} />
                  ) : (
                    <>{totalDistributed.toLocaleString("ar-SA")} ر.س</>
                  )}
                </p>
              </div>

              {/* عدد التوزيعات */}
              <div className="text-center p-3 rounded-lg bg-background/80">
                <p className="text-xs text-muted-foreground mb-1">عدد التوزيعات</p>
                <p className="font-bold text-lg">{distributions.length}</p>
              </div>

              {/* التغير السنوي */}
              <div className="text-center p-3 rounded-lg bg-background/80">
                <p className="text-xs text-muted-foreground mb-1">مقارنة بالعام السابق</p>
                {yearlyChange !== null ? (
                  <div className={`flex items-center justify-center gap-1 font-bold ${
                    yearlyChange >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {yearlyChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {Math.abs(yearlyChange).toFixed(1)}%
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ملخص السنة الحالية vs السابقة */}
      {distributions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-success/30 bg-success-light/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-success/20">
                  <CircleDot className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">السنة الحالية</p>
                  <p className="text-xl font-bold text-success">
                    {masked ? (
                      <MaskedValue value={String(currentTotal)} type="amount" masked={true} />
                    ) : (
                      <>{currentTotal.toLocaleString("ar-SA")} ر.س</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{currentDistributions.length} توزيع</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <Archive className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">السنوات السابقة</p>
                  <p className="text-xl font-bold text-muted-foreground">
                    {masked ? (
                      <MaskedValue value={String(historicalTotal)} type="amount" masked={true} />
                    ) : (
                      <>{historicalTotal.toLocaleString("ar-SA")} ر.س</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{historicalDistributions.length} توزيع</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* جدول التوزيعات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            سجل التوزيعات
          </CardTitle>
          <CardDescription>تفاصيل الأنصبة المخصصة لك من غلة الوقف</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : distributions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد توزيعات مسجلة بعد</p>
            </div>
          ) : isMobile ? (
            <div className="grid gap-3">
              {distributions.map((dist) => {
                const isClosed = dist.fiscal_years?.is_closed || false;
                const config = getHeirConfig(dist.heir_type);
                return (
                  <Card 
                    key={dist.id} 
                    className={`${isClosed ? 'bg-muted/20' : 'bg-success-light/20 border-success/20'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={isClosed ? "secondary" : "default"} className="gap-1">
                          {isClosed ? <Archive className="h-3 w-3" /> : <CircleDot className="h-3 w-3" />}
                          {dist.fiscal_years?.name || "—"}
                        </Badge>
                        <Badge className={`${config.color} border`}>{config.label}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(dist.distribution_date), "dd/MM/yyyy", { locale: ar })}
                        </span>
                        <span className={`font-bold ${isClosed ? 'text-muted-foreground' : 'text-success'}`}>
                          {masked ? (
                            <MaskedValue value={String(dist.share_amount || 0)} type="amount" masked={true} />
                          ) : (
                            <>{(dist.share_amount || 0).toLocaleString("ar-SA")} ر.س</>
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">السنة المالية</TableHead>
                      <TableHead className="text-right">تاريخ التوزيع</TableHead>
                      <TableHead className="text-right">صفة الوريث</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map((dist) => {
                      const isClosed = dist.fiscal_years?.is_closed || false;
                      const config = getHeirConfig(dist.heir_type);
                      return (
                        <TableRow key={dist.id} className={isClosed ? 'bg-muted/20' : 'bg-success-light/10'}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isClosed ? (
                                <Archive className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <CircleDot className="h-4 w-4 text-success" />
                              )}
                              <span className="font-medium">{dist.fiscal_years?.name || "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(dist.distribution_date), "dd/MM/yyyy", { locale: ar })}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${config.color} border`}>{config.label}</Badge>
                          </TableCell>
                          <TableCell className={`font-bold ${isClosed ? 'text-muted-foreground' : 'text-success'}`}>
                            {masked ? (
                              <MaskedValue value={String(dist.share_amount || 0)} type="amount" masked={true} />
                            ) : (
                              <>{(dist.share_amount || 0).toLocaleString("ar-SA")} ر.س</>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={3}>الإجمالي</TableCell>
                      <TableCell className="text-primary">
                        {masked ? (
                          <MaskedValue value={String(totalDistributed)} type="amount" masked={true} />
                        ) : (
                          <>{totalDistributed.toLocaleString("ar-SA")} ر.س</>
                        )}
                      </TableCell>
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
