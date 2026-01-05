/**
 * OverviewSection Component
 * قسم نظرة عامة في لوحة الورثة - تصميم محسّن
 */

import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import type { Beneficiary } from "@/types/beneficiary";
import {
  AnnualDisclosureCard,
  PropertyStatsCards,
  ActivityTimeline,
  YearlyComparison,
} from "@/components/beneficiary";
import { FinancialSummarySection } from "@/components/beneficiary/sections/FinancialSummarySection";
import { QuickActionsGrid } from "@/components/beneficiary/sections/QuickActionsGrid";
import { WelcomeCard } from "@/components/beneficiary/cards/WelcomeCard";
import { AlertsCard } from "@/components/beneficiary/cards/AlertsCard";
import { AnnualShareCard } from "@/components/beneficiary/cards/AnnualShareCard";
import { motion } from "framer-motion";

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
      {/* ==================== القسم الأول: الترحيب الذكي ==================== */}
      <WelcomeCard beneficiary={beneficiary} />

      {/* ==================== القسم الثاني: التنبيهات والحصة السنوية ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AlertsCard beneficiaryId={beneficiary.id} />
        <AnnualShareCard beneficiaryId={beneficiary.id} />
      </div>

      {/* ==================== القسم الثالث: الأرقام المالية الرئيسية ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <FinancialSummarySection beneficiaryId={beneficiary.id} />
      </motion.div>

      {/* ==================== القسم الرابع: الإجراءات السريعة ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <QuickActionsGrid />
      </motion.div>

      {/* ==================== القسم الخامس: العقارات والإيرادات ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-xl font-bold">العقارات والإيرادات</h2>
        </div>
        <PropertyStatsCards />
      </motion.div>

      {/* ==================== القسم السادس: التحليلات والمعلومات الإضافية ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="space-y-6"
      >
        <AnnualDisclosureCard />
        
        <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
          <LazyChatbotQuickCard />
        </Suspense>

        <YearlyComparison beneficiaryId={beneficiary.id} />
        <ActivityTimeline beneficiaryId={beneficiary.id} />
      </motion.div>
    </div>
  );
}
