import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileText, Calendar, TrendingUp, MessageSquare, AlertCircle, Wallet } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useRequests } from "@/hooks/useRequests";
import { EmergencyRequestForm } from "@/components/beneficiary/EmergencyRequestForm";
import { LoanRequestForm } from "@/components/beneficiary/LoanRequestForm";
import { InternalMessagesDialog } from "@/components/messages/InternalMessagesDialog";
import { useToast } from "@/hooks/use-toast";

interface Beneficiary {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  email?: string | null;
  family_name?: string | null;
  relationship?: string | null;
  category: string;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
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
  const { createRequest } = useRequests();
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const [activeRequestTab, setActiveRequestTab] = useState("view");

  useEffect(() => {
    if (!user?.email) return;

    const fetchData = async () => {
      try {
        const { data: benData, error: benError } = await supabase
          .from("beneficiaries")
          .select("id, full_name, national_id, phone, email, family_name, relationship, category, status, notes, created_at, updated_at")
          .eq("email", user.email)
          .maybeSingle();
        
        if (benError) throw benError;
        setBeneficiary(benData);

        if (benData) {
          const { data: payData, error: payError } = await supabase
            .from("payments")
            .select("id, payment_number, payment_date, amount, description")
            .eq("payer_name", benData.full_name)
            .order("payment_date", { ascending: false });
          
          if (payError) throw payError;
          setPayments(payData || []);
        }
      } catch (error) {
        setBeneficiary(null);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.email]);

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
        request_type_id: "loan" as any, // يجب أن يكون UUID حقيقي
        description: data.description,
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="view">سجل الطلبات</TabsTrigger>
                <TabsTrigger value="emergency">
                  <AlertCircle className="h-4 w-4 ml-2" />
                  فزعة طارئة
                </TabsTrigger>
                <TabsTrigger value="loan">
                  <Wallet className="h-4 w-4 ml-2" />
                  طلب قرض
                </TabsTrigger>
              </TabsList>

              <TabsContent value="view" className="space-y-4">
                <EmptyState 
                  icon={FileText} 
                  title="لا توجد طلبات سابقة" 
                  description="يمكنك تقديم طلب جديد من التبويبات أعلاه" 
                />
              </TabsContent>

              <TabsContent value="emergency">
                <EmergencyRequestForm onSubmit={handleEmergencyRequest} />
              </TabsContent>

              <TabsContent value="loan">
                <LoanRequestForm onSubmit={handleLoanRequest} />
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

        {/* Internal Messages Dialog */}
        <InternalMessagesDialog
          open={messagesDialogOpen}
          onOpenChange={setMessagesDialogOpen}
        />
      </div>
    </div>
  );
};

export default BeneficiaryDashboard;
