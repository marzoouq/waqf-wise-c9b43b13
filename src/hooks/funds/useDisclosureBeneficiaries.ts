/**
 * Hook لجلب مستفيدي الإفصاح
 * @version 2.8.65
 * 
 * يستخدم FundService للوصول لقاعدة البيانات
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";

// ملاحظة: هذه الدالة تستخدم Supabase مباشرة لأنها
// تحتاج جدول disclosure_beneficiaries المتخصص
// سيتم نقلها إلى FundService لاحقاً

export async function getDisclosureBeneficiaries(disclosureId: string) {
  try {
    const { data, error } = await supabase
      .from("disclosure_beneficiaries")
      .select("*")
      .eq("disclosure_id", disclosureId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    productionLogger.error('Error fetching disclosure beneficiaries', error);
    throw error;
  }
}
