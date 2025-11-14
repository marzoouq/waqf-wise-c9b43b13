import { Shield } from "lucide-react";
import PendingApprovalsSection from "@/components/dashboard/nazer/PendingApprovalsSection";
import NazerKPIs from "@/components/dashboard/nazer/NazerKPIs";
import SmartAlertsSection from "@/components/dashboard/nazer/SmartAlertsSection";
import QuickActionsGrid from "@/components/dashboard/nazer/QuickActionsGrid";
import RevenueDistributionChart from "@/components/dashboard/nazer/RevenueDistributionChart";
import PropertiesPerformanceChart from "@/components/dashboard/nazer/PropertiesPerformanceChart";
import RevenueExpenseChart from "@/components/dashboard/RevenueExpenseChart";
import BudgetComparisonChart from "@/components/dashboard/BudgetComparisonChart";

import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';

export default function NazerDashboard() {
  return (
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="لوحة تحكم الناظر"
        description="نظرة شاملة وتحكم كامل في جميع عمليات الوقف"
        icon={<Shield className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />}
      />

        {/* Pending Approvals Section */}
        <PendingApprovalsSection />

        {/* KPIs Section */}
        <NazerKPIs />

        {/* Smart Alerts */}
        <SmartAlertsSection />

      {/* Charts Grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 lg:grid-cols-2">
        <RevenueDistributionChart />
        <PropertiesPerformanceChart />
      </div>

      <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 lg:grid-cols-2">
        <RevenueExpenseChart />
        <BudgetComparisonChart />
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid />
    </MobileOptimizedLayout>
  );
}
