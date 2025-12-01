import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Building2, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
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
}

export function MobileContractCard({ contract }: MobileContractCardProps) {
  const { settings } = useVisibilitySettings();

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
      "نشط": { variant: "default" },
      "منتهي": { variant: "destructive" },
      "معلق": { variant: "secondary" },
    };

    return <Badge variant={config[status]?.variant || "secondary"}>{status}</Badge>;
  };

  return (
    <Card className="hover-scale">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{contract.contract_number}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {settings?.mask_tenant_info ? "مستأجر" : contract.tenant_name}
              </p>
            </div>
          </div>
          {getStatusBadge(contract.status)}
        </div>

        {contract.properties && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{contract.properties.name}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-success" />
            <span className="text-muted-foreground">الإيجار:</span>
          </div>
          <div className="text-left font-semibold">
            {settings?.show_property_revenues ? (
              <>
                <MaskedValue
                  value={Number(contract.monthly_rent).toLocaleString("ar-SA")}
                  type="amount"
                  masked={settings?.mask_exact_amounts || false}
                /> ر.س
              </>
            ) : "—"}
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">البداية:</span>
          </div>
          <div className="text-left">
            {format(new Date(contract.start_date), "dd/MM/yyyy", { locale: ar })}
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-destructive" />
            <span className="text-muted-foreground">الانتهاء:</span>
          </div>
          <div className="text-left">
            {format(new Date(contract.end_date), "dd/MM/yyyy", { locale: ar })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
