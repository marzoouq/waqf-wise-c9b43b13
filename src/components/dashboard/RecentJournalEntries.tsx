import { memo } from "react";
import { useRecentJournalEntries } from "@/hooks/dashboard/useRecentJournalEntries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date";
import { FileText } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ErrorState } from "@/components/shared/ErrorState";

const RecentJournalEntries = memo(() => {
  const { data: entries, isLoading, error, refetch } = useRecentJournalEntries(5);

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl font-bold">آخر القيود المحاسبية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل القيود" message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base md:text-xl font-bold">آخر القيود المحاسبية</CardTitle>
      </CardHeader>
      <CardContent>
        {!entries || entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد قيود محاسبية بعد</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-2 sm:gap-4 pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-mono font-medium truncate">
                      {entry.entry_number}
                    </p>
                    <StatusBadge status={entry.status} showIcon={false} />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {entry.description}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {formatDate(entry.entry_date, "dd MMMM yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

RecentJournalEntries.displayName = "RecentJournalEntries";

export default RecentJournalEntries;
