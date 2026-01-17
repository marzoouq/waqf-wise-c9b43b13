/**
 * useAuditChartData Hook - بيانات الرسوم البيانية للتدقيق
 * @version 1.0.0
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export interface DailyActivityData {
  date: string;
  dateLabel: string;
  insert: number;
  update: number;
  delete: number;
  total: number;
}

export interface CategoryData {
  category: string;
  categoryLabel: string;
  count: number;
  percentage: number;
  color: string;
}

export interface HourlyActivityData {
  hour: number;
  hourLabel: string;
  count: number;
}

// تصنيفات الجداول
const TABLE_CATEGORIES: Record<string, { label: string; color: string }> = {
  financial: { label: "مالية", color: "#10B981" },
  beneficiaries: { label: "مستفيدون", color: "#3B82F6" },
  properties: { label: "عقارات", color: "#8B5CF6" },
  governance: { label: "حوكمة", color: "#F59E0B" },
  users: { label: "مستخدمون", color: "#EF4444" },
  system: { label: "نظام", color: "#6B7280" },
};

const TABLE_TO_CATEGORY: Record<string, string> = {
  // مالية
  journal_entries: "financial",
  journal_entry_lines: "financial",
  payment_vouchers: "financial",
  bank_accounts: "financial",
  bank_transfers: "financial",
  bank_transactions: "financial",
  invoices: "financial",
  funds: "financial",
  distributions: "financial",
  loans: "financial",
  loan_payments: "financial",
  budgets: "financial",
  fiscal_years: "financial",
  // مستفيدون
  beneficiaries: "beneficiaries",
  beneficiary_requests: "beneficiaries",
  beneficiary_attachments: "beneficiaries",
  families: "beneficiaries",
  heir_distributions: "beneficiaries",
  // عقارات
  properties: "properties",
  property_units: "properties",
  contracts: "properties",
  tenants: "properties",
  maintenance_requests: "properties",
  rental_payments: "properties",
  // حوكمة
  governance_decisions: "governance",
  governance_votes: "governance",
  approvals: "governance",
  annual_disclosures: "governance",
  // مستخدمون
  user_roles: "users",
  profiles: "users",
  // نظام
  system_settings: "system",
  notifications: "system",
  audit_logs: "system",
};

/**
 * جلب بيانات النشاط اليومي (آخر 7 أيام)
 */
export const useDailyActivityData = (days: number = 7) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'daily-activity', days],
    queryFn: async (): Promise<DailyActivityData[]> => {
      const startDate = startOfDay(subDays(new Date(), days - 1));
      
      const { data, error } = await supabase
        .from("audit_logs")
        .select("action_type, created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // تجميع حسب اليوم
      const dailyMap = new Map<string, DailyActivityData>();
      
      // إنشاء أيام فارغة
      for (let i = 0; i < days; i++) {
        const date = subDays(new Date(), days - 1 - i);
        const dateKey = format(date, 'yyyy-MM-dd');
        dailyMap.set(dateKey, {
          date: dateKey,
          dateLabel: format(date, 'EEE dd/MM'),
          insert: 0,
          update: 0,
          delete: 0,
          total: 0,
        });
      }

      // ملء البيانات
      data?.forEach(log => {
        const dateKey = format(new Date(log.created_at), 'yyyy-MM-dd');
        const entry = dailyMap.get(dateKey);
        if (entry) {
          entry.total++;
          if (log.action_type === 'INSERT') entry.insert++;
          else if (log.action_type === 'UPDATE') entry.update++;
          else if (log.action_type === 'DELETE') entry.delete++;
        }
      });

      return Array.from(dailyMap.values());
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * جلب بيانات التصنيفات
 */
export const useCategoryData = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'category-data'],
    queryFn: async (): Promise<CategoryData[]> => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 7);

      const { data, error } = await supabase
        .from("audit_logs")
        .select("table_name")
        .gte("created_at", yesterday.toISOString())
        .not("table_name", "is", null);

      if (error) throw error;

      // تجميع حسب الفئة
      const categoryCount = new Map<string, number>();
      let total = 0;

      data?.forEach(log => {
        const category = TABLE_TO_CATEGORY[log.table_name || ""] || "system";
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
        total++;
      });

      return Object.entries(TABLE_CATEGORIES).map(([key, { label, color }]) => ({
        category: key,
        categoryLabel: label,
        count: categoryCount.get(key) || 0,
        percentage: total > 0 ? Math.round(((categoryCount.get(key) || 0) / total) * 100) : 0,
        color,
      })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * جلب بيانات النشاط بالساعة
 */
export const useHourlyActivityData = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'hourly-activity'],
    queryFn: async (): Promise<HourlyActivityData[]> => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const { data, error } = await supabase
        .from("audit_logs")
        .select("created_at")
        .gte("created_at", yesterday.toISOString());

      if (error) throw error;

      // تجميع حسب الساعة
      const hourlyMap = new Map<number, number>();
      
      // إنشاء كل الساعات
      for (let i = 0; i < 24; i++) {
        hourlyMap.set(i, 0);
      }

      data?.forEach(log => {
        const hour = new Date(log.created_at).getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      });

      return Array.from(hourlyMap.entries()).map(([hour, count]) => ({
        hour,
        hourLabel: `${hour.toString().padStart(2, '0')}:00`,
        count,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * الفئات المتاحة للفلترة
 */
export const useAuditCategories = () => {
  return {
    categories: TABLE_CATEGORIES,
    tableToCategory: TABLE_TO_CATEGORY,
  };
};
