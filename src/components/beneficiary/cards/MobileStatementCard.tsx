import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, FileText, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { MaskedValue } from "@/components/shared/MaskedValue";

interface MobileStatementCardProps {
  payment: {
    id: string;
    reference_number?: string;
    payment_date: string;
    description?: string;
    amount: number;
    payment_method?: string;
    status: string;
  };
  masked?: boolean;
}

export function MobileStatementCard({ payment, masked = false }: MobileStatementCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="font-mono text-sm font-semibold">{payment.reference_number || "—"}</p>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {payment.description || "—"}
            </p>
          </div>
          <Badge 
            variant={payment.status === 'مدفوع' ? 'default' : 'secondary'}
            className="shrink-0"
          >
            {payment.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              التاريخ
            </div>
            <p className="text-sm font-medium">
              {format(new Date(payment.payment_date), "dd/MM/yyyy", { locale: ar })}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              المبلغ
            </div>
            <p className="text-sm font-bold">—</p>
          </div>
        </div>

        {payment.payment_method && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <CreditCard className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{payment.payment_method}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
