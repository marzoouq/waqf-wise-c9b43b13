import { Shield } from "lucide-react";
import PendingApprovalsSection from "@/components/dashboard/nazer/PendingApprovalsSection";
import NazerKPIs from "@/components/dashboard/nazer/NazerKPIs";
import SmartAlertsSection from "@/components/dashboard/nazer/SmartAlertsSection";
import QuickActionsGrid from "@/components/dashboard/nazer/QuickActionsGrid";
import RevenueDistributionChart from "@/components/dashboard/nazer/RevenueDistributionChart";
import PropertiesPerformanceChart from "@/components/dashboard/nazer/PropertiesPerformanceChart";
import RevenueExpenseChart from "@/components/dashboard/RevenueExpenseChart";
import BudgetComparisonChart from "@/components/dashboard/BudgetComparisonChart";

export default function NazerDashboard() {

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                لوحة تحكم الناظر
              </h1>
              <p className="text-muted-foreground">
                نظرة شاملة وتحكم كامل في جميع عمليات الوقف
              </p>
            </div>
          </div>
        </header>

        {/* Pending Approvals Section */}
        <PendingApprovalsSection />

        {/* KPIs Section */}
        <NazerKPIs />

        {/* Smart Alerts */}
        <SmartAlertsSection />

        {/* Charts Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <RevenueDistributionChart />
          <PropertiesPerformanceChart />
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <RevenueExpenseChart />
          <BudgetComparisonChart />
        </div>

        {/* Quick Actions */}
        <QuickActionsGrid />
      </div>
    </div>
  );
}
