import { memo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { FileText } from "lucide-react";

const RecentJournalEntries = memo(() => {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["recent_journal_entries"],
    queryFn: async () => {
      // Optimized: Select only needed fields
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, entry_number, description, status, entry_date")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });

  const getStatusBadge = useCallback((status: string) => {
    type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
    const variants: Record<string, { label: string; variant: BadgeVariant }> = {
      draft: { label: "مسودة", variant: "secondary" },
      posted: { label: "مرحّل", variant: "default" },
      cancelled: { label: "ملغى", variant: "destructive" },
    };
    const config = variants[status] || { label: status, variant: "outline" as BadgeVariant };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }, []);

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
                    {getStatusBadge(entry.status)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {entry.description}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {format(new Date(entry.entry_date), "dd MMMM yyyy", {
                      locale: ar,
                    })}
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
