import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";

interface MobileDistributionCardProps {
  payment: {
    id: string;
    reference_number: string | null;
    payment_date: string | null;
    amount: number;
    status: string;
  };
}

export function MobileDistributionCard({ payment }: MobileDistributionCardProps) {
  const { settings } = useVisibilitySettings();

  const getStatusIcon = () => {
    return payment.status === 'مدفوع' ? CheckCircle2 : Clock;
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className="hover-scale">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TrendingUp className="h-5 w-5 text-success shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate font-mono">
                {payment.reference_number || "—"}
              </h3>
              <p className="text-xs text-muted-foreground">توزيع شهري</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="gap-1"
          >
            <StatusIcon className="h-3 w-3" />
            {payment.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>التاريخ:</span>
          </div>
          <div className="text-left">
            {payment.payment_date 
              ? format(new Date(payment.payment_date), "dd/MM/yyyy", { locale: ar })
              : "—"}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <span>المبلغ المخصص:</span>
          </div>
          <div className="text-left font-semibold">
            <MaskedValue
              value={Number(payment.amount).toLocaleString("ar-SA")}
              type="amount"
              masked={settings?.mask_exact_amounts || false}
            /> ر.س
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <span>صافي المبلغ:</span>
          </div>
          <div className="text-left font-bold text-success">
            <MaskedValue
              value={Number(payment.amount).toLocaleString("ar-SA")}
              type="amount"
              masked={settings?.mask_exact_amounts || false}
            /> ر.س
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
