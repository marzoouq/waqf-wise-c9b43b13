import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Calendar, TrendingUp } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAuth } from "@/hooks/useAuth";

const BeneficiaryDashboard = () => {
  const { user } = useAuth();
  const [beneficiary, setBeneficiary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const { data: benData } = await supabase
          .from("beneficiaries")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        setBeneficiary(benData);

        if (benData) {
          const { data: payData } = await supabase
            .from("payments")
            .select("*")
            .eq("payer_name", benData.full_name)
            .order("payment_date", { ascending: false });
          
          setPayments(payData || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const stats = {
    totalPayments: payments.reduce((sum, p) => sum + Number(p.amount), 0),
    paymentsCount: payments.length,
    lastPaymentDate: payments.length > 0 ? new Date(payments[0].payment_date).toLocaleDateString("ar-SA") : "لا يوجد",
    averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length : 0,
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
        <header>
          <h1 className="text-3xl font-bold text-gradient-primary">مرحباً، {beneficiary.full_name}</h1>
          <p className="text-muted-foreground">عرض المدفوعات والتقارير الشخصية</p>
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
      </div>
    </div>
  );
};

export default BeneficiaryDashboard;
