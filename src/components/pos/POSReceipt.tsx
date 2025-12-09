import { forwardRef } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface POSReceiptProps {
  transaction: {
    transaction_number: string;
    transaction_type: string;
    amount: number;
    payment_method: string;
    payer_name?: string;
    description?: string;
    created_at: string;
  };
  cashierName?: string;
  shiftNumber?: string;
}

export const POSReceipt = forwardRef<HTMLDivElement, POSReceiptProps>(
  ({ transaction, cashierName, shiftNumber }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white p-6 max-w-[300px] mx-auto text-sm font-mono print:p-4"
        dir="rtl"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">وقف مرزوق علي الثبيتي</h2>
          <p className="text-muted-foreground text-xs">إيصال {transaction.transaction_type}</p>
        </div>

        <Separator className="my-3" />

        {/* Transaction Info */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">رقم الإيصال:</span>
            <span className="font-semibold">{transaction.transaction_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">التاريخ:</span>
            <span>
              {format(new Date(transaction.created_at), "yyyy/MM/dd HH:mm", {
                locale: ar,
              })}
            </span>
          </div>
          {shiftNumber && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">رقم الوردية:</span>
              <span>{shiftNumber}</span>
            </div>
          )}
        </div>

        <Separator className="my-3" />

        {/* Payer Info */}
        {transaction.payer_name && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">الاسم:</span>
              <span>{transaction.payer_name}</span>
            </div>
          </div>
        )}

        <Separator className="my-3" />

        {/* Amount */}
        <div className="text-center py-3 bg-muted rounded-lg">
          <p className="text-muted-foreground text-xs mb-1">المبلغ</p>
          <p className="text-2xl font-bold">
            {transaction.amount.toLocaleString("ar-SA")} ريال
          </p>
        </div>

        <Separator className="my-3" />

        {/* Payment Method */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">طريقة الدفع:</span>
          <span className="font-semibold">{transaction.payment_method}</span>
        </div>

        {transaction.description && (
          <div className="mt-2">
            <span className="text-muted-foreground">الوصف:</span>
            <p className="mt-1">{transaction.description}</p>
          </div>
        )}

        <Separator className="my-3" />

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          {cashierName && <p>أمين الصندوق: {cashierName}</p>}
          <p className="mt-2">شكراً لتعاملكم معنا</p>
          <p className="mt-1">هذا الإيصال مولّد إلكترونياً</p>
        </div>
      </div>
    );
  }
);

POSReceipt.displayName = "POSReceipt";
