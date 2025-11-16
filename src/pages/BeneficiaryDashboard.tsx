import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useBeneficiaryProfile } from "@/hooks/useBeneficiaryProfile";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, Calendar, TrendingUp, MessageSquare, AlertCircle, Wallet, Upload, UserCog, UserPlus, Bell } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { EmergencyRequestForm } from "@/components/beneficiary/EmergencyRequestForm";
import { LoanRequestForm } from "@/components/beneficiary/LoanRequestForm";
import { DataUpdateForm } from "@/components/beneficiary/DataUpdateForm";
import { AddFamilyMemberForm } from "@/components/beneficiary/AddFamilyMemberForm";
import { DocumentUploadDialog } from "@/components/beneficiary/DocumentUploadDialog";
import { useBeneficiaryAttachments } from "@/hooks/useBeneficiaryAttachments";
import { AccountStatementView } from "@/components/beneficiary/AccountStatementView";
import { BeneficiaryCertificate } from "@/components/beneficiary/BeneficiaryCertificate";
import { InternalMessagesDialog } from "@/components/messages/InternalMessagesDialog";
import { QuickActionsCard } from "@/components/beneficiary/QuickActionsCard";
import { NotificationsCard } from "@/components/beneficiary/NotificationsCard";
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';
import { useToast } from "@/hooks/use-toast";
import { Beneficiary } from "@/types/beneficiary";
import { logger } from "@/lib/logger";

interface Request {
  id: string;
  description: string;
  status: string;
  amount?: number | null;
  created_at: string;
}

interface Payment {
  id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  description: string;
}

const BeneficiaryDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { beneficiary, payments, loading } = useBeneficiaryProfile(user?.id);
  
  // تفعيل الإشعارات في الوقت الفعلي
  useRealtimeNotifications();
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>();
  const [activeRequestTab, setActiveRequestTab] = useState("view");
  
  const { attachments } = useBeneficiaryAttachments(beneficiary?.id);

  useEffect(() => {
    if (!user?.id || !beneficiary?.id) return;

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("beneficiary_requests")
        .select("id, description, status, amount, created_at")
        .eq("beneficiary_id", beneficiary.id)
        .order("submitted_at", { ascending: false });
      
      if (!error && data) {
        setRequests(data as Request[]);
      }
    };

    fetchRequests();
  }, [user?.id, beneficiary?.id]);

import { Database } from '@/integrations/supabase/types';

// ... existing imports

  const createRequestMutation = useMutation({
    mutationFn: async (newRequest: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("beneficiary_requests")
        .insert(newRequest)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إرسال الطلب بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إرسال الطلب',
        variant: 'destructive',
      });
    },
  });

  const stats = {
    totalPayments: payments.reduce((sum, p) => sum + Number(p.amount), 0),
    paymentsCount: payments.length,
    lastPaymentDate: payments.length > 0 ? new Date(payments[0].payment_date).toLocaleDateString("ar-SA") : "لا يوجد",
    averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length : 0,
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
      setActiveRequestTab("view");
    } catch (error) {
      logger.error(error, { context: 'submit_emergency_request', severity: 'medium' });
    }
  };

  const handleLoanRequest = async (data: { description: string; amount: number; term_months: number }) => {
    try {
      await createRequestMutation.mutateAsync({
        beneficiary_id: beneficiary?.id || "",
        request_type_id: "loan",
        description: `طلب قرض: ${data.description}`,
        amount: data.loan_amount,
        loan_amount: data.loan_amount,
        loan_term_months: data.loan_term_months,
        loan_reason: data.loan_reason,
        priority: "عادية",
        status: "قيد المراجعة",
      });
      setActiveRequestTab("view");
    } catch (error) {
      logger.error(error, { context: 'submit_loan_request', severity: 'medium' });
    }
  };

  const handleDataUpdate = async (data: Record<string, unknown>) => {
    try {
      await createRequestMutation.mutateAsync({
        beneficiary_id: beneficiary?.id || "",
        request_type_id: "data-update",
        description: `طلب تحديث ${data.update_type}: ${data.description}`,
        new_data: JSON.stringify(data),
        priority: "عادية",
        status: "قيد المراجعة",
      });
      setActiveRequestTab("view");
    } catch (error) {
      logger.error(error, { context: 'submit_data_update_request', severity: 'medium' });
    }
  };

  const handleAddFamilyMember = async (data: Record<string, unknown>) => {
    try {
      await createRequestMutation.mutateAsync({
        beneficiary_id: beneficiary?.id || "",
        request_type_id: "add-family-member",
        description: `طلب إضافة فرد: ${data.member_name} (${data.relationship})`,
        new_data: JSON.stringify(data),
        priority: "عادية",
        status: "قيد المراجعة",
      });
      setActiveRequestTab("view");
    } catch (error) {
      logger.error(error, { context: 'submit_add_family_member_request', severity: 'medium' });
    }
  };

  if (loading) return <LoadingState message="جاري تحميل البيانات..." />;
  
  if (!beneficiary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-destructive">لم يتم العثور على حساب مستفيد</CardTitle>
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
      <div className="space-y-4">
        <MobileOptimizedHeader
          title={`مرحباً، ${beneficiary.full_name}`}
          description="لوحة التحكم الشخصية"
          actions={
            <Button onClick={() => setMessagesDialogOpen(true)} variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 ml-2" />
              الرسائل
            </Button>
          }
        />

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm">إجمالي المدفوعات</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-primary">
                {stats.totalPayments.toLocaleString("ar-SA")} ر.س
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm">عدد المدفوعات</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-green-600">
                {stats.paymentsCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm">آخر دفعة</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm md:text-lg font-bold text-blue-600">
                {stats.lastPaymentDate}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm">متوسط الدفعة</CardTitle>
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold text-amber-600">
                {stats.averagePayment.toLocaleString("ar-SA")} ر.س
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الإجراءات السريعة */}
        <QuickActionsCard
          onEmergencyRequest={() => setActiveRequestTab("emergency")}
          onLoanRequest={() => setActiveRequestTab("loan")}
          onDataUpdate={() => setActiveRequestTab("data-update")}
          onAddFamily={() => setActiveRequestTab("add-family")}
          onUploadDocument={() => setUploadDialogOpen(true)}
          onMessages={() => setMessagesDialogOpen(true)}
        />

        {/* الإشعارات */}
        <NotificationsCard />

        {/* الطلبات والخدمات */}

        <Card>
          <CardHeader>
            <CardTitle>الخدمات والطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeRequestTab} onValueChange={setActiveRequestTab}>
              <TabsList className="grid w-full grid-cols-5 text-xs md:text-sm h-auto">
                <TabsTrigger value="view" className="px-2 py-2">السجل</TabsTrigger>
                <TabsTrigger value="emergency" className="px-2 py-2">
                  <AlertCircle className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                  <span className="hidden sm:inline">فزعة</span>
                  <span className="sm:hidden">فزعة</span>
                </TabsTrigger>
                <TabsTrigger value="loan" className="px-2 py-2">
                  <Wallet className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                  <span className="hidden sm:inline">قرض</span>
                  <span className="sm:hidden">قرض</span>
                </TabsTrigger>
                <TabsTrigger value="update" className="px-2 py-2">
                  <UserCog className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                  <span className="hidden sm:inline">تحديث</span>
                  <span className="sm:hidden">تحديث</span>
                </TabsTrigger>
                <TabsTrigger value="family" className="px-2 py-2">
                  <UserPlus className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
                  <span className="hidden sm:inline">عائلة</span>
                  <span className="sm:hidden">عائلة</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="space-y-4">
                {requests.length === 0 ? (
                  <EmptyState 
                    icon={FileText} 
                    title="لا توجد طلبات سابقة" 
                    description="يمكنك تقديم طلب جديد من التبويبات أعلاه" 
                  />
                ) : (
                  requests.map((request: Request) => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{request.description}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(request.created_at).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequestId(request.id);
                                setUploadDialogOpen(true);
                              }}
                            >
                              <Upload className="h-4 w-4 ml-2" />
                              رفع مستند
                            </Button>
                          </div>
                        </div>
                        {request.amount && (
                          <p className="text-sm text-muted-foreground">
                            المبلغ: <span className="font-semibold">{request.amount} ر.س</span>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
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
                    bank_name: beneficiary?.bank_name || undefined,
                    bank_account_number: beneficiary?.bank_account_number || undefined,
                    iban: beneficiary?.iban || undefined,
                  }}
                />
              </TabsContent>

              <TabsContent value="family">
                <AddFamilyMemberForm
                  onSubmit={handleAddFamilyMember}
                  isLoading={createRequestMutation.isPending}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المستندات والشهادات</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="statement" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="statement">كشف الحساب</TabsTrigger>
                <TabsTrigger value="certificate">شهادة الاستحقاق</TabsTrigger>
              </TabsList>

              <TabsContent value="statement">
                <AccountStatementView
                  beneficiaryName={beneficiary?.full_name || ""}
                  beneficiaryId={beneficiary?.beneficiary_number || beneficiary?.id || ""}
                  payments={payments.map(p => ({
                    id: p.id,
                    date: p.payment_date,
                    type: "دفعة",
                    amount: Number(p.amount),
                    description: p.description,
                    status: "مكتمل",
                  }))}
                />
              </TabsContent>

              <TabsContent value="certificate">
                <BeneficiaryCertificate
                  beneficiaryName={beneficiary?.full_name || ""}
                  beneficiaryId={beneficiary?.beneficiary_number || beneficiary?.id || ""}
                  nationalId={beneficiary?.national_id || ""}
                  category={beneficiary?.category || ""}
                  registrationDate={beneficiary?.created_at || ""}
                  status={beneficiary?.status || ""}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سجل المدفوعات</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <EmptyState icon={FileText} title="لا توجد مدفوعات" description="لم يتم استلام أي مدفوعات بعد" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">رقم السند</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                      <th className="text-right py-3 px-4">الوصف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{payment.payment_number}</td>
                        <td className="py-3 px-4">{new Date(payment.payment_date).toLocaleDateString("ar-SA")}</td>
                        <td className="py-3 px-4 font-semibold text-primary">{Number(payment.amount).toLocaleString("ar-SA")} ر.س</td>
                        <td className="py-3 px-4">{payment.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <InternalMessagesDialog
          open={messagesDialogOpen}
          onOpenChange={setMessagesDialogOpen}
        />
        {beneficiary && (
          <DocumentUploadDialog
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            beneficiaryId={beneficiary.id}
            requestId={selectedRequestId}
            onUploadComplete={() => {
              toast({
                title: "تم الرفع",
                description: "تم رفع المستند بنجاح",
              });
            }}
          />
        )}
      </div>
    </MobileOptimizedLayout>
  );
};

export default BeneficiaryDashboard;
