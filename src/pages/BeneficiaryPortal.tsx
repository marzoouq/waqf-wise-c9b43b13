import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { useIsMobile } from "@/hooks/useIsMobile";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function BeneficiaryPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { settings, isLoading: settingsLoading } = useVisibilitySettings();
  const isMobile = useIsMobile();

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
      <MobileOptimizedLayout>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">خطأ في الوصول</h3>
            <p className="text-muted-foreground mb-4">لم يتم العثور على بيانات المستفيد</p>
            <Button onClick={() => navigate("/auth")}>العودة لتسجيل الدخول</Button>
          </CardContent>
        </Card>
      </MobileOptimizedLayout>
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
      <MobileOptimizedLayout>
        <div className="space-y-6">
          {/* Header - محسّن للجوال */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">مرحباً، {beneficiary.full_name}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                آخر تسجيل دخول: {beneficiary.last_login_at 
                  ? format(new Date(beneficiary.last_login_at), isMobile ? "dd/MM/yyyy" : "dd MMMM yyyy - HH:mm", { locale: ar })
                  : "—"}
              </p>
            </div>
            <Button 
              onClick={() => navigate("/messages")} 
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="w-full sm:w-auto"
            >
              <MessageSquare className="h-4 w-4 ml-2" />
              الرسائل
            </Button>
          </div>

          {/* Main Tabs - محسّن للجوال */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex w-auto mb-6 h-auto p-1 gap-1">
              {settings?.show_overview && (
                <TabsTrigger value="overview" className="flex-col sm:flex-row gap-1 px-3 py-2 min-h-[44px]">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[10px] sm:text-sm">نظرة عامة</span>
                </TabsTrigger>
              )}
              {settings?.show_profile && (
                <TabsTrigger value="profile" className="flex-col sm:flex-row gap-1 px-3 py-2 min-h-[44px]">
                  <User className="h-4 w-4" />
                  <span className="text-[10px] sm:text-sm">الملف</span>
                </TabsTrigger>
              )}
              {settings?.show_requests && (
                <TabsTrigger value="requests" className="flex-col sm:flex-row gap-1 px-3 py-2 min-h-[44px]">
                  <FileText className="h-4 w-4" />
                  <span className="text-[10px] sm:text-sm">الطلبات</span>
                </TabsTrigger>
              )}
              {settings?.show_distributions && (
                <TabsTrigger value="distributions" className="flex-col sm:flex-row gap-1 px-3 py-2 min-h-[44px]">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-[10px] sm:text-sm">التوزيعات</span>
                </TabsTrigger>
              )}
              {settings?.show_statements && (
                <TabsTrigger value="statements" className="flex-col sm:flex-row gap-1 px-3 py-2 min-h-[44px]">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[10px] sm:text-sm">كشف الحساب</span>
                </TabsTrigger>
              )}
              {settings?.show_properties && (
                <TabsTrigger value="properties" className="flex-col sm:flex-row gap-1 px-3 py-2 min-h-[44px]">
                  <Building2 className="h-4 w-4" />
                  <span className="text-[10px] sm:text-sm">العقارات</span>
                </TabsTrigger>
              )}
              {settings?.show_family_tree && (
                <TabsTrigger value="family" className="flex-col sm:flex-row gap-1 px-3 py-2 min-h-[44px]">
                  <Users className="h-4 w-4" />
                  <span className="text-[10px] sm:text-sm">العائلة</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="waqf" className="flex-col sm:flex-row gap-1 px-3 py-2 min-h-[44px]">
                <Landmark className="h-4 w-4" />
                <span className="text-[10px] sm:text-sm">الوقف</span>
              </TabsTrigger>
              {settings?.show_governance && (
                <TabsTrigger value="governance" className="flex-col sm:flex-row gap-1 px-3 py-2 min-h-[44px]">
                  <Shield className="h-4 w-4" />
                  <span className="text-[10px] sm:text-sm">الحوكمة</span>
                </TabsTrigger>
              )}
              {settings?.show_budgets && (
                <TabsTrigger value="budgets" className="flex-col sm:flex-row gap-1 px-3 py-2 min-h-[44px]">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-[10px] sm:text-sm">الميزانيات</span>
                </TabsTrigger>
              )}
              {settings?.show_own_loans && (
                <TabsTrigger value="loans" className="flex-col sm:flex-row gap-1 px-3 py-2 min-h-[44px]">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[10px] sm:text-sm">القروض</span>
                </TabsTrigger>
              )}
              </TabsList>
              <ScrollBar orientation="horizontal" className="h-2" />
            </ScrollArea>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 animate-fade-in">
              {/* KPIs - محسّن للجوال */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">إجمالي المستلم</CardTitle>
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{Number(stats.total_received || 0).toLocaleString("ar-SA")} <span className="text-sm sm:text-base">ريال</span></div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">من جميع المدفوعات</p>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">الرصيد الحالي</CardTitle>
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{Number(beneficiary.account_balance || 0).toLocaleString("ar-SA")} <span className="text-sm sm:text-base">ريال</span></div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">الرصيد المتاح</p>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">الطلبات المعلقة</CardTitle>
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.pending_requests || 0}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      {Number(stats.pending_amount || 0).toLocaleString("ar-SA")} ريال
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover-scale">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">إجمالي الطلبات</CardTitle>
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats.total_requests || 0}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">جميع الطلبات</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions - محسّن للجوال */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">إجراءات سريعة</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">روابط الاطلاع السريع على بيانات الوقف</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 sm:py-6 flex-col gap-2 hover-scale"
                      onClick={() => setActiveTab("distributions")}
                    >
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs sm:text-sm">عرض التوزيعات</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 sm:py-6 flex-col gap-2 hover-scale"
                      onClick={() => setActiveTab("statements")}
                    >
                      <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs sm:text-sm">عرض كشف الحساب</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 sm:py-6 flex-col gap-2 hover-scale"
                      onClick={() => setActiveTab("properties")}
                    >
                      <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-xs sm:text-sm">عرض العقارات</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <BeneficiaryProfileTab beneficiary={beneficiary} />
            </TabsContent>

            {/* Distributions Tab */}
            <TabsContent value="distributions">
              <BeneficiaryDistributionsTab beneficiaryId={beneficiary.id} />
            </TabsContent>

            {/* Statements Tab */}
            <TabsContent value="statements">
              <BeneficiaryStatementsTab beneficiaryId={beneficiary.id} />
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties">
              <BeneficiaryPropertiesTab />
            </TabsContent>

            {/* Waqf Summary Tab */}
            <TabsContent value="waqf">
              <WaqfSummaryTab />
            </TabsContent>

            {/* Family Tree Tab */}
            {settings?.show_family_tree && (
              <TabsContent value="family">
                <FamilyTreeTab beneficiaryId={beneficiary.id} />
              </TabsContent>
            )}

            {/* Bank Accounts Tab */}
            {settings?.show_bank_accounts && (
              <TabsContent value="bank">
                <BankAccountsTab />
              </TabsContent>
            )}

            {/* Financial Reports Tab */}
            {settings?.show_financial_reports && (
              <TabsContent value="reports">
                <FinancialReportsTab />
              </TabsContent>
            )}

            {/* Approvals Log Tab */}
            {settings?.show_approvals_log && (
              <TabsContent value="approvals">
                <ApprovalsLogTab />
              </TabsContent>
            )}

            {/* Disclosures Tab */}
            {settings?.show_disclosures && (
              <TabsContent value="disclosures">
                <DisclosuresTab />
              </TabsContent>
            )}

            {/* Governance Tab */}
            {settings?.show_governance && (
              <TabsContent value="governance">
                <GovernanceTab />
              </TabsContent>
            )}

            {/* Budgets Tab */}
            {settings?.show_budgets && (
              <TabsContent value="budgets">
                <BudgetsTab />
              </TabsContent>
            )}

            {/* Loans Overview Tab */}
            {settings?.show_own_loans && (
              <TabsContent value="loans">
                <LoansOverviewTab />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
