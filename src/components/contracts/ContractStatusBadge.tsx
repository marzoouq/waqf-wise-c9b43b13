import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { differenceInDays } from "@/lib/date";

interface ContractStatusBadgeProps {
  startDate: string;
  endDate: string;
  status: string;
}

export const ContractStatusBadge = ({ startDate, endDate, status }: ContractStatusBadgeProps) => {
  const today = new Date();
  const end = new Date(endDate);
  const daysRemaining = differenceInDays(end, today);

  // تحديد الحالة والألوان
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";
  let icon = <CheckCircle className="h-3 w-3" />;
  let label = "نشط";
  let colorClass = "bg-success/10 text-success border-success/20";

  if (status === "منتهي" || status === "ملغي") {
    badgeVariant = "destructive";
    icon = <XCircle className="h-3 w-3" />;
    label = status;
    colorClass = "bg-destructive/10 text-destructive border-destructive/20";
  } else if (status === "مسودة") {
    badgeVariant = "outline";
    icon = <Clock className="h-3 w-3" />;
    label = "مسودة";
    colorClass = "bg-muted/10 text-muted-foreground border-muted/20";
  } else if (daysRemaining <= 0) {
    badgeVariant = "destructive";
    icon = <XCircle className="h-3 w-3" />;
    label = "منتهي";
    colorClass = "bg-destructive/10 text-destructive border-destructive/20";
  } else if (daysRemaining <= 30) {
    badgeVariant = "destructive";
    icon = <AlertCircle className="h-3 w-3" />;
    label = `ينتهي خلال ${daysRemaining} يوم`;
    colorClass = "bg-destructive/10 text-destructive border-destructive/20";
  } else if (daysRemaining <= 60) {
    badgeVariant = "secondary";
    icon = <AlertCircle className="h-3 w-3" />;
    label = `ينتهي خلال ${daysRemaining} يوم`;
    colorClass = "bg-warning/10 text-warning border-warning/20";
  } else if (daysRemaining <= 90) {
    badgeVariant = "outline";
    icon = <Clock className="h-3 w-3" />;
    label = `ينتهي خلال ${daysRemaining} يوم`;
    colorClass = "bg-blue-500/10 text-blue-600 border-blue-500/20";
  }

  return (
    <Badge variant={badgeVariant} className={`gap-1 ${colorClass}`}>
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </Badge>
  );
};
