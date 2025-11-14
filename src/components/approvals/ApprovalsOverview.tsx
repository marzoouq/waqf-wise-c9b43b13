import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, FileText } from "lucide-react";

export function ApprovalsOverview() {
  const { data: stats } = useQuery({
    queryKey: ["approvals_overview"],
    queryFn: async () => {
      // موافقات القيود المحاسبية
      const { data: journalApprovals } = await supabase
        .from("approvals")
        .select("status");

      // موافقات التوزيعات
      const { data: distributionApprovals } = await supabase
        .from("distribution_approvals")
        .select("status");

      // موافقات الطلبات
      const { data: requestApprovals } = await supabase
        .from("request_approvals")
        .select("status");

      const allApprovals = [
        ...(journalApprovals || []),
        ...(distributionApprovals || []),
        ...(requestApprovals || []),
      ];

      return {
        total: allApprovals.length,
        pending: allApprovals.filter((a) => a.status === "pending" || a.status === "معلق").length,
        approved: allApprovals.filter((a) => a.status === "approved" || a.status === "موافق").length,
        rejected: allApprovals.filter((a) => a.status === "rejected" || a.status === "مرفوض").length,
      };
    },
  });

  const statCards = [
    {
      title: "إجمالي الموافقات",
      value: stats?.total || 0,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "قيد المراجعة",
      value: stats?.pending || 0,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "موافق عليها",
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "مرفوضة",
      value: stats?.rejected || 0,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={`stat-${stat.title}`} className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}