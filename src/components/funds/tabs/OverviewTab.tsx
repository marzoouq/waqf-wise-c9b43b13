import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Database } from "@/integrations/supabase/types";

type Distribution = Database['public']['Tables']['distributions']['Row'];

interface OverviewTabProps {
  summaryStats: {
    totalAllocated: number;
    totalSpent: number;
    totalAvailable: number;
    activeBeneficiaries: number;
  };
  distributions: Distribution[];
}

export function OverviewTab({ summaryStats, distributions }: OverviewTabProps) {
  const spendingPercentage = summaryStats.totalAllocated > 0
    ? (summaryStats.totalSpent / summaryStats.totalAllocated) * 100
    : 0;

  const totalDistributed = distributions.reduce((sum, d) => sum + (d.distributable_amount || 0), 0);
  const totalBeneficiaries = distributions.reduce((sum, d) => sum + d.beneficiaries_count, 0);

  return (
    <div className="space-y-6">
      {/* إحصائيات الأموال */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="shadow-elegant border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">إجمالي المخصص</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {summaryStats.totalAllocated.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">ريال</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">المصروف</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {summaryStats.totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">ريال</p>
            <Progress value={spendingPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">المتاح</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {summaryStats.totalAvailable.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">ريال</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">المستفيدون النشطون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {summaryStats.activeBeneficiaries}
            </div>
            <p className="text-xs text-muted-foreground">مستفيد</p>
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات التوزيعات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">إجمالي التوزيعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{distributions.length}</div>
            <p className="text-xs text-muted-foreground">عدد التوزيعات المسجلة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">المبلغ الموزع</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalDistributed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">المستفيدون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalBeneficiaries}</div>
            <p className="text-xs text-muted-foreground">إجمالي المستفيدين</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
