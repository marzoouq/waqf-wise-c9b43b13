import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, Calendar, TrendingUp, MessageSquare, AlertCircle, Wallet, Upload, UserCog, UserPlus } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useRequests } from "@/hooks/useRequests";
import { EmergencyRequestForm } from "@/components/beneficiary/EmergencyRequestForm";
import { LoanRequestForm } from "@/components/beneficiary/LoanRequestForm";
import { DataUpdateForm } from "@/components/beneficiary/DataUpdateForm";
import { AddFamilyMemberForm } from "@/components/beneficiary/AddFamilyMemberForm";
import { DocumentUploadDialog } from "@/components/beneficiary/DocumentUploadDialog";
import { useBeneficiaryAttachments } from "@/hooks/useBeneficiaryAttachments";
import { AccountStatementView } from "@/components/beneficiary/AccountStatementView";
import { BeneficiaryCertificate } from "@/components/beneficiary/BeneficiaryCertificate";
import { InternalMessagesDialog } from "@/components/messages/InternalMessagesDialog";
import { useToast } from "@/hooks/use-toast";

interface Beneficiary {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  iban?: string | null;
  family_name?: string | null;
  relationship?: string | null;
  category: string;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
  notification_preferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  } | null;
}

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
  const { createRequest, requests } = useRequests();
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>();
  const [activeRequestTab, setActiveRequestTab] = useState("view");
  
  const { attachments } = useBeneficiaryAttachments(beneficiary?.id);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const { data: benData, error: benError } = await supabase
          .from("beneficiaries")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (benError) throw benError;
        
        if (!benData) {
          toast({
            title: "لم يتم العثور على حساب مستفيد",
            description: "يرجى التواصل مع الإدارة لتفعيل حسابك",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        setBeneficiary(benData);

        const { data: payData, error: payError } = await supabase
          .from("payments")
          .select("id, payment_number, payment_date, amount, description")
          .eq("beneficiary_id", benData.id)
          .order("payment_date", { ascending: false })
          .limit(50);
        
        if (payError) throw payError;
        setPayments(payData || []);
      } catch (error: any) {
        console.error("Error fetching beneficiary data:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: error.message || "حدث خطأ أثناء تحميل بياناتك",
          variant: "destructive",
        });
        setBeneficiary(null);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, toast]);

  const stats = {
    totalPayments: payments.reduce((sum, p) => sum + Number(p.amount), 0),
    paymentsCount: payments.length,
    lastPaymentDate: payments.length > 0 ? new Date(payments[0].payment_date).toLocaleDateString("ar-SA") : "لا يوجد",
    averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length : 0,
  };

  const handleEmergencyRequest = async (data: any) => {
    try {
      await createRequest.mutateAsync({
        beneficiary_id: beneficiary?.id || "",
        request_type_id: "emergency" as any, // يجب أن يكون UUID حقيقي
        description: data.description,
        amount: data.amount,
        emergency_reason: data.emergency_reason,
        priority: "عاجل",
        status: "قيد المراجعة",
      } as any);
      toast({
        title: "تم تقديم الطلب",
        description: "سيتم مراجعة طلبك في أقرب وقت",
      });
      setActiveRequestTab("view");
    } catch (error) {
      console.error("Error submitting emergency request:", error);
    }
  };

  const handleLoanRequest = async (data: any) => {
    try {
      await createRequest.mutateAsync({
        beneficiary_id: beneficiary?.id || "",
        request_type_id: "loan" as any,
        description: `طلب قرض: ${data.description}`,
        amount: data.loan_amount,
        loan_amount: data.loan_amount,
        loan_term_months: data.loan_term_months,
        loan_reason: data.loan_reason,
        priority: "عادية",
        status: "قيد المراجعة",
      } as any);
      toast({
        title: "تم تقديم طلب القرض",
        description: "سيتم مراجعة طلبك ومعالجته",
      });
      setActiveRequestTab("view");
    } catch (error) {
      console.error("Error submitting loan request:", error);
    }
  };

  const handleDataUpdate = async (data: any) => {
    try {
      await createRequest.mutateAsync({
        beneficiary_id: beneficiary?.id || "",
        request_type_id: "data-update" as any,
        description: `طلب تحديث ${data.update_type}: ${data.description}`,
        new_data: JSON.stringify(data),
        priority: "عادية",
        status: "قيد المراجعة",
      } as any);
      toast({
        title: "تم تقديم الطلب",
        description: "تم تقديم طلب تحديث البيانات بنجاح",
      });
      setActiveRequestTab("view");
    } catch (error) {
      console.error("Error submitting data update request:", error);
    }
  };

  const handleAddFamilyMember = async (data: any) => {
    try {
      await createRequest.mutateAsync({
        beneficiary_id: beneficiary?.id || "",
        request_type_id: "add-family-member" as any,
        description: `طلب إضافة فرد: ${data.member_name} (${data.relationship})`,
        new_data: JSON.stringify(data),
        priority: "عادية",
        status: "قيد المراجعة",
      } as any);
      toast({
        title: "تم تقديم الطلب",
        description: "تم تقديم طلب إضافة فرد للعائلة بنجاح",
      });
      setActiveRequestTab("view");
    } catch (error) {
      console.error("Error submitting add family member request:", error);
    }
  };

  if (loading) return <LoadingState message="جاري تحميل البيانات..." />;
  if (!beneficiary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EmptyState icon={FileText} title="لم يتم العثور على بيانات المستفيد" description="يرجى التواصل مع الإدارة" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">مرحباً، {beneficiary.full_name}</h1>
            <p className="text-muted-foreground">عرض المدفوعات والتقارير الشخصية</p>
          </div>
          <Button onClick={() => setMessagesDialogOpen(true)} variant="outline">
            <MessageSquare className="h-4 w-4 ml-2" />
            الرسائل
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">إجمالي المدفوعات</CardTitle>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalPayments.toLocaleString("ar-SA")} ر.س</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">عدد المدفوعات</CardTitle>
                <FileText className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.paymentsCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">آخر دفعة</CardTitle>
                <Calendar className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-accent">{stats.lastPaymentDate}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">متوسط الدفعة</CardTitle>
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.averagePayment.toLocaleString("ar-SA", { maximumFractionDigits: 0 })} ر.س</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>الخدمات والطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeRequestTab} onValueChange={setActiveRequestTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="view">السجل</TabsTrigger>
                <TabsTrigger value="emergency">
                  <AlertCircle className="h-4 w-4 ml-2" />
                  فزعة
                </TabsTrigger>
                <TabsTrigger value="loan">
                  <Wallet className="h-4 w-4 ml-2" />
                  قرض
                </TabsTrigger>
                <TabsTrigger value="update">
                  <UserCog className="h-4 w-4 ml-2" />
                  تحديث
                </TabsTrigger>
                <TabsTrigger value="family">
                  <UserPlus className="h-4 w-4 ml-2" />
                  إضافة فرد
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
                  isLoading={createRequest.isPending}
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
                  isLoading={createRequest.isPending}
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
                  beneficiaryId={beneficiary?.id || ""}
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
                  beneficiaryId={beneficiary?.id || ""}
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
    </div>
  );
};

export default BeneficiaryDashboard;
