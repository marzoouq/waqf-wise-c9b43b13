import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { 
  User, 
  FileText, 
  DollarSign, 
  Calendar,
  TrendingUp,
  LayoutDashboard,
  Eye
} from "lucide-react";
import {
  BeneficiaryProfileCard,
  QuickActionsCard,
  AnnualDisclosureCard,
  PropertyStatsCards,
  ActivityTimeline,
  YearlyComparison,
  ChangePasswordDialog,
  FinancialTransparencyTab
} from "@/components/beneficiary";
import { UnifiedDashboardLayout } from "@/components/dashboard/UnifiedDashboardLayout";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { ChatbotQuickCard } from "@/components/dashboard/ChatbotQuickCard";
import { InternalMessagesDialog } from "@/components/messages/InternalMessagesDialog";
import { useBeneficiaryProfile } from "@/hooks/useBeneficiaryProfile";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";

interface Request {
  id: string;
  description: string;
  status: string;
  amount?: number | null;
  created_at: string;
}

const BeneficiaryDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { beneficiary, payments, loading } = useBeneficiaryProfile(user?.id);

  const [messagesOpen, setMessagesOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // جلب الطلبات للعرض فقط
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
    <main>
      <UnifiedDashboardLayout role="beneficiary">
        <div className="space-y-6 pb-20">
        {/* بطاقة الملف الشخصي */}
        <BeneficiaryProfileCard
          beneficiary={beneficiary}
          onMessages={() => setMessagesOpen(true)}
          onChangePassword={() => setPasswordDialogOpen(true)}
        />

        {/* الإحصائيات المحسنة */}
        <UnifiedStatsGrid columns={4}>
          <UnifiedKPICard
            title="إجمالي المدفوعات"
            value={formatCurrency(stats.totalPayments)}
            icon={DollarSign}
            variant="default"
            loading={loading}
          />
          <UnifiedKPICard
            title="عدد المدفوعات"
            value={stats.paymentsCount}
            icon={FileText}
            variant="success"
            loading={loading}
          />
          <UnifiedKPICard
            title="آخر دفعة"
            value={stats.lastPaymentDate}
            icon={Calendar}
            variant="default"
            loading={loading}
          />
          <UnifiedKPICard
            title="متوسط الدفعة"
            value={formatCurrency(stats.averagePayment)}
            icon={TrendingUp}
            variant="warning"
            loading={loading}
          />
        </UnifiedStatsGrid>

        {/* التبويبات الرئيسية - للاطلاع فقط */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-10 sm:h-12">
            <TabsTrigger value="overview" className="text-xs sm:text-sm gap-1 sm:gap-2 px-2 sm:px-3">
              <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
              <span className="sm:hidden">عامة</span>
            </TabsTrigger>
            <TabsTrigger value="transparency" className="text-xs sm:text-sm gap-1 sm:gap-2 px-2 sm:px-3">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">الشفافية المالية</span>
              <span className="sm:hidden">شفافية</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm gap-1 sm:gap-2 px-2 sm:px-3">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">سجل الطلبات</span>
              <span className="sm:hidden">السجل</span>
            </TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-6">
            {/* المساعد الذكي */}
            <ChatbotQuickCard />

            {/* الإجراءات السريعة - للاطلاع فقط */}
            <QuickActionsCard
              onMessages={() => setMessagesOpen(true)}
            />

            {/* إحصائيات العقارات */}
            <PropertyStatsCards />

            {/* الإفصاح السنوي */}
            <AnnualDisclosureCard />

            {/* سجل النشاط */}
            <ActivityTimeline beneficiaryId={beneficiary.id} />

            {/* المقارنة السنوية */}
            <YearlyComparison beneficiaryId={beneficiary.id} />
          </TabsContent>

          {/* الشفافية المالية */}
          <TabsContent value="transparency">
            <FinancialTransparencyTab />
          </TabsContent>

          {/* سجل الطلبات - للعرض فقط */}
          <TabsContent value="history">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  سجل الطلبات السابقة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {requests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 sm:py-8 text-xs sm:text-sm">
                    لا توجد طلبات سابقة
                  </p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {requests.map((request) => (
                      <div 
                        key={request.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-2 sm:gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">{request.description}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString("ar-SA")}
                          </p>
                          {request.amount && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
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
                          className="text-[10px] sm:text-xs shrink-0"
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
        </Tabs>

        {/* Dialogs */}
        <InternalMessagesDialog open={messagesOpen} onOpenChange={setMessagesOpen} />
        <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
        </div>
      </UnifiedDashboardLayout>
    </main>
  );
};

export default BeneficiaryDashboard;
