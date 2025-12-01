import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Download, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface HistoricalDistributionsCardProps {
  beneficiaryId: string;
}

export function HistoricalDistributionsCard({ beneficiaryId }: HistoricalDistributionsCardProps) {
  const { data: distributions = [], isLoading } = useQuery({
    queryKey: ["heir-distributions", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("heir_distributions")
        .select(`
          *,
          fiscal_years:fiscal_year_id(
            year_label,
            start_date,
            end_date
          )
        `)
        .eq("beneficiary_id", beneficiaryId)
        .eq("is_historical", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!beneficiaryId,
  });

  const totalHistoricalAmount = distributions.reduce(
    (sum, dist) => sum + (dist.share_amount || 0),
    0
  );

  const getHeirTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "زوجة": "الزوجات",
      "wife": "الزوجات",
      "ابن": "الأبناء",
      "son": "الأبناء",
      "بنت": "البنات",
      "daughter": "البنات",
      "ابنة": "البنات",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            التوزيعات التاريخية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (distributions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            التوزيعات التاريخية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد توزيعات تاريخية مسجلة</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            التوزيعات التاريخية
          </CardTitle>
          <Badge variant="outline" className="text-lg font-semibold">
            {formatCurrency(totalHistoricalAmount)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {distributions.map((dist: any) => (
            <div
              key={dist.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-medium">
                    {getHeirTypeLabel(dist.heir_type)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {dist.fiscal_years?.year_label || "سنة مالية سابقة"}
                  </span>
                </div>
                
                {dist.fiscal_years && (
                  <p className="text-xs text-muted-foreground">
                    الفترة: {format(new Date(dist.fiscal_years.start_date), "dd/MM/yyyy", { locale: ar })}
                    {" - "}
                    {format(new Date(dist.fiscal_years.end_date), "dd/MM/yyyy", { locale: ar })}
                  </p>
                )}

                {dist.distribution_notes && (
                  <p className="text-sm text-muted-foreground italic">
                    {dist.distribution_notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">المبلغ المستحق</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(dist.share_amount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي التوزيعات التاريخية</p>
              <p className="text-xl font-bold">{formatCurrency(totalHistoricalAmount)}</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 ml-2" />
              تحميل التقرير
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}