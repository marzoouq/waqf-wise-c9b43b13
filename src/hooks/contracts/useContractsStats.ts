import { useMemo } from "react";
import { type Contract } from "@/hooks/property/useContracts";
import { differenceInDays } from "date-fns";

interface ContractsStats {
  total: number;
  active: number;
  draft: number;
  expired: number;
  readyForRenewal: number;
  autoRenewing: number;
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
}

export function useContractsStats(contracts: Contract[] | undefined): ContractsStats {
  return useMemo(() => {
    if (!contracts || contracts.length === 0) {
      return {
        total: 0,
        active: 0,
        draft: 0,
        expired: 0,
        readyForRenewal: 0,
        autoRenewing: 0,
        totalMonthlyRevenue: 0,
        totalAnnualRevenue: 0,
      };
    }

    const now = new Date();

    const stats = contracts.reduce(
      (acc, contract) => {
        // حساب الإحصائيات
        acc.total++;

        // العقود النشطة
        if (contract.status === "نشط") {
          acc.active++;
          
          // جاهز للتجديد (ينتهي خلال 60 يوم)
          const endDate = new Date(contract.end_date);
          const daysUntilExpiry = differenceInDays(endDate, now);
          if (daysUntilExpiry <= 60 && daysUntilExpiry > 0) {
            acc.readyForRenewal++;
          }
          
          // العقود المتجددة تلقائياً
          if ((contract as any).auto_renew_enabled) {
            acc.autoRenewing++;
          }
        }

        // العقود المسودة
        if (contract.status === "مسودة" || contract.status === "draft") {
          acc.draft++;
        }

        // العقود المنتهية
        if (contract.status === "منتهي" || contract.status === "expired") {
          acc.expired++;
        }

        // حساب الإيرادات
        if (contract.status === "نشط") {
          const rent = Number(contract.monthly_rent) || 0;
          const frequency = contract.payment_frequency;

          if (frequency === "سنوي" || frequency === "annual") {
            acc.totalMonthlyRevenue += rent / 12;
            acc.totalAnnualRevenue += rent;
          } else if (frequency === "ربع سنوي" || frequency === "quarterly") {
            acc.totalMonthlyRevenue += rent / 3;
            acc.totalAnnualRevenue += rent * 4;
          } else {
            // شهري
            acc.totalMonthlyRevenue += rent;
            acc.totalAnnualRevenue += rent * 12;
          }
        }

        return acc;
      },
      {
        total: 0,
        active: 0,
        draft: 0,
        expired: 0,
        readyForRenewal: 0,
        autoRenewing: 0,
        totalMonthlyRevenue: 0,
        totalAnnualRevenue: 0,
      }
    );

    return stats;
  }, [contracts]);
}
