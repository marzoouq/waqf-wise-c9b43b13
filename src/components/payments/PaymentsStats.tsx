import { Receipt, CreditCard } from "lucide-react";
import { StatCard } from "@/components/dashboard/DashboardStats";

interface PaymentsStatsProps {
  totalReceipts: number;
  totalVouchers: number;
  totalReceiptsAmount: number;
  totalVouchersAmount: number;
}

export function PaymentsStats({
  totalReceipts,
  totalVouchers,
  totalReceiptsAmount,
  totalVouchersAmount,
}: PaymentsStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="سندات القبض"
        value={totalReceipts.toString()}
        icon={Receipt}
        color="text-success"
      />
      <StatCard
        label="إجمالي القبض"
        value={`${totalReceiptsAmount.toLocaleString()} ر.س`}
        icon={Receipt}
        color="text-success"
      />
      <StatCard
        label="سندات الصرف"
        value={totalVouchers.toString()}
        icon={CreditCard}
        color="text-destructive"
      />
      <StatCard
        label="إجمالي الصرف"
        value={`${totalVouchersAmount.toLocaleString()} ر.س`}
        icon={CreditCard}
        color="text-destructive"
      />
    </div>
  );
}
