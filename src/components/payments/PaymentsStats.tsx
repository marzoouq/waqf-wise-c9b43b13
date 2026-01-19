import { Receipt, CreditCard } from "lucide-react";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";

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
    <UnifiedStatsGrid columns={4}>
      <UnifiedKPICard
        title="سندات القبض"
        value={totalReceipts}
        icon={Receipt}
        variant="success"
      />
      <UnifiedKPICard
        title="إجمالي القبض"
        value={`${totalReceiptsAmount.toLocaleString()} ر.س`}
        icon={Receipt}
        variant="success"
      />
      <UnifiedKPICard
        title="سندات الصرف"
        value={totalVouchers}
        icon={CreditCard}
        variant="destructive"
      />
      <UnifiedKPICard
        title="إجمالي الصرف"
        value={`${totalVouchersAmount.toLocaleString()} ر.س`}
        icon={CreditCard}
        variant="destructive"
      />
    </UnifiedStatsGrid>
  );
}
