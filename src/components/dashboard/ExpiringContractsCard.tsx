import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Eye } from "lucide-react";
import { useContracts } from "@/hooks/useContracts";
import { differenceInDays, format } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export const ExpiringContractsCard = () => {
  const { contracts } = useContracts();
  const navigate = useNavigate();
  const today = new Date();

  // تصفية العقود القريبة من الانتهاء (خلال 90 يوم)
  const expiringContracts = (contracts || [])
    .filter((contract) => {
      const endDate = new Date(contract.end_date);
      const daysRemaining = differenceInDays(endDate, today);
      return contract.status === 'نشط' && daysRemaining > 0 && daysRemaining <= 90;
    })
    .sort((a, b) => {
      const daysA = differenceInDays(new Date(a.end_date), today);
      const daysB = differenceInDays(new Date(b.end_date), today);
      return daysA - daysB;
    })
    .slice(0, 5); // أول 5 عقود فقط

  const critical = expiringContracts.filter(c => 
    differenceInDays(new Date(c.end_date), today) <= 30
  ).length;

  const getDaysRemaining = (endDate: string) => {
    return differenceInDays(new Date(endDate), today);
  };

  const getSeverityBadge = (days: number) => {
    if (days <= 30) {
      return { variant: "destructive" as const, label: "عاجل", color: "bg-destructive/10 text-destructive border-destructive/20" };
    }
    if (days <= 60) {
      return { variant: "secondary" as const, label: "تحذير", color: "bg-warning/10 text-warning border-warning/20" };
    }
    return { variant: "outline" as const, label: "قريب", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
  };

  if (expiringContracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            العقود القريبة من الانتهاء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-3">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">
              لا توجد عقود قريبة من الانتهاء
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={critical > 0 ? "border-destructive" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${critical > 0 ? 'text-destructive' : ''}`} />
            العقود القريبة من الانتهاء
          </div>
          {critical > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {critical} عاجل
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expiringContracts.map((contract) => {
            const daysRemaining = getDaysRemaining(contract.end_date);
            const severity = getSeverityBadge(daysRemaining);

            return (
              <div 
                key={contract.id} 
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">
                      {contract.contract_number}
                    </span>
                    <Badge 
                      variant={severity.variant}
                      className={`text-xs ${severity.color}`}
                    >
                      {daysRemaining} يوم
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {contract.tenant_name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(contract.end_date), "dd MMM yyyy", { locale: ar })}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/properties')}
                  className="gap-1 flex-shrink-0"
                >
                  <Eye className="h-3 w-3" />
                  <span className="hidden sm:inline">عرض</span>
                </Button>
              </div>
            );
          })}

          {expiringContracts.length >= 5 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/properties')}
            >
              عرض جميع العقود
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
