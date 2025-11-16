import { Badge } from "@/components/ui/badge";

interface InvoiceStatusBadgeProps {
  status: string;
}

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
      case "مسودة":
        return { label: "مسودة", variant: "secondary" as const };
      case "sent":
      case "مرسلة":
        return { label: "مرسلة", variant: "default" as const };
      case "paid":
      case "مدفوعة":
        return { label: "مدفوعة", variant: "default" as const, className: "bg-green-600 text-white" };
      case "partially_paid":
      case "مدفوعة جزئياً":
        return { label: "مدفوعة جزئياً", variant: "outline" as const, className: "border-yellow-600 text-yellow-600" };
      case "overdue":
      case "متأخرة":
        return { label: "متأخرة", variant: "destructive" as const };
      case "cancelled":
      case "ملغاة":
        return { label: "ملغاة", variant: "outline" as const };
      default:
        return { label: status, variant: "secondary" as const };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={`font-arabic text-xs sm:text-sm md:text-base ${config.className || ""}`}>
      {config.label}
    </Badge>
  );
}
