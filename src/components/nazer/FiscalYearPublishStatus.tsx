import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Calendar, Globe } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface FiscalYearPublishStatusProps {
  onPublishClick: () => void;
}

export function FiscalYearPublishStatus({
  onPublishClick,
}: FiscalYearPublishStatusProps) {
  const { data: activeFiscalYear } = useQuery({
    queryKey: ["active-fiscal-year-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .eq("is_active", true)
        .single();
      if (error) return null;
      return data;
    },
  });

  if (!activeFiscalYear) return null;

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                activeFiscalYear.is_published
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-amber-100 dark:bg-amber-900/30"
              }`}
            >
              {activeFiscalYear.is_published ? (
                <Eye className="h-5 w-5 text-green-600" />
              ) : (
                <EyeOff className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{activeFiscalYear.name}</span>
                <Badge
                  variant={activeFiscalYear.is_published ? "default" : "secondary"}
                  className={
                    activeFiscalYear.is_published
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  }
                >
                  {activeFiscalYear.is_published ? "منشورة للورثة" : "غير منشورة"}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(activeFiscalYear.start_date), "yyyy/MM/dd", {
                  locale: ar,
                })}{" "}
                -{" "}
                {format(new Date(activeFiscalYear.end_date), "yyyy/MM/dd", {
                  locale: ar,
                })}
              </div>
            </div>
          </div>

          {!activeFiscalYear.is_published && (
            <Button onClick={onPublishClick} variant="outline" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              نشر للورثة
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
