import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  Users,
  Database
} from "lucide-react";
import { useAuditLogsStats } from "@/hooks/system/useAuditLogsEnhanced";

interface AuditStatsCardsProps {
  dateRange?: { start: string; end: string };
}

export function AuditStatsCards({ dateRange }: AuditStatsCardsProps) {
  const { data: stats, isLoading } = useAuditLogsStats(dateRange);

  const statItems = [
    {
      title: "إجمالي السجلات",
      value: stats?.totalLogs || 0,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "عمليات الإضافة",
      value: stats?.insertCount || 0,
      icon: Plus,
      color: "text-status-success",
      bgColor: "bg-status-success/10",
    },
    {
      title: "عمليات التعديل",
      value: stats?.updateCount || 0,
      icon: Edit,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "عمليات الحذف",
      value: stats?.deleteCount || 0,
      icon: Trash2,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "تنبيهات حرجة",
      value: stats?.criticalCount || 0,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "المستخدمون النشطون",
      value: stats?.uniqueUsers || 0,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    {item.title}
                  </p>
                  <p className="text-xl font-bold">
                    {isLoading ? (
                      <span className="inline-block h-6 w-12 bg-muted animate-pulse rounded" />
                    ) : (
                      item.value.toLocaleString('ar-SA')
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
