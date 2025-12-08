import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { useApprovalsOverview } from "@/hooks/approvals";

export function ApprovalsOverview() {
  const { data: stats } = useApprovalsOverview();

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
