import { Receipt, CreditCard, Edit, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, arLocale as ar } from "@/lib/date";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";

interface Payment {
  id: string;
  payment_number: string;
  payment_type: string;
  payment_date: string;
  payer_name: string;
  amount: number;
  payment_method: string;
  description: string;
  contract_number?: string;
  property_name?: string;
}

interface PaymentsTableProps {
  payments: Payment[];
  isLoading: boolean;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  onPrint: (payment: Payment) => void;
}

export function PaymentsTable({
  payments,
  isLoading,
  onEdit,
  onDelete,
  onPrint,
}: PaymentsTableProps) {
  const getPaymentTypeLabel = (type: string) => {
    return type === "receipt" ? "قبض" : "صرف";
  };

  const getPaymentTypeIcon = (type: string) => {
    return type === "receipt" ? (
      <Receipt className="h-4 w-4 text-green-600" />
    ) : (
      <CreditCard className="h-4 w-4 text-red-600" />
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "نقداً",
      bank_transfer: "تحويل بنكي",
      check: "شيك",
      credit_card: "بطاقة ائتمان",
    };
    return labels[method] || method;
  };

  const columns: Column<Payment>[] = [
    {
      key: "payment_type",
      label: "النوع",
      render: (value: string, row: Payment) => (
        <Badge variant={value === "receipt" ? "default" : "secondary"}>
          <div className="flex items-center gap-1">
            {getPaymentTypeIcon(value)}
            <span className="text-xs">{getPaymentTypeLabel(value)}</span>
          </div>
        </Badge>
      )
    },
    {
      key: "payment_number",
      label: "رقم السند",
      render: (value: string) => (
        <span className="font-mono text-xs sm:text-sm">{value}</span>
      )
    },
    {
      key: "payment_date",
      label: "التاريخ",
      render: (value: string) => (
        <span className="text-xs sm:text-sm whitespace-nowrap">
          {format(new Date(value), "dd MMM yyyy", { locale: ar })}
        </span>
      )
    },
    {
      key: "payer_name",
      label: "الاسم",
      render: (value: string) => (
        <span className="text-xs sm:text-sm">{value}</span>
      )
    },
    {
      key: "contract_number",
      label: "رقم العقد",
      hideOnTablet: true,
      render: (value?: string) => value ? (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
    {
      key: "property_name",
      label: "العقار",
      hideOnTablet: true,
      render: (value?: string) => (
        <span className="text-xs sm:text-sm max-w-[150px] truncate">
          {value || <span className="text-muted-foreground">-</span>}
        </span>
      )
    },
    {
      key: "amount",
      label: "المبلغ",
      render: (value: number) => (
        <span className="font-bold text-xs sm:text-sm whitespace-nowrap">
          {Number(value).toLocaleString()} ر.س
        </span>
      )
    },
    {
      key: "payment_method",
      label: "الطريقة",
      hideOnTablet: true,
      render: (value: string) => (
        <span className="text-xs sm:text-sm">
          {getPaymentMethodLabel(value)}
        </span>
      )
    },
    {
      key: "description",
      label: "الوصف",
      hideOnTablet: true,
      render: (value: string) => (
        <span className="text-xs sm:text-sm max-w-[200px] truncate">
          {value}
        </span>
      )
    }
  ];

  return (
    <UnifiedDataTable
      columns={columns}
      data={payments}
      loading={isLoading}
      emptyMessage="لا توجد سندات"
      actions={(payment: Payment) => (
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPrint(payment)}
            title="طباعة"
            className="hover:bg-primary/10"
          >
            <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(payment)}
            title="تعديل"
            className="hover:bg-primary/10"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(payment)}
            title="حذف"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}
      showMobileScrollHint={true}
    />
  );
}
