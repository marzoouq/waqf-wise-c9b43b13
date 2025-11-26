import { Card } from "@/components/ui/card";
import { UnifiedDashboardLayout } from "@/components/dashboard/UnifiedDashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building, FileText, AlertTriangle, Activity, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, beneficiaries, properties, activities] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }),
        supabase.from("beneficiaries").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase.from("activities").select("*", { count: "exact", head: true }),
      ]);

      return {
        users: users.count || 0,
        beneficiaries: beneficiaries.count || 0,
        properties: properties.count || 0,
        activities: activities.count || 0,
      };
    },
  });

  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const statsCards = [
    {
      title: "إجمالي المستخدمين",
      value: stats?.users || 0,
      icon: Users,
      color: "bg-blue-500",
      link: "/users",
    },
    {
      title: "إجمالي المستفيدين",
      value: stats?.beneficiaries || 0,
      icon: Users,
      color: "bg-green-500",
      link: "/beneficiaries",
    },
    {
      title: "إجمالي العقارات",
      value: stats?.properties || 0,
      icon: Building,
      color: "bg-purple-500",
      link: "/properties",
    },
    {
      title: "النشاطات الأخيرة",
      value: stats?.activities || 0,
      icon: Activity,
      color: "bg-orange-500",
      link: "/audit-logs",
    },
  ];

  const quickLinks = [
    {
      title: "إدارة المستخدمين",
      description: "إضافة وتعديل المستخدمين والصلاحيات",
      icon: Users,
      link: "/users",
    },
    {
      title: "سجلات التدقيق",
      description: "متابعة جميع العمليات في النظام",
      icon: FileText,
      link: "/audit-logs",
    },
    {
      title: "الإعدادات",
      description: "تكوين النظام والإعدادات العامة",
      icon: Settings,
      link: "/settings",
    },
    {
      title: "المراقبة والأداء",
      description: "مراقبة أداء النظام والموارد",
      icon: Activity,
      link: "/monitoring",
    },
  ];

  return (
    <UnifiedDashboardLayout
      role="admin"
      title="لوحة تحكم المشرف"
      description="إدارة شاملة لجميع عمليات النظام"
    >
      {/* إحصائيات النظام */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(stat.link)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* الروابط السريعة */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">الوصول السريع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex-col items-start p-4 text-right"
                onClick={() => navigate(link.link)}
              >
                <Icon className="h-5 w-5 mb-2" />
                <div className="font-semibold">{link.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {link.description}
                </div>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* النشاطات الأخيرة */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          النشاطات الأخيرة
        </h3>
        <div className="space-y-3">
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b last:border-b-0"
              >
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.user_name}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleString("ar-SA")}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              لا توجد نشاطات حديثة
            </p>
          )}
        </div>
      </Card>

      {/* تنبيهات النظام */}
      <Card className="p-6 border-orange-200 bg-orange-50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          تنبيهات النظام
        </h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <div className="h-2 w-2 bg-orange-500 rounded-full mt-1.5" />
            <p>النظام يعمل بشكل طبيعي</p>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <div className="h-2 w-2 bg-green-500 rounded-full mt-1.5" />
            <p>آخر نسخة احتياطية: اليوم</p>
          </div>
        </div>
      </Card>
    </UnifiedDashboardLayout>
  );
}
