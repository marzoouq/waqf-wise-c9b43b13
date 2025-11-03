import { Plus, TrendingUp, PieChart, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Funds = () => {
  const funds = [
    {
      id: 1,
      name: "صرف مستحقات العائلات",
      allocated: 500000,
      spent: 350000,
      percentage: 70,
      beneficiaries: 124,
      color: "bg-primary",
    },
    {
      id: 2,
      name: "مصاريف الصيانة",
      allocated: 200000,
      spent: 120000,
      percentage: 60,
      beneficiaries: 0,
      color: "bg-warning",
    },
    {
      id: 3,
      name: "الاحتياطي",
      allocated: 300000,
      spent: 50000,
      percentage: 17,
      beneficiaries: 0,
      color: "bg-success",
    },
    {
      id: 4,
      name: "التطوير والاستثمار",
      allocated: 400000,
      spent: 200000,
      percentage: 50,
      beneficiaries: 0,
      color: "bg-accent",
    },
  ];

  const distributions = [
    {
      id: 1,
      month: "محرم 1446",
      amount: "450,000 ر.س",
      beneficiaries: 124,
      status: "مكتمل",
      date: "2024-07-15",
    },
    {
      id: 2,
      month: "صفر 1446",
      amount: "460,000 ر.س",
      beneficiaries: 126,
      status: "قيد المعالجة",
      date: "2024-08-15",
    },
    {
      id: 3,
      month: "ربيع الأول 1446",
      amount: "470,000 ر.س",
      beneficiaries: 128,
      status: "معلق",
      date: "2024-09-15",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary">
              الأموال والمصارف
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              إدارة أقلام الوقف وتوزيع الغلة
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="shadow-soft w-full md:w-auto"
            >
              <PieChart className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">محاكاة التوزيع</span>
            </Button>
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft w-full md:w-auto">
              <Plus className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">توزيع جديد</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                إجمالي الأموال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                2,450,000 ر.س
              </div>
              <div className="flex items-center gap-1 text-sm text-success mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+8.3%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المصروفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">
                720,000 ر.س
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                من إجمالي 1,400,000 ر.س
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                الرصيد المتاح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                1,730,000 ر.س
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                متاح للتوزيع
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                المستفيدون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                124
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                مستفيد نشط
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funds Allocation */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl font-bold">توزيع المصارف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {funds.map((fund) => (
                <div key={fund.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-foreground">{fund.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>المخصص: {fund.allocated.toLocaleString()} ر.س</span>
                        </div>
                        {fund.beneficiaries > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{fund.beneficiaries} مستفيد</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold text-primary">
                        {fund.spent.toLocaleString()} ر.س
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {fund.percentage}% مصروف
                      </div>
                    </div>
                  </div>
                  <Progress value={fund.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Distributions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl font-bold">التوزيعات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {distributions.map((dist) => (
                <div
                  key={dist.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="font-medium text-foreground">{dist.month}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{dist.date}</span>
                      <span>•</span>
                      <span>{dist.beneficiaries} مستفيد</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <div className="text-lg font-bold text-primary">
                        {dist.amount}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        dist.status === "مكتمل"
                          ? "bg-success/10 text-success"
                          : dist.status === "قيد المعالجة"
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {dist.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Funds;
