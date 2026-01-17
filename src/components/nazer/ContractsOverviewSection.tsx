/**
 * قسم إحصائيات العقود للوحة تحكم الناظر
 * يعرض ملخص شامل لحالة العقود
 */
import { memo } from "react";
import { FileText, CheckCircle, Clock, AlertTriangle, RefreshCw, XCircle, DollarSign, TrendingUp } from "lucide-react";
import { useContractsPaginated } from "@/hooks/property/useContractsPaginated";
import { useContractsStats } from "@/hooks/contracts/useContractsStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { type Contract } from "@/hooks/property/useContracts";

export const ContractsOverviewSection = memo(function ContractsOverviewSection() {
  const { contracts, isLoading } = useContractsPaginated();
  const stats = useContractsStats(contracts as Contract[]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ملخص العقود
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = [
    { label: "إجمالي العقود", value: stats.total, icon: FileText, color: "text-foreground" },
    { label: "العقود النشطة", value: stats.active, icon: CheckCircle, color: "text-success" },
    { label: "المسودات", value: stats.draft, icon: Clock, color: "text-warning" },
    { label: "جاهز للتجديد", value: stats.readyForRenewal, icon: AlertTriangle, color: "text-warning", highlight: stats.readyForRenewal > 0 },
    { label: "المتجددة تلقائياً", value: stats.autoRenewing, icon: RefreshCw, color: "text-success" },
    { label: "المنتهية", value: stats.expired, icon: XCircle, color: "text-destructive" },
    { label: "الإيراد الشهري من العقود", value: `${stats.totalMonthlyRevenue.toLocaleString('ar-SA')} ر.س`, icon: DollarSign, color: "text-primary" },
    { label: "الإيراد السنوي المتوقع", value: `${stats.totalAnnualRevenue.toLocaleString('ar-SA')} ر.س`, icon: TrendingUp, color: "text-success" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          ملخص العقود
          {stats.readyForRenewal > 0 && (
            <Badge variant="destructive" className="ms-2">
              {stats.readyForRenewal} تحتاج تجديد
            </Badge>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/properties" className="gap-2">
            عرض الكل
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg border p-3 transition-colors ${
                item.highlight ? "border-warning bg-warning/5" : "bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
              <div className={`text-lg font-bold ${item.color}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
