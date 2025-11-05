import { Building2, Users, Wallet, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const stats = [
    {
      title: "إجمالي المستفيدين",
      value: "1,247",
      icon: Users,
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "إجمالي العقارات",
      value: "89",
      icon: Building2,
      trend: "+3.2%",
      trendUp: true,
    },
    {
      title: "إجمالي الأموال",
      value: "2,450,000 ر.س",
      icon: Wallet,
      trend: "+8.3%",
      trendUp: true,
    },
    {
      title: "المستندات المؤرشفة",
      value: "3,456",
      icon: FileText,
      trend: "+15.7%",
      trendUp: true,
    },
  ];

  const recentActivities = [
    { id: 1, action: "إضافة مستفيد جديد", user: "أحمد محمد", time: "منذ 5 دقائق" },
    { id: 2, action: "تحديث بيانات عقار", user: "فاطمة علي", time: "منذ 15 دقيقة" },
    { id: 3, action: "صرف مستحقات", user: "محمد أحمد", time: "منذ ساعة" },
    { id: 4, action: "رفع مستند جديد", user: "سارة خالد", time: "منذ ساعتين" },
  ];

  const pendingTasks = [
    { id: 1, task: "مراجعة طلب فزعة طارئة", priority: "عالية" },
    { id: 2, task: "اعتماد توزيع الغلة الشهرية", priority: "عالية" },
    { id: 3, task: "تجديد عقد إيجار", priority: "متوسطة" },
    { id: 4, task: "مراجعة بيانات مستفيد", priority: "منخفضة" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
            لوحة التحكم الرئيسية
          </h1>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
            مرحباً بك في منصة إدارة الوقف الإلكترونية
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="shadow-soft hover:shadow-medium transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trendUp ? 'text-success' : 'text-destructive'
                    }`}>
                      <TrendingUp className="h-4 w-4" />
                      {stat.trend}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl font-bold">النشاطات الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="p-2 bg-primary/10 rounded-full">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        بواسطة {activity.user}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-xl font-bold">المهام المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {task.task}
                      </p>
                      <span
                       className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                          task.priority === "عالية"
                            ? "bg-destructive/15 text-destructive border border-destructive/30"
                            : task.priority === "متوسطة"
                            ? "bg-warning/15 text-warning border border-warning/30"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        الأولوية: {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-bold">الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <button className="group p-3 md:p-4 bg-card hover:bg-primary rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 text-right border border-transparent hover:border-primary">
                <Users className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
                <p className="font-medium text-xs md:text-sm text-foreground group-hover:text-primary-foreground transition-colors">إضافة مستفيد</p>
              </button>
              <button className="group p-3 md:p-4 bg-card hover:bg-primary rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 text-right border border-transparent hover:border-primary">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
                <p className="font-medium text-xs md:text-sm text-foreground group-hover:text-primary-foreground transition-colors">إضافة عقار</p>
              </button>
              <button className="group p-3 md:p-4 bg-card hover:bg-primary rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 text-right border border-transparent hover:border-primary">
                <Wallet className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
                <p className="font-medium text-xs md:text-sm text-foreground group-hover:text-primary-foreground transition-colors">توزيع الغلة</p>
              </button>
              <button className="group p-3 md:p-4 bg-card hover:bg-primary rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 text-right border border-transparent hover:border-primary">
                <FileText className="h-5 w-5 md:h-6 md:w-6 mb-2 text-primary group-hover:text-primary-foreground transition-colors" />
                <p className="font-medium text-xs md:text-sm text-foreground group-hover:text-primary-foreground transition-colors">إنشاء تقرير</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
