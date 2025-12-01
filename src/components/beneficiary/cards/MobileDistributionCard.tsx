import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { MaskedValue } from "@/components/shared/MaskedValue";

interface MobileDistributionCardProps {
  distribution: {
    id: string;
    reference_number?: string;
    payment_date: string;
    amount: number;
    status: string;
  };
  masked?: boolean;
}

export function MobileDistributionCard({ distribution, masked = false }: MobileDistributionCardProps) {
  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: typeof CheckCircle2; variant: "default" | "secondary" | "outline" }> = {
      "مدفوع": { icon: CheckCircle2, variant: "outline" },
      "معلق": { icon: Clock, variant: "secondary" },
      "قيد المعالجة": { icon: Clock, variant: "default" },
    };

    const s = config[status] || { icon: Clock, variant: "secondary" };
    const Icon = s.icon;

    return (
      <Badge variant={s.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">رقم التوزيع</p>
            <p className="font-mono font-semibold">{distribution.reference_number || "—"}</p>
          </div>
          {getStatusBadge(distribution.status || "معلق")}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              التاريخ
            </div>
            <p className="text-sm font-medium">
              {format(new Date(distribution.payment_date), "dd/MM/yyyy", { locale: ar })}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              المبلغ
            </div>
            <p className="text-sm font-bold text-success">
              <MaskedValue
                value={Number(distribution.amount || 0).toLocaleString("ar-SA")}
                type="amount"
                masked={masked}
              /> ريال
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
