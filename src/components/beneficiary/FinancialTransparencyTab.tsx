import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, FileText, TrendingUp, PieChart } from "lucide-react";
import { PropertyAccordionView } from "./PropertyAccordionView";
import { ContractsTable } from "./ContractsTable";
import { MonthlyRevenueChart } from "./MonthlyRevenueChart";
import { DistributionPieChart } from "./DistributionPieChart";

export function FinancialTransparencyTab() {
  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            الشفافية المالية الكاملة
          </CardTitle>
          <CardDescription>
            اطلع على جميع بيانات الوقف المالية والعقارية - شفافية كاملة 100%
          </CardDescription>
        </CardHeader>
      </Card>

      {/* عقارات الوقف ووحداتها - نظام Accordion */}
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
            <FileText className="h-5 w-5 text-blue-600" />
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

      {/* الإيرادات الشهرية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            الإيرادات الشهرية
          </CardTitle>
          <CardDescription>
            تطور إيرادات الوقف خلال الأشهر الماضية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyRevenueChart />
        </CardContent>
      </Card>

      {/* نسب التوزيع */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-600" />
            نسب التوزيع بين المستفيدين
          </CardTitle>
          <CardDescription>
            توزيع غلة الوقف حسب الفئات والأولويات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DistributionPieChart />
        </CardContent>
      </Card>
    </div>
  );
}
