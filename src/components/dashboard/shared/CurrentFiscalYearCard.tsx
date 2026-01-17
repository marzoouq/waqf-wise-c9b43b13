import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, Globe, AlertCircle, ExternalLink } from "lucide-react";
import { useFiscalYearsList } from "@/hooks/fiscal-years";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function CurrentFiscalYearCard() {
  const { activeFiscalYear, closedYearsCount, publishedYearsCount, isLoading, error, refetch } = useFiscalYearsList();
  const { roles } = useAuth();
  
  // التحقق من صلاحية المستخدم لنشر السنة المالية
  const canPublish = roles.some(r => ['admin', 'nazer'].includes(r));

  if (isLoading) {
    return (
      <Card className="border-s-4 border-s-primary">
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

  if (error) {
    return (
      <Card className="border-s-4 border-s-destructive">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            السنة المالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">فشل تحميل بيانات السنة المالية</p>
          <button onClick={() => refetch()} className="text-primary text-xs mt-2 hover:underline">
            إعادة المحاولة
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!activeFiscalYear) {
    return (
      <Card className="border-s-4 border-s-warning">
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
    <Card className="border-s-4 border-s-primary bg-gradient-to-br from-primary/5 to-transparent">
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
        
        {/* تنبيه السنة غير المنشورة */}
        {!activeFiscalYear.is_published && canPublish && (
          <Alert className="border-warning/30 bg-warning/10 py-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-xs text-warning flex items-center justify-between">
              <span>السنة المالية غير منشورة للمستفيدين</span>
              <Link 
                to="/fiscal-years-management" 
                className="inline-flex items-center gap-1 text-warning hover:underline font-medium"
              >
                نشر الآن
                <ExternalLink className="h-3 w-3" />
              </Link>
            </AlertDescription>
          </Alert>
        )}
        
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
