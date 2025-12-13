import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Calendar, Globe } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useActiveFiscalYear } from "@/hooks/fiscal-years";

interface FiscalYearPublishStatusProps {
  onPublishClick: () => void;
}

export function FiscalYearPublishStatus({
  onPublishClick,
}: FiscalYearPublishStatusProps) {
  const { activeFiscalYear } = useActiveFiscalYear();

  if (!activeFiscalYear) return null;

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                activeFiscalYear.is_published
                  ? "bg-status-success/10"
                  : "bg-status-warning/10"
              }`}
            >
              {activeFiscalYear.is_published ? (
                <Eye className="h-5 w-5 text-status-success" />
              ) : (
                <EyeOff className="h-5 w-5 text-status-warning" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{activeFiscalYear.name}</span>
                <Badge
                  variant={activeFiscalYear.is_published ? "default" : "secondary"}
                  className={
                    activeFiscalYear.is_published
                      ? "bg-status-success/10 text-status-success hover:bg-status-success/20"
                      : "bg-status-warning/10 text-status-warning hover:bg-status-warning/20"
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
