import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock, LucideIcon, Wallet, Calendar } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { useIsMobile } from "@/hooks/use-mobile";
import { WaqfDistributionsSummaryCard } from "./cards/WaqfDistributionsSummaryCard";

interface BeneficiaryDistributionsTabProps {
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
    is_closed: boolean;
  } | null;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function BeneficiaryDistributionsTab({ beneficiaryId }: BeneficiaryDistributionsTabProps) {
  const { settings } = useVisibilitySettings();
  const isMobile = useIsMobile();
  const masked = settings?.mask_exact_amounts || false;
  
  // جلب توزيعات الوريث من heir_distributions
  const { data: distributions = [], isLoading } = useQuery({
    queryKey: ["beneficiary-heir-distributions", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("heir_distributions")
        .select(`
          id,
          share_amount,
          heir_type,
          distribution_date,
          fiscal_year_id,
          fiscal_years (
            name,
            is_closed
          )
        `)
        .eq("beneficiary_id", beneficiaryId)
        .order("distribution_date", { ascending: false });

      if (error) throw error;
      return (data || []) as HeirDistribution[];
    },
  });

  const getHeirTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "son": "ابن",
      "daughter": "ابنة",
      "wife": "زوجة",
      "husband": "زوج",
      "father": "أب",
      "mother": "أم",
      "ابن": "ابن",
      "ابنة": "ابنة",
      "زوجة": "زوجة",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (isClosed: boolean) => {
    return isClosed ? (
      <Badge variant="secondary" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        مقفلة
      </Badge>
    ) : (
      <Badge variant="default" className="gap-1">
        <Clock className="h-3 w-3" />
        نشطة
      </Badge>
    );
  };

  // حساب إجمالي التوزيعات
  const totalDistributed = distributions.reduce((sum, d) => sum + (d.share_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* بطاقة إجمالي المحصل من الوقف */}
      <WaqfDistributionsSummaryCard beneficiaryId={beneficiaryId} />

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
              {distributions.map((dist) => (
                <Card key={dist.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">السنة المالية</p>
                        <p className="font-semibold">{dist.fiscal_years?.name || "—"}</p>
                      </div>
                      {getStatusBadge(dist.fiscal_years?.is_closed || false)}
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
                      <p className="text-lg font-bold text-primary">
                        {masked ? (
                          <MaskedValue value={String(dist.share_amount || 0)} type="amount" masked={true} />
                        ) : (
                          <>{dist.share_amount?.toLocaleString("ar-SA")} ر.س</>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                      <TableHead className="text-right">حالة السنة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.map((dist) => (
                      <TableRow key={dist.id}>
                        <TableCell className="font-medium">
                          {dist.fiscal_years?.name || "—"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(dist.distribution_date), "dd/MM/yyyy", { locale: ar })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getHeirTypeLabel(dist.heir_type)}</Badge>
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {masked ? (
                            <MaskedValue value={String(dist.share_amount || 0)} type="amount" masked={true} />
                          ) : (
                            <>{dist.share_amount?.toLocaleString("ar-SA")} ر.س</>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(dist.fiscal_years?.is_closed || false)}
                        </TableCell>
                      </TableRow>
                    ))}
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