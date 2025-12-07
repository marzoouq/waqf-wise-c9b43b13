import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Globe } from "lucide-react";
import { useFiscalYearsList } from "@/hooks/fiscal-years";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function CurrentFiscalYearCard() {
  const { activeFiscalYear, closedYearsCount, publishedYearsCount, isLoading } = useFiscalYearsList();

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardContent>
      </Card>
    );
  }

  if (!activeFiscalYear) {
    return (
      <Card className="border-l-4 border-l-warning">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-warning" />
            السنة المالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">لا توجد سنة مالية نشطة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            السنة المالية الحالية
          </CardTitle>
          <div className="flex gap-1">
            {activeFiscalYear.is_published ? (
              <Badge variant="default" className="gap-1 text-xs">
                <Globe className="h-3 w-3" />
                منشورة
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Clock className="h-3 w-3" />
                غير منشورة
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-primary">{activeFiscalYear.name}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(activeFiscalYear.start_date), 'dd MMMM yyyy', { locale: ar })} 
            {' '}-{' '}
            {format(new Date(activeFiscalYear.end_date), 'dd MMMM yyyy', { locale: ar })}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <span className="text-lg font-bold text-foreground">{closedYearsCount}</span>
            <p className="text-xs text-muted-foreground">سنة مؤرشفة</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <span className="text-lg font-bold text-foreground">{publishedYearsCount}</span>
            <p className="text-xs text-muted-foreground">سنة منشورة</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
