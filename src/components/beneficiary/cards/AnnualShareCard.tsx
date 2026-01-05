/**
 * AnnualShareCard Component
 * بطاقة الحصة السنوية للمستفيد
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, Minus, CalendarDays, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface AnnualShareCardProps {
  beneficiaryId: string;
}

export function AnnualShareCard({ beneficiaryId }: AnnualShareCardProps) {
const { data, isLoading } = useQuery({
    queryKey: ['beneficiary-annual-share', beneficiaryId],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;

      // جلب توزيعات المستفيد مع السنوات المالية
      const { data: distributions } = await supabase
        .from('heir_distributions')
        .select(`
          share_amount,
          fiscal_year_id,
          fiscal_years:fiscal_year_id(name, start_date)
        `)
        .eq('beneficiary_id', beneficiaryId);

      // حساب المجاميع - استخراج السنة من start_date
      let currentYearTotal = 0;
      let lastYearTotal = 0;

      if (distributions) {
        distributions.forEach((d: any) => {
          // استخراج السنة من start_date أو من اسم السنة المالية
          const startDate = d.fiscal_years?.start_date;
          const fiscalYearName = d.fiscal_years?.name || '';
          
          let year = 0;
          if (startDate) {
            year = new Date(startDate).getFullYear();
          } else {
            // محاولة استخراج السنة من الاسم مثل "السنة المالية 2024-2025"
            const match = fiscalYearName.match(/(\d{4})-(\d{4})/);
            if (match) {
              year = parseInt(match[1]);
            }
          }
          
          const amount = d.share_amount || 0;
          
          if (year === currentYear || year === currentYear - 1) {
            // السنة المالية الحالية (تبدأ في السنة السابقة)
            currentYearTotal += amount;
          } else if (year === lastYear - 1 || year === lastYear) {
            lastYearTotal += amount;
          }
        });
      }

      // حساب نسبة التغيير
      let changePercentage = 0;
      if (lastYearTotal > 0) {
        changePercentage = ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100;
      }

      return {
        currentYearTotal,
        lastYearTotal,
        changePercentage,
        currentYear,
        lastYear
      };
    },
    staleTime: 60000
  });

  if (isLoading) {
    return <Skeleton className="h-40" />;
  }

  const getTrendIcon = () => {
    if (!data) return Minus;
    if (data.changePercentage > 0) return TrendingUp;
    if (data.changePercentage < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!data) return "text-muted-foreground";
    if (data.changePercentage > 0) return "text-success";
    if (data.changePercentage < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* القسم الأيسر - المبلغ */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  حصتك السنوية {data?.currentYear}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-l from-primary to-primary/70 bg-clip-text text-transparent">
                    {formatCurrency(data?.currentYearTotal || 0)}
                  </span>
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </div>

            {/* القسم الأيمن - المقارنة */}
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant="outline" 
                className={`${getTrendColor()} border-current/30 bg-current/5`}
              >
                <TrendIcon className="h-3.5 w-3.5 me-1" />
                {data?.changePercentage 
                  ? `${data.changePercentage > 0 ? '+' : ''}${data.changePercentage.toFixed(1)}%`
                  : '0%'
                }
              </Badge>
              <p className="text-xs text-muted-foreground">
                مقارنة بـ {data?.lastYear}: {formatCurrency(data?.lastYearTotal || 0)}
              </p>
            </div>
          </div>

          {/* شريط التقدم المرئي */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>التقدم مقارنة بالعام الماضي</span>
              <span>{Math.min(100, Math.max(0, (data?.currentYearTotal || 0) / (data?.lastYearTotal || 1) * 100)).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(100, Math.max(0, (data?.currentYearTotal || 0) / (data?.lastYearTotal || 1) * 100))}%` 
                }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
