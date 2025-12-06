import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, FileText, TrendingUp, PieChart, EyeOff } from "lucide-react";
import { PropertyAccordionView } from "./PropertyAccordionView";
import { ContractsTable } from "./ContractsTable";
import { MonthlyRevenueChart } from "./MonthlyRevenueChart";
import { DistributionPieChart } from "./DistributionPieChart";
import { EmptyPaymentsState } from "./EmptyPaymentsState";
import { useBeneficiaryProfile } from "@/hooks/useBeneficiaryProfile";
import { useAuth } from "@/hooks/useAuth";
import { useFiscalYearPublishStatus } from "@/hooks/useFiscalYearPublishStatus";
import { FiscalYearNotPublishedBanner } from "./FiscalYearNotPublishedBanner";

export function FinancialTransparencyTab() {
  const { user } = useAuth();
  const { payments } = useBeneficiaryProfile(user?.id);
  const { isCurrentYearPublished } = useFiscalYearPublishStatus();
  const hasPayments = payments && payments.length > 0;

  return (
    <div className="space-y-6">
      {/* بانر التنبيه إذا السنة غير منشورة */}
      <FiscalYearNotPublishedBanner />
      
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            الشفافية المالية الكاملة
          </CardTitle>
          <CardDescription>
            {isCurrentYearPublished 
              ? "اطلع على جميع بيانات الوقف المالية والعقارية - شفافية كاملة 100%"
              : "بعض البيانات المالية مخفية حتى يتم نشر السنة المالية من قبل الناظر"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* الرسوم البيانية المالية */}
      {hasPayments ? (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-warning" />
                الإيرادات الشهرية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyRevenueChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                نسب التوزيع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DistributionPieChart />
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyPaymentsState />
      )}

      {/* عقارات الوقف ووحداتها */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            عقارات الوقف ووحداتها
          </CardTitle>
          <CardDescription>
            انقر على أي عقار لعرض وحداته التفصيلية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyAccordionView />
        </CardContent>
      </Card>

      {/* عقود الإيجار */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-info" />
            عقود الإيجار النشطة
          </CardTitle>
          <CardDescription>
            جميع عقود الإيجار الحالية والمستقبلية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContractsTable />
        </CardContent>
      </Card>
    </div>
  );
}
