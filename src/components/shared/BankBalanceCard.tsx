import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Landmark, RefreshCw, Wifi, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFiscalYearPublishStatus } from "@/hooks/useFiscalYearPublishStatus";
import { useAuth } from "@/hooks/useAuth";
import { useBankBalance } from "@/hooks/dashboard/useFinancialCards";

interface BankBalanceCardProps {
  className?: string;
  compact?: boolean;
}

export function BankBalanceCard({ className, compact = false }: BankBalanceCardProps) {
  const { roles } = useAuth();
  const { isCurrentYearPublished, isLoading: publishStatusLoading } = useFiscalYearPublishStatus();
  
  // التحقق من أن المستخدم مستفيد/وارث وليس موظف
  const isBeneficiaryOrHeir = roles.some(r => ['beneficiary', 'waqf_heir'].includes(r)) && 
                              !roles.some(r => ['admin', 'nazer', 'accountant', 'cashier'].includes(r));

  // جلب رصيد البنك مع Realtime من hook
  const { data: bankBalance, isLoading, lastUpdated, isLive } = useBankBalance();

  const balance = bankBalance?.current_balance || 0;

  // إخفاء الرصيد للمستفيدين/الورثة إذا لم تكن السنة منشورة
  if (isBeneficiaryOrHeir && !publishStatusLoading && !isCurrentYearPublished) {
    return (
      <Alert className={`border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 ${className}`}>
        <EyeOff className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">الرصيد البنكي مخفي</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          سيتم عرض الرصيد البنكي بعد اعتماد ونشر السنة المالية من قبل الناظر
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || publishStatusLoading) {
    return (
      <Card className={className}>
        <CardHeader className={compact ? "pb-2" : ""}>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* مؤشر التحديث المباشر */}
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success via-success/50 to-success animate-pulse" />
      )}
      
      <CardHeader className={`flex flex-row items-center justify-between ${compact ? "pb-2 pt-4" : ""}`}>
        <CardTitle className={`flex items-center gap-2 ${compact ? "text-sm" : "text-base"}`}>
          <div className="p-2 rounded-lg bg-primary/10">
            <Landmark className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-primary`} />
          </div>
          الرصيد البنكي
        </CardTitle>
        
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge variant="outline" className="gap-1 text-success border-success/30 bg-success/10 animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              يتم التحديث
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Wifi className="h-3 w-3" />
              مباشر
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className={compact ? "pt-0" : ""}>
        <div className="space-y-2">
          <div className={`font-bold text-primary ${compact ? "text-2xl" : "text-3xl"}`}>
            {balance.toLocaleString("ar-SA")} ر.س
          </div>
          
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              آخر تحديث: {lastUpdated.toLocaleTimeString("ar-SA")}
            </p>
          )}
          
          {!compact && (
            <p className="text-sm text-muted-foreground mt-2">
              إجمالي النقدية المتاحة في حسابات الوقف البنكية
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}