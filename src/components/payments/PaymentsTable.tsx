import { Receipt, CreditCard, Edit, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">جاري التحميل...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">لا توجد سندات</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">النوع</TableHead>
            <TableHead className="text-right">رقم السند</TableHead>
            <TableHead className="text-right">التاريخ</TableHead>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="hidden lg:table-cell text-right">رقم العقد</TableHead>
            <TableHead className="hidden xl:table-cell text-right">العقار</TableHead>
            <TableHead className="text-right">المبلغ</TableHead>
            <TableHead className="hidden lg:table-cell text-right">الطريقة</TableHead>
            <TableHead className="hidden lg:table-cell text-right">الوصف</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <Badge variant={payment.payment_type === "receipt" ? "default" : "secondary"}>
                  <div className="flex items-center gap-1">
                    {getPaymentTypeIcon(payment.payment_type)}
                    <span className="text-xs">{getPaymentTypeLabel(payment.payment_type)}</span>
                  </div>
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs sm:text-sm">{payment.payment_number}</TableCell>
              <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                {format(new Date(payment.payment_date), "dd MMM yyyy", { locale: ar })}
              </TableCell>
              <TableCell className="text-xs sm:text-sm">{payment.payer_name}</TableCell>
              <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                {payment.contract_number ? (
                  <Badge variant="outline" className="text-xs">
                    {payment.contract_number}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="hidden xl:table-cell text-xs sm:text-sm max-w-[150px] truncate">
                {payment.property_name || <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell className="font-bold text-xs sm:text-sm whitespace-nowrap">
                {Number(payment.amount).toLocaleString()} ر.س
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                {getPaymentMethodLabel(payment.payment_method)}
              </TableCell>
              <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-xs sm:text-sm">
                {payment.description}
              </TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => onPrint(payment)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(payment)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(payment)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
