import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { 
  CreditCard, Clock, CheckCircle, AlertCircle, DollarSign
} from "lucide-react";
import {
  BeneficiaryProfileTab,
  BeneficiaryStatementsTab,
  BeneficiaryDistributionsTab,
  BeneficiaryPropertiesTab,
  WaqfSummaryTab,
  FamilyTreeTab,
  BankAccountsTab,
  FinancialReportsTab,
  ApprovalsLogTab,
  DisclosuresTab,
  GovernanceTab,
  BudgetsTab,
  LoansOverviewTab,
  BeneficiaryProfileCard,
  AnnualDisclosureCard,
  PropertyStatsCards,
  ActivityTimeline,
  YearlyComparison,
} from "@/components/beneficiary";
import { ChatbotQuickCard } from "@/components/dashboard/ChatbotQuickCard";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { BeneficiarySidebar } from "@/components/beneficiary/BeneficiarySidebar";
import { BeneficiaryBottomNavigation } from "@/components/mobile/BeneficiaryBottomNavigation";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function BeneficiaryPortal() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const { settings, isLoading: settingsLoading } = useVisibilitySettings();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // جلب بيانات المستفيد الحالي
  const { data: beneficiary, isLoading } = useQuery({
    queryKey: ["current-beneficiary"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("غير مصرح");

      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // جلب الإحصائيات
  const { data: statistics } = useQuery({
    queryKey: ["beneficiary-statistics", beneficiary?.id],
    queryFn: async () => {
      if (!beneficiary?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_beneficiary_statistics', { p_beneficiary_id: beneficiary.id });

      if (error) throw error;
      return data;
    },
    enabled: !!beneficiary?.id,
  });

  if (isLoading) {
    return <LoadingState fullScreen />;
  }

  if (!beneficiary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">خطأ في الوصول</h3>
            <p className="text-muted-foreground mb-4">لم يتم العثور على بيانات المستفيد</p>
            <Button onClick={() => navigate("/auth")}>العودة لتسجيل الدخول</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = (statistics as {
    total_received: number;
    pending_amount: number;
    total_requests: number;
    pending_requests: number;
  }) || {
    total_received: 0,
    pending_amount: 0,
    total_requests: 0,
    pending_requests: 0,
  };

  return (
    <PageErrorBoundary pageName="بوابة المستفيد">
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <BeneficiarySidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          beneficiaryName={beneficiary.full_name}
        />

        {/* Main Content - مع padding للسايدبار على Desktop */}
        <main className="flex-1 lg:mr-64 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* بطاقة الملف الشخصي */}
                <BeneficiaryProfileCard
                  beneficiary={beneficiary as any}
                  onMessages={() => navigate("/messages")}
                  onChangePassword={() => {}}
                />

                {/* الإحصائيات المحسنة */}
                <UnifiedStatsGrid columns={4}>
                  <UnifiedKPICard
                    title="إجمالي المستلم"
                    value={`${Number(stats.total_received || 0).toLocaleString("ar-SA")} ريال`}
                    icon={DollarSign}
                    variant="default"
                  />
                  <UnifiedKPICard
                    title="الرصيد الحالي"
                    value={`${Number(beneficiary.account_balance || 0).toLocaleString("ar-SA")} ريال`}
                    icon={CreditCard}
                    variant="success"
                  />
                  <UnifiedKPICard
                    title="الطلبات المعلقة"
                    value={stats.pending_requests || 0}
                    icon={Clock}
                    variant="warning"
                    subtitle={`${Number(stats.pending_amount || 0).toLocaleString("ar-SA")} ريال`}
                  />
                  <UnifiedKPICard
                    title="إجمالي الطلبات"
                    value={stats.total_requests || 0}
                    icon={CheckCircle}
                    variant="default"
                  />
                </UnifiedStatsGrid>

                {/* المساعد الذكي */}
                <ChatbotQuickCard />

                {/* إحصائيات العقارات */}
                <PropertyStatsCards />

                {/* الإفصاح السنوي */}
                <AnnualDisclosureCard />

                {/* سجل النشاط */}
                <ActivityTimeline beneficiaryId={beneficiary.id} />

                {/* المقارنة السنوية */}
                <YearlyComparison beneficiaryId={beneficiary.id} />
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <BeneficiaryProfileTab beneficiary={beneficiary} />
            )}

            {/* Distributions Tab */}
            {activeTab === "distributions" && (
              <BeneficiaryDistributionsTab beneficiaryId={beneficiary.id} />
            )}

            {/* Statements Tab */}
            {activeTab === "statements" && (
              <BeneficiaryStatementsTab beneficiaryId={beneficiary.id} />
            )}

            {/* Properties Tab */}
            {activeTab === "properties" && (
              <BeneficiaryPropertiesTab />
            )}

            {/* Waqf Summary Tab */}
            {activeTab === "waqf" && (
              <WaqfSummaryTab />
            )}

            {/* Family Tree Tab */}
            {settings?.show_family_tree && activeTab === "family" && (
              <FamilyTreeTab beneficiaryId={beneficiary.id} />
            )}

            {/* Bank Accounts Tab */}
            {settings?.show_bank_accounts && activeTab === "bank" && (
              <BankAccountsTab />
            )}

            {/* Financial Reports Tab */}
            {settings?.show_financial_reports && activeTab === "reports" && (
              <FinancialReportsTab />
            )}

            {/* Approvals Log Tab */}
            {settings?.show_approvals_log && activeTab === "approvals" && (
              <ApprovalsLogTab />
            )}

            {/* Disclosures Tab */}
            {settings?.show_disclosures && activeTab === "disclosures" && (
              <DisclosuresTab />
            )}

            {/* Governance Tab */}
            {settings?.show_governance && activeTab === "governance" && (
              <GovernanceTab />
            )}

            {/* Budgets Tab */}
            {settings?.show_budgets && activeTab === "budgets" && (
              <BudgetsTab />
            )}

            {/* Loans Overview Tab */}
            {settings?.show_own_loans && activeTab === "loans" && (
              <LoansOverviewTab />
            )}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <BeneficiaryBottomNavigation />
      </div>
    </PageErrorBoundary>
  );
}
