import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/shared/ExportButton";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PaymentsHeaderProps {
  onAddPayment: () => void;
  payments: any[];
}

export function PaymentsHeader({ onAddPayment, payments }: PaymentsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold">سندات القبض والصرف</h1>
        <p className="text-muted-foreground mt-1">إدارة جميع سندات القبض والصرف المالية</p>
      </div>
      <div className="flex gap-2">
        <ExportButton
          data={payments}
          filename="payments"
          title="سندات القبض والصرف"
          headers={["payment_number", "payment_type", "payment_date", "payer_name", "amount"]}
        />
        <Button onClick={onAddPayment} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">سند جديد</span>
        </Button>
      </div>
    </div>
  );
}
