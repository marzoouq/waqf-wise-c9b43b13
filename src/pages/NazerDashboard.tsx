import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, Clock, TrendingUp, Users, Building2, Wallet, FileText } from "lucide-react";
import FinancialStats from "@/components/dashboard/FinancialStats";
import RevenueExpenseChart from "@/components/dashboard/RevenueExpenseChart";
import AccountDistributionChart from "@/components/dashboard/AccountDistributionChart";
import BudgetComparisonChart from "@/components/dashboard/BudgetComparisonChart";
import AccountingStats from "@/components/dashboard/AccountingStats";
import FamiliesStats from "@/components/dashboard/FamiliesStats";
import RequestsStats from "@/components/dashboard/RequestsStats";
import { LoadingState } from "@/components/shared/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function NazerDashboard() {
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setIsLoading(true);
    
    // جلب الموافقات المعلقة للتوزيعات
    const { data: distributionApprovals } = await supabase
      .from('distribution_approvals')
      .select('*, distributions(*)')
      .eq('status', 'معلق')
      .eq('level', 3); // المستوى 3 = الناظر

    // جلب الموافقات المعلقة للطلبات
    const { data: requestApprovals } = await supabase
      .from('request_approvals')
      .select('*, beneficiary_requests(*, beneficiaries(*))')
      .eq('status', 'معلق')
      .eq('level', 3);

    setPendingApprovals([
      ...(distributionApprovals || []),
      ...(requestApprovals || [])
    ]);
    
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل لوحة تحكم الناظر..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gradient-primary">
                لوحة تحكم الناظر
              </h1>
              <p className="text-muted-foreground">
                نظرة شاملة على جميع عمليات الوقف والموافقات
              </p>
            </div>
          </div>
        </header>

        {/* Pending Approvals Alert */}
        {pendingApprovals.length > 0 && (
          <Card className="border-warning bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <Clock className="h-5 w-5" />
                موافقات معلقة تحتاج لاعتمادك
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingApprovals.slice(0, 5).map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {approval.distributions?.month || approval.beneficiary_requests?.request_type_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {approval.distributions?.total_amount ? 
                          `المبلغ: ${approval.distributions.total_amount.toLocaleString('ar-SA')} ريال` :
                          `طلب من ${approval.beneficiary_requests?.beneficiaries?.full_name}`
                        }
                      </p>
                    </div>
                    <Button onClick={() => navigate('/approvals')}>
                      مراجعة
                    </Button>
                  </div>
                ))}
              </div>
              {pendingApprovals.length > 5 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/approvals')}
                >
                  عرض جميع الموافقات ({pendingApprovals.length})
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Statistics Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
          <FinancialStats />
          <FamiliesStats />
          <RequestsStats />
          <AccountingStats />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <RevenueExpenseChart />
          <AccountDistributionChart />
        </div>

        <BudgetComparisonChart />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate('/approvals')}
              >
                <CheckCircle className="h-6 w-6" />
                <span>الموافقات</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate('/reports')}
              >
                <FileText className="h-6 w-6" />
                <span>التقارير</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate('/funds')}
              >
                <Wallet className="h-6 w-6" />
                <span>المصارف</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate('/beneficiaries')}
              >
                <Users className="h-6 w-6" />
                <span>المستفيدون</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
