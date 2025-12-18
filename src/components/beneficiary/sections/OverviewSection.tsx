/**
 * OverviewSection Component
 * قسم نظرة عامة في لوحة الورثة
 */

import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import type { Beneficiary } from "@/types/beneficiary";
import {
  BeneficiaryProfileCard,
  AnnualDisclosureCard,
  PropertyStatsCards,
  ActivityTimeline,
  YearlyComparison,
} from "@/components/beneficiary";
import { FinancialSummarySection } from "@/components/beneficiary/sections/FinancialSummarySection";
import { QuickActionsGrid } from "@/components/beneficiary/sections/QuickActionsGrid";

const LazyChatbotQuickCard = lazy(() => 
  import("@/components/dashboard/ChatbotQuickCard").then(m => ({ default: m.ChatbotQuickCard }))
);

interface OverviewSectionProps {
  beneficiary: Beneficiary;
}

export function OverviewSection({ beneficiary }: OverviewSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* ==================== القسم الأول: الترحيب والمعلومات الشخصية ==================== */}
      <div className="space-y-4">
        <BeneficiaryProfileCard
          beneficiary={beneficiary}
          onMessages={() => navigate("/messages")}
          onChangePassword={() => navigate("/beneficiary-portal?tab=profile")}
        />
      </div>

      {/* ==================== القسم الثاني: الأرقام المالية الرئيسية ==================== */}
      <FinancialSummarySection beneficiaryId={beneficiary.id} />

      {/* ==================== القسم الثالث: العقارات والإيرادات ==================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-xl font-bold">العقارات والإيرادات</h2>
        </div>
        <PropertyStatsCards />
      </div>

      {/* ==================== القسم الرابع: الإجراءات السريعة والتحليلات ==================== */}
      <div className="space-y-6">
        <QuickActionsGrid />
        <AnnualDisclosureCard />
        
        <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
          <LazyChatbotQuickCard />
        </Suspense>

        <YearlyComparison beneficiaryId={beneficiary.id} />
        <ActivityTimeline beneficiaryId={beneficiary.id} />
      </div>
    </div>
  );
}
