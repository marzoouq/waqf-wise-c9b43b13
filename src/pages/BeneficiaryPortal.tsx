import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock } from "lucide-react";
import type { Beneficiary } from "@/types/beneficiary";
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
import { FiscalYearNotPublishedBanner } from "@/components/beneficiary/FiscalYearNotPublishedBanner";
import { WaqfDistributionsSummaryCard } from "@/components/beneficiary/cards/WaqfDistributionsSummaryCard";
import { BankBalanceCard } from "@/components/shared/BankBalanceCard";
import { WaqfCorpusCard } from "@/components/shared/WaqfCorpusCard";
import { ChatbotQuickCard } from "@/components/dashboard/ChatbotQuickCard";
import { Suspense } from "react";
import { BeneficiarySidebar } from "@/components/beneficiary/BeneficiarySidebar";
import { BeneficiaryBottomNavigation } from "@/components/mobile/BeneficiaryBottomNavigation";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { useBeneficiaryPortalData } from "@/hooks/beneficiary/useBeneficiaryPortalData";
import { useBeneficiarySession } from "@/hooks/beneficiary/useBeneficiarySession";

export default function BeneficiaryPortal() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const { settings } = useVisibilitySettings();

  // استخدام Hook المخصص لجلب البيانات
  const { beneficiary, statistics, isLoading } = useBeneficiaryPortalData();

  // تتبع جلسة المستفيد للناظر
  useBeneficiarySession({
    beneficiaryId: beneficiary?.id,
    enabled: !!beneficiary?.id,
  });

  // التحقق من إذن الوصول للتبويب النشط
  const isTabVisible = (tabKey: keyof typeof settings) => {
    if (!settings) return false;
    return settings[tabKey] === true;
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

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
            {/* بانر حالة نشر السنة المالية */}
            <FiscalYearNotPublishedBanner />

            {/* Tab Content */}
            {activeTab === "overview" && settings?.show_overview && (
              <div className="space-y-6">
                {/* بطاقة الملف الشخصي */}
                <BeneficiaryProfileCard
                  beneficiary={beneficiary as Beneficiary}
                  onMessages={() => navigate("/messages")}
                  onChangePassword={() => {}}
                />

                {/* المساعد الذكي */}
                <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
                  <ChatbotQuickCard />
                </Suspense>

                {/* بطاقات الرصيد البنكي ورقبة الوقف */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <BankBalanceCard compact />
                  <WaqfCorpusCard compact />
                </div>

                {/* بطاقة إجمالي المحصل من الوقف */}
                <WaqfDistributionsSummaryCard beneficiaryId={beneficiary.id} />

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
            {activeTab === "profile" && settings?.show_profile && (
              <BeneficiaryProfileTab beneficiary={beneficiary} />
            )}
            {activeTab === "profile" && !settings?.show_profile && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>غير مصرح لك بالوصول لهذا القسم</AlertDescription>
              </Alert>
            )}

            {/* Distributions Tab */}
            {activeTab === "distributions" && settings?.show_distributions && (
              <BeneficiaryDistributionsTab beneficiaryId={beneficiary.id} />
            )}
            {activeTab === "distributions" && !settings?.show_distributions && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>غير مصرح لك بالوصول لهذا القسم</AlertDescription>
              </Alert>
            )}

            {/* Statements Tab */}
            {activeTab === "statements" && settings?.show_statements && (
              <BeneficiaryStatementsTab beneficiaryId={beneficiary.id} />
            )}
            {activeTab === "statements" && !settings?.show_statements && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>غير مصرح لك بالوصول لهذا القسم</AlertDescription>
              </Alert>
            )}

            {/* Properties Tab */}
            {activeTab === "properties" && settings?.show_properties && (
              <BeneficiaryPropertiesTab />
            )}
            {activeTab === "properties" && !settings?.show_properties && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>غير مصرح لك بالوصول لهذا القسم</AlertDescription>
              </Alert>
            )}

            {/* Waqf Summary Tab */}
            {activeTab === "waqf" && (
              <WaqfSummaryTab />
            )}

            {/* Family Tree Tab */}
            {settings?.show_family_tree && activeTab === "family" && (
              <FamilyTreeTab beneficiaryId={beneficiary.id} />
            )}
            {!settings?.show_family_tree && activeTab === "family" && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>غير مصرح لك بالوصول لهذا القسم</AlertDescription>
              </Alert>
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
            {!settings?.show_governance && activeTab === "governance" && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>غير مصرح لك بالوصول لهذا القسم</AlertDescription>
              </Alert>
            )}

            {/* Budgets Tab */}
            {settings?.show_budgets && activeTab === "budgets" && (
              <BudgetsTab />
            )}
            {!settings?.show_budgets && activeTab === "budgets" && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>غير مصرح لك بالوصول لهذا القسم</AlertDescription>
              </Alert>
            )}

            {/* Loans Overview Tab */}
            {settings?.show_own_loans && activeTab === "loans" && (
              <LoansOverviewTab />
            )}
            {!settings?.show_own_loans && activeTab === "loans" && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>غير مصرح لك بالوصول لهذا القسم</AlertDescription>
              </Alert>
            )}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <BeneficiaryBottomNavigation />
      </div>
    </PageErrorBoundary>
  );
}
