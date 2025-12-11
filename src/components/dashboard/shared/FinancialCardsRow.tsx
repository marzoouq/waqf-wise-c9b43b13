/**
 * FinancialCardsRow - صف البطاقات المالية الموحد
 * @version 1.0.0
 */

import { BankBalanceCard } from "@/components/shared/BankBalanceCard";
import { WaqfCorpusCard } from "@/components/shared/WaqfCorpusCard";
import { POSQuickAccessCard } from "@/components/pos";
import { cn } from "@/lib/utils";

interface FinancialCardsRowProps {
  showPOS?: boolean;
  className?: string;
}

export function FinancialCardsRow({ showPOS = true, className }: FinancialCardsRowProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6",
        showPOS ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2",
        className
      )}
    >
      <BankBalanceCard />
      <WaqfCorpusCard />
      {showPOS && <POSQuickAccessCard />}
    </div>
  );
}
