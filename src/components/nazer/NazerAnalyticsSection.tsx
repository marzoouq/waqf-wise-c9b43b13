/**
 * NazerAnalyticsSection - قسم الرسوم البيانية التحليلية للناظر
 * @version 2.8.79
 */

import { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { BarChart3, PieChart, TrendingUp, Building2 } from "lucide-react";

// Lazy load chart components
const RevenueDistributionChart = lazy(() => import("@/components/dashboard/nazer/RevenueDistributionChart"));
const PropertiesPerformanceChart = lazy(() => import("@/components/dashboard/nazer/PropertiesPerformanceChart"));
const BudgetComparisonChart = lazy(() => import("./BudgetComparisonChart"));
const RevenueExpenseChart = lazy(() => import("./RevenueExpenseChart"));

export function NazerAnalyticsSection() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">التحليلات والرسوم البيانية</CardTitle>
        </div>
        <CardDescription>
          نظرة تحليلية شاملة على أداء الوقف المالي والتشغيلي
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4">
            <TabsTrigger value="revenue" className="gap-2 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">الإيرادات والمصروفات</span>
              <span className="sm:hidden">الإيرادات</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="gap-2 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">مقارنة الميزانية</span>
              <span className="sm:hidden">الميزانية</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="gap-2 text-xs sm:text-sm">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">توزيع الإيرادات</span>
              <span className="sm:hidden">التوزيع</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2 text-xs sm:text-sm">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">أداء العقارات</span>
              <span className="sm:hidden">العقارات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="mt-0">
            <Suspense fallback={<ChartSkeleton title="الإيرادات والمصروفات" />}>
              <RevenueExpenseChart />
            </Suspense>
          </TabsContent>

          <TabsContent value="budget" className="mt-0">
            <Suspense fallback={<ChartSkeleton title="مقارنة الميزانية" />}>
              <BudgetComparisonChart />
            </Suspense>
          </TabsContent>

          <TabsContent value="distribution" className="mt-0">
            <Suspense fallback={<ChartSkeleton title="توزيع الإيرادات" />}>
              <RevenueDistributionChart />
            </Suspense>
          </TabsContent>

          <TabsContent value="properties" className="mt-0">
            <Suspense fallback={<ChartSkeleton title="أداء العقارات" />}>
              <PropertiesPerformanceChart />
            </Suspense>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
