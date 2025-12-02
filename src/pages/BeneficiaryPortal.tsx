import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { 
  User, FileText, CreditCard, MessageSquare, 
  TrendingUp, Clock, CheckCircle, AlertCircle, Users, Landmark,
  DollarSign, Building2, Shield
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
  LoansOverviewTab
} from "@/components/beneficiary";
import { BeneficiarySidebar } from "@/components/beneficiary/BeneficiarySidebar";
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
        <main className="flex-1 lg:mr-64 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">مرحباً، {beneficiary.full_name}</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  آخر تسجيل دخول: {beneficiary.last_login_at 
                    ? format(new Date(beneficiary.last_login_at), "dd MMMM yyyy - HH:mm", { locale: ar })
                    : "—"}
                </p>
              </div>
              <Button onClick={() => navigate("/messages")} variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 ml-2" />
                الرسائل
              </Button>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
              {/* KPIs */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي المستلم</CardTitle>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{Number(stats.total_received || 0).toLocaleString("ar-SA")} ريال</div>
                    <p className="text-xs text-muted-foreground mt-1">من جميع المدفوعات</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
                    <CreditCard className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{Number(beneficiary.account_balance || 0).toLocaleString("ar-SA")} ريال</div>
                    <p className="text-xs text-muted-foreground mt-1">الرصيد المتاح</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الطلبات المعلقة</CardTitle>
                    <Clock className="h-4 w-4 text-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.pending_requests || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Number(stats.pending_amount || 0).toLocaleString("ar-SA")} ريال
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
                    <CheckCircle className="h-4 w-4 text-info" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.total_requests || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">جميع الطلبات</p>
                  </CardContent>
                </Card>
              </div>

          {/* Quick Actions - للاطلاع فقط */}
              <Card>
                <CardHeader>
                  <CardTitle>إجراءات سريعة</CardTitle>
                  <CardDescription>روابط الاطلاع السريع على بيانات الوقف</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2 min-h-[44px]"
                      onClick={() => setSearchParams({ tab: "distributions" })}
                    >
                      <TrendingUp className="h-6 w-6" />
                      <span className="text-sm">عرض التوزيعات</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2 min-h-[44px]"
                      onClick={() => setSearchParams({ tab: "statements" })}
                    >
                      <CreditCard className="h-6 w-6" />
                      <span className="text-sm">عرض كشف الحساب</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2 min-h-[44px]"
                      onClick={() => setSearchParams({ tab: "properties" })}
                    >
                      <Building2 className="h-6 w-6" />
                      <span className="text-sm">عرض العقارات</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
      </div>
    </PageErrorBoundary>
  );
}
