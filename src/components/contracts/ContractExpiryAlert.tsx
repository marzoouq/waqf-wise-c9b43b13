import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Calendar, RefreshCw } from "lucide-react";
import { differenceInDays, formatDate } from "@/lib/date";

interface Contract {
  id: string;
  contract_number: string;
  tenant_name: string;
  end_date: string;
  monthly_rent: number;
  property_id?: string;
}

interface ContractExpiryAlertProps {
  contracts: Contract[];
  onRenewClick?: (contract: Contract) => void;
}

export const ContractExpiryAlert = ({ contracts, onRenewClick }: ContractExpiryAlertProps) => {
  const today = new Date();

  // تصفية العقود القريبة من الانتهاء (خلال 90 يوم)
  const expiringContracts = contracts.filter((contract) => {
    const endDate = new Date(contract.end_date);
    const daysRemaining = differenceInDays(endDate, today);
    return daysRemaining > 0 && daysRemaining <= 90;
  }).sort((a, b) => {
    const daysA = differenceInDays(new Date(a.end_date), today);
    const daysB = differenceInDays(new Date(b.end_date), today);
    return daysA - daysB;
  });

  if (expiringContracts.length === 0) {
    return null;
  }

  // تصنيف حسب المدة
  const critical = expiringContracts.filter(c => differenceInDays(new Date(c.end_date), today) <= 30);
  const warning = expiringContracts.filter(c => {
    const days = differenceInDays(new Date(c.end_date), today);
    return days > 30 && days <= 60;
  });
  const info = expiringContracts.filter(c => {
    const days = differenceInDays(new Date(c.end_date), today);
    return days > 60 && days <= 90;
  });

  return (
    <div className="space-y-4">
      {/* تنبيه حرج - خلال 30 يوم */}
      {critical.length > 0 && (
        <Alert variant="destructive" className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold">عقود تنتهي خلال 30 يوم ({critical.length})</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {critical.slice(0, 3).map((contract) => {
                const daysRemaining = differenceInDays(new Date(contract.end_date), today);
                return (
                  <Card key={contract.id} className="p-3 bg-destructive/5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-medium">{contract.contract_number}</div>
                        <div className="text-sm text-muted-foreground">{contract.tenant_name}</div>
                        <div className="text-xs flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(contract.end_date, "dd MMMM yyyy")}
                          <span className="font-bold text-destructive">({daysRemaining} يوم)</span>
                        </div>
                      </div>
                      {onRenewClick && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onRenewClick(contract)}
                          className="gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          تجديد
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
              {critical.length > 3 && (
                <p className="text-xs text-center text-muted-foreground">
                  و {critical.length - 3} عقود أخرى...
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* تحذير - خلال 60 يوم */}
      {warning.length > 0 && (
        <Alert className="border-warning bg-warning/5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="font-bold text-warning">عقود تنتهي خلال 60 يوم ({warning.length})</AlertTitle>
          <AlertDescription>
            <div className="mt-2 text-sm">
              يرجى البدء بإجراءات التجديد للعقود التالية:
              <ul className="list-disc list-inside mt-1 space-y-1">
                {warning.slice(0, 3).map((contract) => (
                  <li key={contract.id}>
                    {contract.contract_number} - {contract.tenant_name}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* معلومة - خلال 90 يوم */}
      {info.length > 0 && (
        <Alert className="border-info bg-info/5">
          <Calendar className="h-4 w-4 text-info" />
          <AlertTitle className="font-bold text-info">عقود تنتهي خلال 90 يوم ({info.length})</AlertTitle>
          <AlertDescription className="text-sm">
            يُنصح بالتواصل مع المستأجرين لمعرفة رغبتهم في التجديد.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
