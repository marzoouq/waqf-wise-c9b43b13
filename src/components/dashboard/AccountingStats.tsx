import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, FileX, PenSquare } from "lucide-react";

const AccountingStats = memo(() => {
  const { data: stats } = useQuery({
    queryKey: ["accounting_stats"],
    queryFn: async () => {
      // Optimized: Select only status field
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("status");
      
      if (error) throw error;

      const totalEntries = entries?.length || 0;
      const draftEntries = entries?.filter((e) => e.status === "draft").length || 0;
      const postedEntries = entries?.filter((e) => e.status === "posted").length || 0;
      const cancelledEntries = entries?.filter((e) => e.status === "cancelled").length || 0;

      return {
        totalEntries,
        draftEntries,
        postedEntries,
        cancelledEntries,
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes cache
  });

  const statCards = [
    {
      title: "إجمالي القيود",
      value: stats?.totalEntries || 0,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "القيود المرحّلة",
      value: stats?.postedEntries || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "القيود المسودة",
      value: stats?.draftEntries || 0,
      icon: PenSquare,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      title: "القيود الملغاة",
      value: stats?.cancelledEntries || 0,
      icon: FileX,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

AccountingStats.displayName = "AccountingStats";

export default AccountingStats;
