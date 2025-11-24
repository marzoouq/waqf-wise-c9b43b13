import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { 
  User, FileText, CreditCard, Upload, MessageSquare, 
  TrendingUp, Clock, CheckCircle, AlertCircle, Users, Landmark 
} from "lucide-react";
import { BeneficiaryProfileTab } from "@/components/beneficiary/BeneficiaryProfileTab";
import { BeneficiaryRequestsTab } from "@/components/beneficiary/BeneficiaryRequestsTab";
import { BeneficiaryStatementsTab } from "@/components/beneficiary/BeneficiaryStatementsTab";
import { BeneficiaryDocumentsTab } from "@/components/beneficiary/BeneficiaryDocumentsTab";
import { BeneficiaryDistributionsTab } from "@/components/beneficiary/BeneficiaryDistributionsTab";
import { BeneficiaryPropertiesTab } from "@/components/beneficiary/BeneficiaryPropertiesTab";
import { WaqfSummaryTab } from "@/components/beneficiary/WaqfSummaryTab";
import { FamilyTreeTab } from "@/components/beneficiary/FamilyTreeTab";
import { BankAccountsTab } from "@/components/beneficiary/BankAccountsTab";
import { FinancialReportsTab } from "@/components/beneficiary/FinancialReportsTab";
import { ApprovalsLogTab } from "@/components/beneficiary/ApprovalsLogTab";
import { DisclosuresTab } from "@/components/beneficiary/DisclosuresTab";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function BeneficiaryPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { settings, isLoading: settingsLoading } = useVisibilitySettings();

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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">مرحباً، {beneficiary.full_name}</h1>
              <p className="text-muted-foreground mt-1">
                آخر تسجيل دخول: {beneficiary.last_login_at 
                  ? format(new Date(beneficiary.last_login_at), "dd MMMM yyyy - HH:mm", { locale: ar })
                  : "—"}
              </p>
            </div>
            <Button onClick={() => navigate("/messages")} variant="outline">
              <MessageSquare className="h-4 w-4 ml-2" />
              الرسائل
            </Button>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-9 mb-6">
              {settings?.show_overview && (
                <TabsTrigger value="overview">
                  <TrendingUp className="h-4 w-4 ml-2" />
                  نظرة عامة
                </TabsTrigger>
              )}
              {settings?.show_profile && (
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 ml-2" />
                  الملف
                </TabsTrigger>
              )}
              {settings?.show_requests && (
                <TabsTrigger value="requests">
                  <FileText className="h-4 w-4 ml-2" />
                  الطلبات
                </TabsTrigger>
              )}
              {settings?.show_distributions && (
                <TabsTrigger value="distributions">
                  <TrendingUp className="h-4 w-4 ml-2" />
                  التوزيعات
                </TabsTrigger>
              )}
              {settings?.show_statements && (
                <TabsTrigger value="statements">
                  <CreditCard className="h-4 w-4 ml-2" />
                  كشف الحساب
                </TabsTrigger>
              )}
              {settings?.show_properties && (
                <TabsTrigger value="properties">
                  <FileText className="h-4 w-4 ml-2" />
                  العقارات
                </TabsTrigger>
              )}
              {settings?.show_documents && (
                <TabsTrigger value="documents">
                  <Upload className="h-4 w-4 ml-2" />
                  المستندات
                </TabsTrigger>
              )}
              {settings?.show_family_tree && (
                <TabsTrigger value="family">
                  <Users className="h-4 w-4 ml-2" />
                  العائلة
                </TabsTrigger>
              )}
              <TabsTrigger value="waqf">
                <Landmark className="h-4 w-4 ml-2" />
                الوقف
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPIs */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي المستلم</CardTitle>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Number(stats.total_received || 0).toLocaleString("ar-SA")} ريال</div>
                    <p className="text-xs text-muted-foreground mt-1">من جميع المدفوعات</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
                    <CreditCard className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Number(beneficiary.account_balance || 0).toLocaleString("ar-SA")} ريال</div>
                    <p className="text-xs text-muted-foreground mt-1">الرصيد المتاح</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الطلبات المعلقة</CardTitle>
                    <Clock className="h-4 w-4 text-warning" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pending_requests || 0}</div>
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
                    <div className="text-2xl font-bold">{stats.total_requests || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">جميع الطلبات</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>إجراءات سريعة</CardTitle>
                  <CardDescription>الإجراءات الأكثر استخداماً</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button 
                      variant="outline" 
                      className="h-auto py-6 flex-col gap-2"
                      onClick={() => setActiveTab("requests")}
                    >
                      <FileText className="h-6 w-6" />
                      <span>تقديم طلب جديد</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-6 flex-col gap-2"
                      onClick={() => setActiveTab("statements")}
                    >
                      <CreditCard className="h-6 w-6" />
                      <span>عرض كشف الحساب</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-6 flex-col gap-2"
                      onClick={() => setActiveTab("documents")}
                    >
                      <Upload className="h-6 w-6" />
                      <span>رفع مستند</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <BeneficiaryProfileTab beneficiary={beneficiary} />
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests">
              <BeneficiaryRequestsTab beneficiaryId={beneficiary.id} />
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
          </Tabs>
        </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
