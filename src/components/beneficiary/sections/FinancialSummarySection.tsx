/**
 * Financial Summary Section - قسم الملخص المالي
 * يجمع البطاقات المالية الرئيسية في Grid موحد ومتجاوب
 * @version 2.8.72
 */

import { BankBalanceCard } from "@/components/shared/BankBalanceCard";
import { WaqfCorpusCard } from "@/components/shared/WaqfCorpusCard";
import { WaqfDistributionsSummaryCard } from "@/components/beneficiary/cards/WaqfDistributionsSummaryCard";

interface FinancialSummarySectionProps {
  beneficiaryId: string;
}

export function FinancialSummarySection({ beneficiaryId }: FinancialSummarySectionProps) {
  return (
    <div className="space-y-4">
      {/* عنوان القسم */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-1 bg-primary rounded-full" />
        <h2 className="text-xl font-bold">الملخص المالي</h2>
      </div>

      {/* Grid البطاقات المالية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* الرصيد البنكي */}
        <BankBalanceCard compact />
        
        {/* رقبة الوقف */}
        <WaqfCorpusCard compact />
        
        {/* إجمالي المحصل - يمتد على عمودين في الشاشات الكبيرة */}
        <div className="sm:col-span-2 lg:col-span-1">
          <WaqfDistributionsSummaryCard beneficiaryId={beneficiaryId} />
        </div>
      </div>
    </div>
  );
}
