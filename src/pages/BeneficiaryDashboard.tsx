import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  FileText, 
  DollarSign, 
  Calendar,
  TrendingUp,
  LayoutDashboard,
  Eye,
  Briefcase
} from "lucide-react";
import { BeneficiaryProfileCard } from "@/components/beneficiary/BeneficiaryProfileCard";
import { StatsCard } from "@/components/beneficiary/StatsCard";
import { QuickActionsCard } from "@/components/beneficiary/QuickActionsCard";
import { AnnualDisclosureCard } from "@/components/beneficiary/AnnualDisclosureCard";
import { PropertyStatsCards } from "@/components/beneficiary/PropertyStatsCards";
import { ReportsMenu } from "@/components/beneficiary/ReportsMenu";
import { ReportsExplanationCard } from "@/components/beneficiary/ReportsExplanationCard";
import { ErrorReportingGuide } from "@/components/beneficiary/ErrorReportingGuide";
import { ActivityTimeline } from "@/components/beneficiary/ActivityTimeline";
import { YearlyComparison } from "@/components/beneficiary/YearlyComparison";
import { ChatbotQuickCard } from "@/components/dashboard/ChatbotQuickCard";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { InternalMessagesDialog } from "@/components/messages/InternalMessagesDialog";
import { ChangePasswordDialog } from "@/components/beneficiary/ChangePasswordDialog";
import { DocumentUploadDialog } from "@/components/beneficiary/DocumentUploadDialog";
import { EmergencyRequestForm } from "@/components/beneficiary/EmergencyRequestForm";
import { LoanRequestForm } from "@/components/beneficiary/LoanRequestForm";
import { DataUpdateForm } from "@/components/beneficiary/DataUpdateForm";
import { AddFamilyMemberForm } from "@/components/beneficiary/AddFamilyMemberForm";
import { FinancialTransparencyTab } from "@/components/beneficiary/FinancialTransparencyTab";
import { useBeneficiaryProfile } from "@/hooks/useBeneficiaryProfile";
import { useBeneficiaryAttachments } from "@/hooks/useBeneficiaryAttachments";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";
import { logger } from "@/lib/logger";

interface Request {
  id: string;
  description: string;
  status: string;
  amount?: number | null;
  created_at: string;
}

const BeneficiaryDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { beneficiary, payments, loading } = useBeneficiaryProfile(user?.id);
  const { attachments } = useBeneficiaryAttachments(beneficiary?.id);

  const [messagesOpen, setMessagesOpen] = useState(false);
  const [documentUploadOpen, setDocumentUploadOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [servicesTab, setServicesTab] = useState("history");

  // جلب الطلبات
  const { data: requests = [] } = useQuery({
    queryKey: ["beneficiary-requests", beneficiary?.id],
    queryFn: async () => {
      if (!beneficiary?.id) return [];
      
      const { data, error } = await supabase
        .from("beneficiary_requests")
        .select("id, description, status, amount, created_at")
        .eq("beneficiary_id", beneficiary.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Request[];
    },
    enabled: !!beneficiary?.id,
  });

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (newRequest: any) => {
      const { data, error } = await supabase
        .from("beneficiary_requests")
        .insert(newRequest)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiary-requests"] });
      toast({
        title: "تم بنجاح",
        description: "تم إرسال الطلب بنجاح",
      });
      setServicesTab("history");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
    },
  });

  const stats = {
    totalPayments: payments.reduce((sum, p) => sum + Number(p.amount), 0),
    paymentsCount: payments.length,
    lastPaymentDate: payments.length > 0 
      ? new Date(payments[0].payment_date).toLocaleDateString("ar-SA") 
      : "لا يوجد",
    averagePayment: payments.length > 0 
      ? payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length 
      : 0,
  };

  const handleEmergencyRequest = async (data: Record<string, unknown>) => {
    try {
      await createRequestMutation.mutateAsync({
        beneficiary_id: beneficiary?.id || "",
        request_type_id: "emergency",
        description: (data.description as string) || (data.emergency_reason as string),
        amount: data.amount as number,
        priority: "عاجل",
        status: "قيد المراجعة",
      });
    } catch (error) {
      logger.error(error, { context: "submit_emergency_request", severity: "medium" });
    }
  };

  const handleLoanRequest = async (data: Record<string, unknown>) => {
    try {
      await createRequestMutation.mutateAsync({
        beneficiary_id: beneficiary?.id || "",
        request_type_id: "loan",
        description: (data.description as string) || `طلب قرض بمبلغ ${data.amount}`,
        amount: (data.amount as number) || (data.loan_amount as number),
        priority: "عادية",
        status: "قيد المراجعة",
      });
    } catch (error) {
      logger.error(error, { context: "submit_loan_request", severity: "medium" });
    }
  };

  const handleDataUpdate = async (data: Record<string, unknown>) => {
    try {
      await createRequestMutation.mutateAsync({
        beneficiary_id: beneficiary?.id || "",
        request_type_id: "data-update",
        description: `طلب تحديث البيانات: ${JSON.stringify(data)}`,
        priority: "عادية",
        status: "قيد المراجعة",
      });
    } catch (error) {
      logger.error(error, { context: "submit_data_update_request", severity: "medium" });
    }
  };

  const handleAddFamily = async (data: Record<string, unknown>) => {
    try {
      await createRequestMutation.mutateAsync({
        beneficiary_id: beneficiary?.id || "",
        request_type_id: "add-family-member",
        description: `طلب إضافة فرد جديد للعائلة: ${JSON.stringify(data)}`,
        priority: "عادية",
        status: "قيد المراجعة",
      });
    } catch (error) {
      logger.error(error, { context: "submit_add_family_member_request", severity: "medium" });
    }
  };

  const handleRequestSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["beneficiary-requests"] });
    setServicesTab("history");
  };

  if (loading) return <LoadingState message="جاري تحميل البيانات..." />;
  
  if (!beneficiary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              لم يتم العثور على حساب مستفيد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">حسابك غير مرتبط ببيانات مستفيد في النظام.</p>
              <div className="bg-muted p-4 rounded-lg text-right space-y-2">
                <p className="font-semibold">لتفعيل حسابك:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>تواصل مع إدارة الوقف</li>
                  <li>قدم بريدك الإلكتروني: <span className="font-mono bg-background px-2 py-1 rounded">{user?.email}</span></li>
                  <li>سيقوم المدير بتفعيل تسجيل الدخول لك</li>
                </ol>
              </div>
            </div>
            <Button 
              onClick={() => supabase.auth.signOut()} 
              variant="outline" 
              className="w-full"
            >
              تسجيل الخروج
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MobileOptimizedLayout>
      <div className="space-y-6 pb-20">
        {/* بطاقة الملف الشخصي */}
        <BeneficiaryProfileCard
          beneficiary={beneficiary}
          onMessages={() => setMessagesOpen(true)}
          onChangePassword={() => setPasswordDialogOpen(true)}
        />

        {/* الإحصائيات المحسنة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="إجمالي المدفوعات"
            value={formatCurrency(stats.totalPayments)}
            icon={DollarSign}
            colorClass="text-primary"
          />
          <StatsCard
            title="عدد المدفوعات"
            value={stats.paymentsCount}
            icon={FileText}
            colorClass="text-green-600"
          />
          <StatsCard
            title="آخر دفعة"
            value={stats.lastPaymentDate}
            icon={Calendar}
            colorClass="text-blue-600"
          />
          <StatsCard
            title="متوسط الدفعة"
            value={formatCurrency(stats.averagePayment)}
            icon={TrendingUp}
            colorClass="text-amber-600"
          />
        </div>

        {/* التبويبات الرئيسية - 3 فقط */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="overview" className="text-sm gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
              <span className="sm:hidden">عامة</span>
            </TabsTrigger>
            <TabsTrigger value="transparency" className="text-sm gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">الشفافية المالية</span>
              <span className="sm:hidden">شفافية</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="text-sm gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">الخدمات والطلبات</span>
              <span className="sm:hidden">خدمات</span>
            </TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-6">
            {/* المساعد الذكي */}
            <ChatbotQuickCard />

            {/* الإجراءات السريعة */}
            <QuickActionsCard
              onEmergencyRequest={() => {
                setActiveTab("services");
                setServicesTab("emergency");
              }}
              onLoanRequest={() => {
                setActiveTab("services");
                setServicesTab("loan");
              }}
              onDataUpdate={() => {
                setActiveTab("services");
                setServicesTab("update");
              }}
              onAddFamily={() => {
                setActiveTab("services");
                setServicesTab("family");
              }}
              onUploadDocument={() => setDocumentUploadOpen(true)}
              onMessages={() => setMessagesOpen(true)}
            />



            {/* الإفصاح السنوي */}
            <AnnualDisclosureCard />

            {/* شرح نظام التقارير */}
            <ReportsExplanationCard />

            {/* شرح نظام الحماية والإشعارات */}
            <ErrorReportingGuide />

            {/* التقارير المفصلة */}
            <ReportsMenu type="beneficiary" />

            {/* سجل النشاط */}
            <ActivityTimeline beneficiaryId={beneficiary.id} />

            {/* المقارنة السنوية */}
            <YearlyComparison beneficiaryId={beneficiary.id} />
          </TabsContent>

          {/* الشفافية المالية */}
          <TabsContent value="transparency">
            <FinancialTransparencyTab />
          </TabsContent>

          {/* الخدمات والطلبات */}
          <TabsContent value="services">
            <Tabs 
              value={servicesTab} 
              onValueChange={setServicesTab} 
              orientation="vertical" 
              className="flex flex-col md:flex-row gap-4"
            >
              <TabsList className="flex flex-row md:flex-col h-auto w-full md:w-48 gap-1 overflow-x-auto md:overflow-visible">
                <TabsTrigger value="history" className="w-full justify-start whitespace-nowrap">
                  <FileText className="h-4 w-4 ml-2" />
                  سجل الطلبات
                </TabsTrigger>
                <TabsTrigger value="emergency" className="w-full justify-start whitespace-nowrap">
                  <DollarSign className="h-4 w-4 ml-2" />
                  طلب فزعة
                </TabsTrigger>
                <TabsTrigger value="loan" className="w-full justify-start whitespace-nowrap">
                  <FileText className="h-4 w-4 ml-2" />
                  طلب قرض
                </TabsTrigger>
                <TabsTrigger value="update" className="w-full justify-start whitespace-nowrap">
                  <User className="h-4 w-4 ml-2" />
                  تحديث البيانات
                </TabsTrigger>
                <TabsTrigger value="family" className="w-full justify-start whitespace-nowrap">
                  <User className="h-4 w-4 ml-2" />
                  إضافة فرد
                </TabsTrigger>
              </TabsList>

              <div className="flex-1">
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>سجل الطلبات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {requests.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          لا توجد طلبات حالياً
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {requests.map((request) => (
                            <div 
                              key={request.id} 
                              className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-3"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{request.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(request.created_at).toLocaleDateString("ar-SA")}
                                </p>
                                {request.amount && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    المبلغ: <span className="font-semibold">{formatCurrency(request.amount)}</span>
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant={
                                  request.status === "موافق" 
                                    ? "default" 
                                    : request.status === "مرفوض" 
                                    ? "destructive" 
                                    : "secondary"
                                }
                              >
                                {request.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="emergency">
                  <EmergencyRequestForm onSubmit={handleEmergencyRequest} />
                </TabsContent>

                <TabsContent value="loan">
                  <LoanRequestForm onSubmit={handleLoanRequest} />
                </TabsContent>

                <TabsContent value="update">
                  <DataUpdateForm 
                    onSubmit={handleDataUpdate} 
                    isLoading={createRequestMutation.isPending}
                    currentData={{
                      phone: beneficiary?.phone,
                      email: beneficiary?.email || undefined,
                      address: beneficiary?.address || undefined,
                    }}
                  />
                </TabsContent>

                <TabsContent value="family">
                  <AddFamilyMemberForm onSubmit={handleAddFamily} />
                </TabsContent>
              </div>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <InternalMessagesDialog open={messagesOpen} onOpenChange={setMessagesOpen} />
        <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
        <DocumentUploadDialog 
          open={documentUploadOpen} 
          onOpenChange={setDocumentUploadOpen}
          beneficiaryId={beneficiary.id}
        />
      </div>
    </MobileOptimizedLayout>
  );
};

export default BeneficiaryDashboard;
