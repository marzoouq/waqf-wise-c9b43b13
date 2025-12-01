import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, User, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { MaskedValue } from "@/components/shared/MaskedValue";

interface MobileContractCardProps {
  contract: {
    id: string;
    contract_number: string;
    tenant_name: string;
    monthly_rent: number;
    start_date: string;
    end_date: string;
    status: string;
    properties?: {
      name: string;
    } | null;
  };
  masked?: boolean;
  showRevenue?: boolean;
  maskTenant?: boolean;
}

export function MobileContractCard({ 
  contract, 
  masked = false, 
  showRevenue = true,
  maskTenant = false 
}: MobileContractCardProps) {
  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
      "نشط": { variant: "default" },
      "منتهي": { variant: "destructive" },
      "معلق": { variant: "secondary" },
    };

    return <Badge variant={config[status]?.variant || "secondary"}>{status}</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="font-mono text-sm font-semibold">{contract.contract_number}</p>
            </div>
            {contract.properties?.name && (
              <p className="text-xs text-muted-foreground">{contract.properties.name}</p>
            )}
          </div>
          {getStatusBadge(contract.status)}
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-sm font-medium">
              {maskTenant ? "مستأجر" : contract.tenant_name}
            </p>
          </div>

          {showRevenue && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                الإيجار الشهري
              </div>
              <p className="text-sm font-bold text-success">
                <MaskedValue
                  value={Number(contract.monthly_rent).toLocaleString("ar-SA")}
                  type="amount"
                  masked={masked}
                /> ريال
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(contract.start_date), "dd/MM/yyyy", { locale: ar })}
            </div>
            <span>←</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(contract.end_date), "dd/MM/yyyy", { locale: ar })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
