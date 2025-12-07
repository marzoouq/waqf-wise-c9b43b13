import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalUnits: number;
  occupancyRate: number;
  // إحصائيات الإيرادات الفعلية للسنة المالية
  totalCollected: number;      // إجمالي المحصل
  annualCollected: number;     // المحصل من العقود السنوية
  monthlyCollected: number;    // المحصل من العقود الشهرية
  totalTax: number;            // إجمالي الضريبة
  totalNetRevenue: number;     // صافي الإيرادات
  fiscalYearName: string;      // اسم السنة المالية
  // رقبة الوقف المرحلة
  carryForwardWaqfCorpus: number;
  carryForwardSourceYear: string;
  maintenanceRequests: number;
  expiringContracts: number;
  // للتوافق مع الكود السابق
  occupiedProperties: number;
  vacantProperties: number;
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
}

export function usePropertiesStats() {
  return useQuery({
    queryKey: ["properties-stats"],
    queryFn: async (): Promise<PropertyStats> => {
      // تنفيذ جميع الاستعلامات بالتوازي
      const [
        propertiesResult,
        unitsResult,
        contractsResult,
        maintenanceResult,
        fiscalYearResult,
      ] = await Promise.all([
        supabase.from("properties").select("*"),
        supabase.from("property_units").select("*"),
        supabase.from("contracts").select("*").eq("status", "نشط"),
        supabase.from("maintenance_requests").select("*").in("status", ["معلق", "قيد التنفيذ"]),
        supabase.from("fiscal_years").select("*").eq("is_active", true).single(),
      ]);

      if (propertiesResult.error) throw propertiesResult.error;
      if (unitsResult.error) throw unitsResult.error;
      if (contractsResult.error) throw contractsResult.error;
      if (maintenanceResult.error) throw maintenanceResult.error;

      const properties = propertiesResult.data;
      const units = unitsResult.data;
      const contracts = contractsResult.data;
      const maintenance = maintenanceResult.data;
      const fiscalYear = fiscalYearResult.data;

      // جلب المدفوعات الفعلية للسنة المالية الحالية
      let paymentsQuery = supabase
        .from("rental_payments")
        .select("amount_paid, tax_amount, net_amount")
        .eq("status", "مدفوع");

      if (fiscalYear) {
        paymentsQuery = paymentsQuery
          .gte("payment_date", fiscalYear.start_date)
          .lte("payment_date", fiscalYear.end_date);
      }

      const { data: payments, error: paymentsError } = await paymentsQuery;
      if (paymentsError) throw paymentsError;

      // العقود المنتهية قريباً (خلال 30 يوم)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: expiringContracts, error: expiringError } = await supabase
        .from("contracts")
        .select("*")
        .eq("status", "نشط")
        .lte("end_date", thirtyDaysFromNow.toISOString().split('T')[0]);

      if (expiringError) throw expiringError;

      // حساب الإحصائيات
      const totalProperties = properties?.length || 0;
      const activeProperties = properties?.filter(p => p.status === "مؤجر" || p.status === "active").length || 0;
      
      const totalUnits = units?.length || 0;
      const occupiedUnits = units?.filter(u => u.occupancy_status === 'مشغول').length || 0;
      const vacantUnits = totalUnits - occupiedUnits;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      // حساب الإيرادات الفعلية من المدفوعات
      const totalCollected = payments?.reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0) || 0;
      const totalTax = payments?.reduce((sum, p) => sum + (Number(p.tax_amount) || 0), 0) || 0;
      const totalNetRevenue = payments?.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0) || 0;

      // جلب تفاصيل المدفوعات حسب نوع العقد (سنوي/شهري)
      let annualCollected = 0;
      let monthlyCollected = 0;

      if (payments && payments.length > 0 && fiscalYear) {
        // جلب المدفوعات مع معلومات العقد
        const { data: paymentsWithContracts } = await supabase
          .from("rental_payments")
          .select(`
            amount_paid,
            contract_id,
            contracts!inner(payment_frequency)
          `)
          .eq("status", "مدفوع")
          .gte("payment_date", fiscalYear.start_date)
          .lte("payment_date", fiscalYear.end_date);

        if (paymentsWithContracts) {
          interface PaymentWithContract {
            amount_paid: number | null;
            contract_id: string | null;
            contracts: { payment_frequency: string | null } | null;
          }
          
          (paymentsWithContracts as PaymentWithContract[]).forEach((p) => {
            const amount = Number(p.amount_paid) || 0;
            if (p.contracts?.payment_frequency === 'شهرية') {
              monthlyCollected += amount;
            } else {
              annualCollected += amount;
            }
          });
        }
      }

      // جلب رقبة الوقف المرحلة من السنة السابقة
      let carryForwardWaqfCorpus = 0;
      const carryForwardSourceYear = "2024-2025";

      if (fiscalYear) {
        const { data: waqfReserve } = await supabase
          .from("waqf_reserves")
          .select("current_balance")
          .eq("fiscal_year_id", fiscalYear.id)
          .eq("reserve_type", "احتياطي")
          .single();

        carryForwardWaqfCorpus = waqfReserve?.current_balance || 0;
      }

      // اسم السنة المالية
      const fiscalYearName = fiscalYear?.name || "غير محدد";

      return {
        totalProperties,
        activeProperties,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate,
        totalCollected,
        annualCollected,
        monthlyCollected,
        totalTax,
        totalNetRevenue,
        fiscalYearName,
        carryForwardWaqfCorpus,
        carryForwardSourceYear,
        maintenanceRequests: maintenance?.length || 0,
        expiringContracts: expiringContracts?.length || 0,
        occupiedProperties: contracts?.length || occupiedUnits,
        vacantProperties: totalProperties - (contracts?.length || 0),
        // للتوافق مع الكود السابق
        totalMonthlyRevenue: totalCollected,
        totalAnnualRevenue: totalCollected,
      };
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
