import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";

interface MobileStatementCardProps {
  payment: {
    id: string;
    reference_number: string | null;
    payment_date: string | null;
    description: string | null;
    amount: number;
    payment_method: string | null;
    status: string;
  };
}

export function MobileStatementCard({ payment }: MobileStatementCardProps) {
  const { settings } = useVisibilitySettings();

  return (
    <Card className="hover-scale">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CreditCard className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate font-mono">
                {payment.reference_number || "—"}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {payment.description || "—"}
              </p>
            </div>
          </div>
          <Badge
            variant={payment.status === 'مدفوع' ? 'outline' : 'secondary'}
            className={payment.status === 'مدفوع' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}
          >
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
            <FileText className="h-3 w-3" />
            <span>الطريقة:</span>
          </div>
          <div className="text-left">
            {payment.payment_method || "—"}
          </div>

          <div className="flex items-center gap-1 text-success font-semibold">
            <span>المبلغ:</span>
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
