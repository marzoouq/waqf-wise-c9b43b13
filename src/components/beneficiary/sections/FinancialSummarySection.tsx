/**
 * Financial Summary Section - قسم الملخص المالي
 * يجمع البطاقات المالية الرئيسية في Grid موحد ومتجاوب
 * @version 2.9.24
 */

import { BankBalanceCard } from "@/components/shared/BankBalanceCard";
import { WaqfCorpusCard } from "@/components/shared/WaqfCorpusCard";
import { WaqfDistributionsSummaryCard } from "@/components/beneficiary/cards/WaqfDistributionsSummaryCard";

interface FinancialSummarySectionProps {
  beneficiaryId: string;
}

export function FinancialSummarySection({ beneficiaryId }: FinancialSummarySectionProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* عنوان القسم */}
      <div className="flex items-center gap-2">
        <div className="h-6 sm:h-8 w-1 bg-primary rounded-full" />
        <h2 className="text-lg sm:text-xl font-bold">الملخص المالي</h2>
      </div>

      {/* Grid البطاقات المالية - 3 أعمدة متساوية */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* الرصيد البنكي */}
        <BankBalanceCard compact />
        
        {/* رقبة الوقف */}
        <WaqfCorpusCard compact />
        
        {/* إجمالي المحصل */}
        <WaqfDistributionsSummaryCard beneficiaryId={beneficiaryId} />
      </div>
    </div>
  );
}
