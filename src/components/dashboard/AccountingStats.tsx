import { FileText, CheckCircle2, FileEdit, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountingStats } from "@/hooks/useAccountingStats";

const AccountingStats = () => {
  const { data, isLoading } = useAccountingStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={`skeleton-${i}`} className="shadow-soft">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      title: "إجمالي القيود",
      value: data.totalEntries,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "القيود المرحّلة",
      value: data.postedEntries,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "مسودات",
      value: data.draftEntries,
      icon: FileEdit,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "ملغية",
      value: data.cancelledEntries,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground line-clamp-1">
                  {stat.title}
                </CardTitle>
                <div className={`p-1 sm:p-1.5 md:p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2 sm:pb-4">
              <div className={`text-lg sm:text-2xl md:text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AccountingStats;
